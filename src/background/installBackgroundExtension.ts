import { deferCallAll } from "owlbear-utils";
import { version } from "../../package.json";
import { BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import { installBehaviorRunner } from "../behaviors/installBehaviorRunner";
import { watchSelection } from "../behaviors/watchSelection";
import { setupBlocklyGlobals } from "../blockly/setupBlocklyGlobals";
import { installBroadcastListener } from "../broadcast/broadcast";
import { startWatchingContextMenuEnabled } from "../contextmenu/contextmenu";
import { startSyncing } from "../state/startSyncing";

export async function installBackgroundExtension(): Promise<VoidFunction> {
    console.log(`Behaviors version ${version}`);

    const [initialized] = startSyncing();
    await initialized;

    // Blockly setup
    setupBlocklyGlobals(); // idempotent

    const behaviorRegistry = new BehaviorRegistry();

    const stopWatchingContextMenu = await startWatchingContextMenuEnabled();
    const uninstallBroadcastListener =
        installBroadcastListener(behaviorRegistry);
    const uninstallBehaviorRunner = installBehaviorRunner(behaviorRegistry);
    const stopWatchingSelection = watchSelection(behaviorRegistry);

    return deferCallAll(
        () => console.log("Uninstalling Behaviors"),
        behaviorRegistry.stopAll,
        stopWatchingContextMenu,
        uninstallBroadcastListener,
        uninstallBehaviorRunner,
        stopWatchingSelection,
    );
}
