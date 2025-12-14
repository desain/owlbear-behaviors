import { type Item } from "@owlbear-rodeo/sdk";
import type { Block } from "blockly";
import * as Blockly from "blockly";
import { executeObrFunction } from "owlbear-utils";
import { type BehaviorItem } from "../BehaviorItem";
import { BehaviorJavascriptGenerator } from "../blockly/generator/BehaviorJavascriptGenerator";
import {
    loadBehaviorsWorkspace,
    type SerializedWorkspace,
} from "../blockly/serialization/workspaceAdapter";
import type { Collision } from "../collision/CollisionEngine";
import { FIELD_BROADCAST, FIELD_TAG, METADATA_KEY_CLONE } from "../constants";
import type { BonesRoll } from "../extensions/Bones";
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
    readonly serializedWorkspace: SerializedWorkspace;
}

function executeTriggerHandler(
    handler: TriggerHandler,
    other?: BehaviorItem["id"],
) {
    // If the behavior is already running, abort it
    handler.abortController?.abort(`New instance of trigger received`);

    // Create a new abort controller for the new execution
    handler.abortController = new AbortController();

    void handler.behaviorFunction(
        handler.abortController.signal,
        handler.hatBlockId,
        other,
    );
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
    readonly #triggerHandlers = new Map<Item["id"], TriggerHandler[]>();

    readonly getBehaviorItemIds = (): Set<Item["id"]> =>
        new Set(this.#triggerHandlers.keys());

    readonly stopAll = () => {
        this.#triggerHandlers.forEach((handlers) => {
            handlers.forEach(({ abortController }) => {
                abortController?.abort("Behavior registry: stop all");
            });
        });
        this.#triggerHandlers.clear();
    };

    readonly stopBehaviorsForItem = (
        itemId: Item["id"],
        exceptionHatBlockId?: Block["id"],
    ) => {
        const handlerToSave = this.#triggerHandlers
            .get(itemId)
            ?.find(({ hatBlockId }) => hatBlockId === exceptionHatBlockId);

        // Stop trigger handlers
        this.#triggerHandlers
            .get(itemId)
            ?.forEach(({ hatBlockId, abortController }) => {
                if (hatBlockId !== exceptionHatBlockId) {
                    abortController?.abort("Item deleted or behavior changed");
                }
            });

        if (handlerToSave) {
            this.#triggerHandlers.set(itemId, [handlerToSave]);
        } else {
            this.#triggerHandlers.delete(itemId);
        }
    };

    readonly startBehavior = ({
        item,
        serializedWorkspace,
    }: NewBehaviorConfig) => {
        this.stopBehaviorsForItem(item.id);

        // Create a workspace and load blocks
        const workspace = new Blockly.Workspace();
        loadBehaviorsWorkspace(serializedWorkspace, workspace);
        void addMissingResources(workspace);

        // Generate code
        const code = new BehaviorJavascriptGenerator().workspaceToCode(
            workspace,
        );
        const defineBehaviors = compileBehavior(code);

        // Install behaviors
        const triggerHandlers = executeObrFunction(
            defineBehaviors,
            item.id,
            BEHAVIORS_IMPL,
            ItemProxy.getInstance(),
            this.#globals,
            this,
        );
        this.#triggerHandlers.set(item.id, triggerHandlers);

        // Start immediate behaviors
        triggerHandlers
            .filter((handler) => handler.type === "immediately")
            .forEach((handler) => executeTriggerHandler(handler));

        // Start clone behaviors if this item is a clone
        if (item.metadata[METADATA_KEY_CLONE]) {
            triggerHandlers
                .filter((handler) => handler.type === "startAsClone")
                .forEach((handler) => executeTriggerHandler(handler));
        }
    };

    readonly handleBroadcast = (
        message: string,
        targets?: readonly Item["id"][],
    ) => {
        if (targets) {
            for (const target of targets) {
                this.#triggerHandlers
                    .get(target)
                    ?.filter(
                        (handler) =>
                            handler.type === "broadcast" &&
                            handler.broadcast === message,
                    )
                    .forEach((handler) => executeTriggerHandler(handler));
            }
        } else {
            this.#triggerHandlers.forEach((handlers) => {
                handlers
                    .filter(
                        (handler) =>
                            handler.type === "broadcast" &&
                            handler.broadcast === message,
                    )
                    .forEach((handler) => executeTriggerHandler(handler));
            });
        }
    };

    readonly handleContextMenuClicked = (
        itemIds: string[],
        menuName: string,
    ) => {
        itemIds.forEach((itemId) =>
            this.#triggerHandlers
                .get(itemId)
                ?.filter((handler) => handler.type === "context_menu")
                .filter((handler) => handler.menuName === menuName)
                .forEach((handler) => executeTriggerHandler(handler)),
        );
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

    readonly handleClashHpChange = (itemId: string) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter((handler) => handler.type === "clash_hp_change")
            ?.forEach((handler) => executeTriggerHandler(handler));

    readonly handleBonesRoll = (roll: BonesRoll) => {
        this.#triggerHandlers.forEach((handlers) => {
            handlers
                .filter((handler) => handler.type === "bones_roll")
                .filter(
                    (handler) =>
                        (handler.dieType === "ANY" ||
                            handler.dieType === roll.type) &&
                        handler.value === roll.value,
                )
                .forEach((handler) => executeTriggerHandler(handler));
        });
    };

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

    readonly handlePhaseChange = (phaseName: string, phaseValue: number) => {
        this.#triggerHandlers.forEach((handlers) =>
            handlers
                .filter((handler) => handler.type === "phase_change")
                .filter(
                    (handler) =>
                        handler.name === phaseName &&
                        (handler.phase === undefined ||
                            handler.phase === phaseValue),
                )
                .forEach((handler) => executeTriggerHandler(handler)),
        );
    };

    readonly handleSmokeSpectreDoorChange = (
        itemId: string,
        doorOpen: boolean,
    ) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter((handler) => handler.type === "smoke_spectre_door")
            ?.filter((handler) => handler.doorState === doorOpen)
            ?.forEach((handler) => executeTriggerHandler(handler));

    readonly handlePrettySordidTurnChange = (
        itemId: string,
        turnState: boolean,
    ) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter((handler) => handler.type === "pretty_turn_change")
            ?.filter((handler) => handler.turnState === turnState)
            ?.forEach((handler) => executeTriggerHandler(handler));
}
