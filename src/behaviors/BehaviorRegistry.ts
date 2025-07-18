import type { Item } from "@owlbear-rodeo/sdk";
import * as Blockly from "blockly";
import { executeObrFunction } from "owlbear-utils";
import { type BehaviorItem } from "../BehaviorItem";
import { BehaviorJavascriptGenerator } from "../blockly/BehaviorJavascriptGenerator";
import type { Collision } from "../collision/CollisionEngine";
import { FIELD_BROADCAST, FIELD_TAG, METADATA_KEY_CLONE } from "../constants";
import { addBroadcasts, addTags } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { BEHAVIORS_IMPL } from "./BehaviorImpl";
import { compileBehavior } from "./compileBehavior";
import { ItemProxy } from "./ItemProxy";
import {
    propertyChangeTriggers,
    type PropertyChanged,
    type TriggerHandler,
} from "./TriggerHandler";

type VariableValue = string | number | boolean;
export type BehaviorGlobals = Record<string, VariableValue | VariableValue[]>;

export interface NewBehaviorConfig {
    readonly item: BehaviorItem;
    readonly lastModified: number;
    readonly serializedWorkspace: object;
}

function executeTriggerHandler(
    handler: TriggerHandler,
    other?: BehaviorItem["id"],
) {
    // If the behavior is already running, abort it
    handler.abortController?.abort(`New instance of trigger received`);

    // Create a new abort controller for the new execution
    handler.abortController = new AbortController();

    void handler.behaviorFunction(handler.abortController.signal, other);
}

/**
 * If this workspace came from a prefab, it might refer to resources that
 * don't exist in the scene. The resources should be created
 * so the editor displays them when the user opens it.
 */
async function addMissingResources(workspace: Blockly.Workspace) {
    const extantTags = new Set(usePlayerStorage.getState().sceneMetadata.tags);
    const newTags = workspace
        .getAllBlocks()
        .map((block) => block.getFieldValue(FIELD_TAG) as string | null)
        .filter((tag) => tag !== null)
        .filter((tag) => !extantTags.has(tag));
    if (newTags.length > 0) {
        await addTags(...newTags);
    }

    const extantBroadcasts = new Set(
        usePlayerStorage.getState().sceneMetadata.broadcasts,
    );
    const newBroadcasts = workspace
        .getAllBlocks()
        .map((block) => block.getFieldValue(FIELD_BROADCAST) as string | null)
        .filter((broadcast) => broadcast !== null)
        .filter((broadcast) => !extantBroadcasts.has(broadcast));
    if (newBroadcasts.length > 0) {
        await addBroadcasts(...newBroadcasts);
    }
}

export class BehaviorRegistry {
    readonly #globals: BehaviorGlobals = {};
    readonly #immediateExecutions = new Map<Item["id"], AbortController[]>();
    readonly #triggerHandlers = new Map<Item["id"], TriggerHandler[]>();

    readonly getBehaviorItemIds = () =>
        new Set([
            ...this.#immediateExecutions.keys(),
            ...this.#triggerHandlers.keys(),
        ]);

    readonly stopAll = () => {
        [...this.#immediateExecutions.values()]
            .flat()
            .forEach((abortController) =>
                abortController.abort("Behavior registry: stop all"),
            );
        this.#immediateExecutions.clear();

        this.#triggerHandlers.forEach((handlers) => {
            handlers.forEach(({ abortController }) => {
                abortController?.abort("Behavior registry: stop all");
            });
        });
        this.#triggerHandlers.clear();
    };

    readonly stopBehaviorsForItem = (itemId: Item["id"]) => {
        // Stop immediate behaviors
        this.#immediateExecutions
            .get(itemId)
            ?.forEach((abortController) =>
                abortController.abort("Item deleted or behavior changed"),
            );
        this.#immediateExecutions.delete(itemId);

        // Stop trigger handlers
        this.#triggerHandlers.get(itemId)?.forEach(({ abortController }) => {
            abortController?.abort("Item deleted or behavior changed");
        });
        this.#triggerHandlers.delete(itemId);
    };

    readonly startBehavior = ({
        item,
        serializedWorkspace,
    }: NewBehaviorConfig) => {
        this.stopBehaviorsForItem(item.id);

        // Create a workspace and load blocks
        const workspace = new Blockly.Workspace();
        Blockly.serialization.workspaces.load(serializedWorkspace, workspace);
        void addMissingResources(workspace);

        // Generate code
        const code = new BehaviorJavascriptGenerator().workspaceToCode(
            workspace,
        );
        const defineBehaviors = compileBehavior(code);

        // Install behaviors
        const behaviorDefinition = executeObrFunction(
            defineBehaviors,
            item.id,
            BEHAVIORS_IMPL,
            ItemProxy.getInstance(),
            this.#globals,
            this,
        );
        this.#triggerHandlers.set(item.id, behaviorDefinition.triggerHandlers);

        // Start immediate behaviors
        const immediateExecutions = behaviorDefinition.immediately.map(
            (behaviorFunction) => {
                const abortController = new AbortController();
                void behaviorFunction(abortController.signal);
                return abortController;
            },
        );

        // Start clone behaviors if this item is a clone
        if (item.metadata[METADATA_KEY_CLONE]) {
            const cloneExecutions = behaviorDefinition.startAsClone.map(
                (behaviorFunction) => {
                    const abortController = new AbortController();
                    void behaviorFunction(abortController.signal);
                    return abortController;
                },
            );
            immediateExecutions.push(...cloneExecutions);
        }

        this.#immediateExecutions.set(item.id, immediateExecutions);
    };

    readonly handleBroadcast = (broadcast: string) => {
        this.#triggerHandlers.forEach((handlers) => {
            handlers
                .filter(
                    (handler) =>
                        handler.type === "broadcast" &&
                        handler.broadcast === broadcast,
                )
                .forEach((handler) => executeTriggerHandler(handler));
        });
    };

    readonly handlePropertyChange = <K extends keyof BehaviorItem>(
        itemId: string,
        property: K,
        newValue: BehaviorItem[K],
    ) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter(
                (handler) =>
                    handler.type === property &&
                    propertyChangeTriggers(
                        // typescript isn't smart enough to figure out the above check narrows down this type
                        handler as PropertyChanged<K>,
                        newValue,
                    ),
            )
            ?.forEach((handler) => executeTriggerHandler(handler));

    readonly handleNewSelection = (
        newlySelected: Iterable<string>,
        deselected: Iterable<string>,
    ) => {
        for (const id of newlySelected) {
            this.#triggerHandlers
                .get(id)
                ?.filter((handler) => handler.type === "selected")
                ?.filter((handler) => handler.selectedState)
                ?.forEach((handler) => executeTriggerHandler(handler));
        }
        for (const id of deselected) {
            this.#triggerHandlers
                .get(id)
                ?.filter((handler) => handler.type === "selected")
                ?.filter((handler) => !handler.selectedState)
                ?.forEach((handler) => executeTriggerHandler(handler));
        }
    };

    readonly handleGrimoireHpChange = (itemId: string) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter((handler) => handler.type === "grimoire_hp_change")
            ?.forEach((handler) => executeTriggerHandler(handler));

    /**
     * @param started Ture if new collision, false if finished collision.
     */
    readonly handleCollisionUpdate = ([a, b]: Collision, started: boolean) =>
        [[a, b] as const, [b, a] as const].forEach(([a, b]) =>
            this.#triggerHandlers
                .get(a)
                ?.filter((handler) => handler.type === "collision")
                // Typescript can't figure out the type narrowing if I put both conditions in the same filter
                ?.filter((handler) => handler.start === started)
                ?.forEach((handler) => executeTriggerHandler(handler, b)),
        );
}
