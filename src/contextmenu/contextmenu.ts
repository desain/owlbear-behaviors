import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { CONTEXT_MENU_ID } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    if (usePlayerStorage.getState().contextMenuEnabled) {
        await installContextMenu();
    }
    return usePlayerStorage.subscribe(
        (store) => store.contextMenuEnabled,
        async (enabled) => {
            if (enabled) {
                await installContextMenu();
            } else {
                await uninstallContextMenu();
            }
        },
    );
}

function installContextMenu() {
    return Promise.all([
        OBR.contextMenu.create({
            id: CONTEXT_MENU_ID,
            shortcut: undefined, // Watch out for collisions
            embed: undefined, // Prefer not to use this - it takes up space
            icons: [
                {
                    icon: logo,
                    label: "TODO context menu name",
                },
            ],
            onClick: () => {
                void OBR.notification.show("CONTEXT MENU CLICKED");
            },
        }),
    ]);
}

function uninstallContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_ID);
}
