import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll, diffItems } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import "../blockly/blocks";
import { CollisionEngine } from "../collision/CollisionEngine";
import { METADATA_KEY_BEHAVIORS } from "../constants";
import { Clash } from "../extensions/Clash";
import { Grimoire } from "../extensions/Grimoire";
import { Phases } from "../extensions/Phases";
import { PrettySordid } from "../extensions/PrettySordid";
import { SmokeAndSpectre } from "../extensions/SmokeAndSpectre";
import {
    usePlayerStorage,
    type BehaviorItemMap,
    type OwlbearStore,
} from "../state/usePlayerStorage";
import { EffectsWatcher } from "../watcher/EffectsWatcher";
import { Watcher } from "../watcher/Watcher";
import {
    type BehaviorRegistry,
    type NewBehaviorConfig,
} from "./BehaviorRegistry";

function handleItemsChange(
    behaviorRegistry: BehaviorRegistry,
    watcher: Watcher,
    collisionEngine: CollisionEngine,
    oldItems: BehaviorItemMap,
    newItems: BehaviorItemMap,
) {
    const diff = diffItems(oldItems, newItems);
    void watcher.handleGlobalItemsUpdate(diff);
    const { newCollisions, finishedCollisions } =
        collisionEngine.handleGlobalItemsUpdate(diff);

    // Default to stopping everything, and exempt items that have not changed.
    // This ensures that items that are deleted or have changed behavior
    // are stopped, while items that have not changed continue to run.
    const toStop = behaviorRegistry.getBehaviorItemIds();
    const newBehaviors: NewBehaviorConfig[] = [];
    const moved: BehaviorItem["id"][] = [];
    const propertyChanges: Parameters<
        BehaviorRegistry["handlePropertyChange"]
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
                propertyChanges.push([item.id, "position", item.position]);
            }

            for (const key of [
                "visible",
                "locked",
                "layer",
                "rotation",
                "attachedTo",
            ] as const) {
                if (oldItem[key] !== item[key]) {
                    propertyChanges.push([item.id, key, item[key]]);
                }
            }

            // Check for Grimoire HP changes
            if (Grimoire.hasData(oldItem) && Grimoire.hasData(item)) {
                const oldHp = Grimoire.getHp(oldItem);
                const newHp = Grimoire.getHp(item);
                if (oldHp !== newHp) {
                    behaviorRegistry.handleGrimoireHpChange(item.id);
                }
            }

            // Check for Clash HP changes
            if (Clash.hasHP(oldItem) && Clash.hasHP(item)) {
                const oldHp = Clash.getHP(oldItem);
                const newHp = Clash.getHP(item);
                if (oldHp !== newHp) {
                    behaviorRegistry.handleClashHpChange(item.id);
                }
            }

            // Check for Smoke and Spectre door state changes
            if (
                SmokeAndSpectre.isDoor(oldItem) &&
                SmokeAndSpectre.isDoor(item)
            ) {
                const oldDoorOpen = SmokeAndSpectre.getDoorOpenState(oldItem);
                const newDoorOpen = SmokeAndSpectre.getDoorOpenState(item);
                if (oldDoorOpen !== newDoorOpen) {
                    behaviorRegistry.handleSmokeSpectreDoorChange(
                        item.id,
                        newDoorOpen,
                    );
                }
            }

            // Check for Pretty Sordid Initiative turn changes
            if (
                PrettySordid.hasInitiative(oldItem) &&
                PrettySordid.hasInitiative(item)
            ) {
                const oldActiveTurn = PrettySordid.isActiveTurn(oldItem);
                const newActiveTurn = PrettySordid.isActiveTurn(item);
                if (oldActiveTurn !== newActiveTurn) {
                    behaviorRegistry.handlePrettySordidTurnChange(
                        item.id,
                        newActiveTurn,
                    );
                }
            }
        }
    }

    for (const id of toStop) {
        behaviorRegistry.stopBehaviorsForItem(id);
    }

    for (const newBehavior of newBehaviors) {
        behaviorRegistry.startBehavior(newBehavior);
    }

    for (const propertyChange of propertyChanges) {
        behaviorRegistry.handlePropertyChange(...propertyChange);
    }

    // if (newCollisions.length > 0) {
    //     console.log("newCollisions", newCollisions);
    // }
    for (const newCollision of newCollisions) {
        behaviorRegistry.handleCollisionUpdate(newCollision, true);
    }

    // if (finishedCollisions.length > 0) {
    //     console.log("finishedCollision", finishedCollisions);
    // }
    for (const finishedCollision of finishedCollisions) {
        behaviorRegistry.handleCollisionUpdate(finishedCollision, false);
    }
}

function startRunning(behaviorRegistry: BehaviorRegistry): VoidFunction {
    const watcher = new Watcher();
    const collisionEngine = new CollisionEngine();
    watcher.addWatcher(EffectsWatcher);

    handleItemsChange(
        behaviorRegistry,
        watcher,
        collisionEngine,
        new Map(),
        usePlayerStorage.getState().itemsOfInterest,
    );
    const unsubscribeItems = usePlayerStorage.subscribe(
        (store) => store.itemsOfInterest,
        (newItems, oldItems) =>
            handleItemsChange(
                behaviorRegistry,
                watcher,
                collisionEngine,
                oldItems,
                newItems,
            ),
    );

    // Phases
    let oldPhases: Record<string, number> = {};
    const unsubscribeSceneMetadata = OBR.scene.onMetadataChange((metadata) => {
        const phases = Phases.getPhases(metadata);
        for (const [phaseName, phaseValue] of Object.entries(phases)) {
            if (phaseValue !== oldPhases[phaseName]) {
                behaviorRegistry.handlePhaseChange(phaseName, phaseValue);
            }
        }
        oldPhases = phases;
    });

    return deferCallAll(unsubscribeItems, unsubscribeSceneMetadata);
}

function shouldEnable(state: OwlbearStore) {
    return state.role === "GM" && state.sceneReady && state.sceneMetadataLoaded;
}

export function installBehaviorRunner(behaviorRegistry: BehaviorRegistry) {
    let uninstall: VoidFunction | undefined;
    if (shouldEnable(usePlayerStorage.getState())) {
        uninstall = startRunning(behaviorRegistry);
    }
    const stopWatchingEnabled = usePlayerStorage.subscribe(
        (state) => shouldEnable(state),
        (enabled) => {
            if (enabled) {
                uninstall?.();
                uninstall = startRunning(behaviorRegistry);
            } else {
                uninstall?.();
                uninstall = undefined;
            }
        },
    );
    return () => {
        stopWatchingEnabled();
        uninstall?.();
        uninstall = undefined;
    };
}
