import type { Item } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import * as Blockly from "blockly";
import { executeObrFunction } from "owlbear-utils";
import { type BehaviorItem } from "../BehaviorItem";
import { BehaviorJavascriptGenerator } from "../blockly/BehaviorJavascriptGenerator";
import type { Collision } from "../collision/CollisionEngine";
import { BEHAVIORS_IMPL } from "./BehaviorImpl";
import { compileBehavior } from "./compileBehavior";
import { ItemProxy } from "./ItemProxy";
import type { TriggerHandler } from "./TriggerHandler";

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

class BehaviorRegistry {
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
                abortController.abort("Behavior registry cleared"),
            );
        this.#immediateExecutions.clear();

        this.#triggerHandlers.forEach((handlers) => {
            handlers.forEach(({ abortController }) => {
                abortController?.abort("Behavior registry cleared");
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
        this.#immediateExecutions.set(item.id, immediateExecutions);
    };

    readonly handleBroadcast = (broadcast: string) => {
        this.#triggerHandlers.forEach(async (handlers, itemId) => {
            const [item] = await OBR.scene.items.getItems<BehaviorItem>([
                itemId,
            ]);
            if (!item) {
                // console.warn("broadcast to deleted item", itemId);
                this.stopBehaviorsForItem(itemId);
                return;
            }

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
        newValue?: BehaviorItem[K],
    ) =>
        this.#triggerHandlers
            .get(itemId)
            ?.filter(
                (handler) =>
                    handler.type === property &&
                    (handler.newValue === undefined ||
                        handler.newValue === newValue),
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

export const BEHAVIOR_REGISTRY = new BehaviorRegistry();
