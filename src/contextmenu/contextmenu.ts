import OBR from "@owlbear-rodeo/sdk";
import { DO_NOTHING } from "owlbear-utils";
import logo from "../../assets/logo.svg";
import { BEHAVIOR_ITEM_TYPES } from "../BehaviorItem";
import { CONTEXT_MENU_ID } from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import { usePlayerStorage } from "../state/usePlayerStorage";

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    const state = usePlayerStorage.getState();
    if (state.role !== "GM") {
        return DO_NOTHING; // No context menu for players
    }
    if (state.contextMenuEnabled) {
        await installContextMenu();
    }
    return usePlayerStorage.subscribe(
        (store) => store.contextMenuEnabled,
        async (enabled) => {
            if (enabled && usePlayerStorage.getState().role === "GM") {
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
            icons: BEHAVIOR_ITEM_TYPES.map((type) => ({
                icon: logo,
                label: "Edit Behaviors",
                filter: {
                    min: 1,
                    max: 1,
                    every: [
                        {
                            key: "type",
                            value: type,
                        },
                    ],
                },
            })),
            onClick: async () => {
                const selection = await OBR.player.getSelection();
                const itemId = selection?.[0];
                if (!itemId) {
                    return;
                }
                return openEditBehaviors(itemId);
            },
        }),
    ]);
}

function uninstallContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_ID);
}
