import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll, DO_NOTHING } from "owlbear-utils";
import { version } from "../package.json";
import { installBehaviorRunner } from "./behaviors/installBehaviorRunner";
import { watchSelection } from "./behaviors/watchSelection";
import { setupBlocklyGlobals } from "./blockly/setupBlocklyGlobals";
import { installBroadcastListener } from "./broadcast/broadcast";
import { startWatchingContextMenuEnabled } from "./contextmenu/contextmenu";

export function install() {
    let uninstall: VoidFunction = DO_NOTHING;

    // Blockly setup
    setupBlocklyGlobals();

    async function installExtension(): Promise<VoidFunction> {
        console.log(`Behaviors version ${version}`);

        // const [storeInitialized, stopSyncing] = startSyncing();
        // await storeInitialized;
        const stopWatchingContextMenu = await startWatchingContextMenuEnabled();
        const uninstallBroadcastListener = installBroadcastListener();
        const uninstallBehaviorRunner = installBehaviorRunner();
        const stopWatchingSelection = watchSelection();

        return deferCallAll(
            () => console.log("Uninstalling Behaviors"),
            // stopSyncing,
            stopWatchingContextMenu,
            uninstallBroadcastListener,
            uninstallBehaviorRunner,
            stopWatchingSelection,
        );
    }

    OBR.onReady(async () => {
        // console.log("onReady");

        if (await OBR.scene.isReady()) {
            // console.log("isReady");
            uninstall = await installExtension();
        }

        OBR.scene.onReadyChange(async (ready) => {
            // console.log("onReadyChange", ready);
            if (ready) {
                uninstall = await installExtension();
            } else {
                uninstall();
                uninstall = DO_NOTHING;
            }
        });
    });
}
