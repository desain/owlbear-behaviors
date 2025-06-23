import { DO_NOTHING } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import "../blockly/blocks";
import { CollisionEngine } from "../collision/CollisionEngine";
import { METADATA_KEY_BEHAVIORS } from "../constants";
import {
    usePlayerStorage,
    type BehaviorItemMap,
} from "../state/usePlayerStorage";
import { diffItemSets } from "../watcher/diffItemSets";
import { EffectsWatcher } from "../watcher/EffectsWatcher";
import { Watcher } from "../watcher/Watcher";
import { BEHAVIOR_REGISTRY, type NewBehaviorConfig } from "./BehaviorRegistry";

function handleItemsChange(
    watcher: Watcher,
    collisionEngine: CollisionEngine,
    oldItems: BehaviorItemMap,
    newItems: BehaviorItemMap,
) {
    const diff = diffItemSets(oldItems, newItems);
    void watcher.handleGlobalItemsUpdate(diff);
    const { newCollisions, finishedCollisions } =
        collisionEngine.handleGlobalItemsUpdate(diff);

    // Default to stopping everything, and exempt items that have not changed.
    // This ensures that items that are deleted or have changed behavior
    // are stopped, while items that have not changed continue to run.
    const toStop = BEHAVIOR_REGISTRY.getBehaviorItemIds();
    const newBehaviors: NewBehaviorConfig[] = [];
    const moved: BehaviorItem["id"][] = [];
    const propertyChanges: Parameters<
        (typeof BEHAVIOR_REGISTRY)["handlePropertyChange"]
    >[] = [];

    for (const item of newItems.values()) {
        const oldItem = oldItems.get(item.id);

        // Skip items with no behavior
        if (!item.metadata[METADATA_KEY_BEHAVIORS]) {
            continue;
        }

        // Check if behavior was updated
        const lastKnownModified =
            oldItem?.metadata?.[METADATA_KEY_BEHAVIORS]?.lastModified ??
            -Infinity;
        const actualLastModified =
            item.metadata[METADATA_KEY_BEHAVIORS].lastModified;
        if (actualLastModified <= lastKnownModified) {
            // No change in behavior, so skip
            toStop.delete(item.id);
        } else {
            // we do want to stop the old immediate execution
            // and start a new one
            newBehaviors.push({
                item: item,
                lastModified: actualLastModified,
                serializedWorkspace:
                    item.metadata[METADATA_KEY_BEHAVIORS].workspace,
            });
        }

        // Check if properties changed
        if (oldItem) {
            if (
                oldItem.position.x !== item.position.x ||
                oldItem.position.y !== item.position.y
            ) {
                moved.push(item.id);
                propertyChanges.push([item.id, "position"]);
            }

            for (const key of ["visible", "locked", "layer"] as const) {
                if (oldItem[key] !== item[key]) {
                    propertyChanges.push([item.id, key, item[key]]);
                }
            }
        }
    }

    for (const id of toStop) {
        BEHAVIOR_REGISTRY.stopBehaviorsForItem(id);
    }

    for (const newBehavior of newBehaviors) {
        BEHAVIOR_REGISTRY.startBehavior(newBehavior);
    }

    for (const propertyChange of propertyChanges) {
        BEHAVIOR_REGISTRY.handlePropertyChange(...propertyChange);
    }

    // if (newCollisions.length > 0) {
    //     console.log("newCollisions", newCollisions);
    // }
    for (const newCollision of newCollisions) {
        BEHAVIOR_REGISTRY.handleCollisionUpdate(newCollision, true);
    }

    // if (finishedCollisions.length > 0) {
    //     console.log("finishedCollision", finishedCollisions);
    // }
    for (const finishedCollision of finishedCollisions) {
        BEHAVIOR_REGISTRY.handleCollisionUpdate(finishedCollision, false);
    }
}

export function installBehaviorRunner() {
    const state = usePlayerStorage.getState();
    if (state.role !== "GM") {
        return DO_NOTHING; // Player instance does not run behaviors
    }

    const watcher = new Watcher();
    const collisionEngine = new CollisionEngine();
    watcher.addWatcher(EffectsWatcher);
    BEHAVIOR_REGISTRY.stopAll();

    handleItemsChange(
        watcher,
        collisionEngine,
        new Map(),
        state.itemsOfInterest,
    );
    const stopWatchingItemsChange = usePlayerStorage.subscribe(
        (store) => store.itemsOfInterest,
        (newItems, oldItems) =>
            handleItemsChange(watcher, collisionEngine, oldItems, newItems),
    );
    return () => {
        stopWatchingItemsChange();
        BEHAVIOR_REGISTRY.stopAll();
    };
}
