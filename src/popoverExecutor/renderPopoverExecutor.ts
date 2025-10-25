import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll, startRehydrating } from "owlbear-utils";
import { version } from "../../package.json";
import { BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import { installBehaviorRunner } from "../behaviors/installBehaviorRunner";
import { watchSelection } from "../behaviors/watchSelection";
import { setupBlocklyGlobals } from "../blockly/setupBlocklyGlobals";
import { installBroadcastListener } from "../broadcast/broadcast";
import { startWatchingContextMenuEnabled } from "../contextmenu/contextmenu";
import { startSyncing } from "../state/startSyncing";
import { usePlayerStorage } from "../state/usePlayerStorage";

async function installBackgroundExtension(): Promise<VoidFunction> {
    console.info(`Behaviors version ${version}`);

    // Zustand setup
    const [initialized] = startSyncing();
    await initialized;
    const stopRehydrating = startRehydrating(usePlayerStorage);

    // Blockly setup
    setupBlocklyGlobals(); // idempotent

    const behaviorRegistry = new BehaviorRegistry();

    const stopWatchingContextMenu = await startWatchingContextMenuEnabled(
        behaviorRegistry,
    );
    const uninstallBroadcastListener =
        installBroadcastListener(behaviorRegistry);
    const uninstallBehaviorRunner = installBehaviorRunner(behaviorRegistry);
    const stopWatchingSelection = watchSelection(behaviorRegistry);

    return deferCallAll(
        () => console.info("Uninstalling Behaviors"),
        stopRehydrating,
        behaviorRegistry.stopAll,
        stopWatchingContextMenu,
        uninstallBroadcastListener,
        uninstallBehaviorRunner,
        stopWatchingSelection,
    );
}

document.addEventListener("DOMContentLoaded", () => {
    // console.debug("Background process starting...");
    if (OBR.isReady) {
        void installBackgroundExtension();
    } else {
        OBR.onReady(() => void installBackgroundExtension());
    }
});
