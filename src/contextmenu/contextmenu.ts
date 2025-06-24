import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { BEHAVIOR_ITEM_TYPES } from "../BehaviorItem";
import { CONTEXT_MENU_ID } from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import {
    usePlayerStorage,
    type LocalStorage,
    type OwlbearStore,
} from "../state/usePlayerStorage";

function shouldShowContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && state.contextMenuEnabled;
}

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    const store = usePlayerStorage.getState();
    if (shouldShowContextMenu(store)) {
        await installContextMenu();
    }
    return usePlayerStorage.subscribe(
        (store) => shouldShowContextMenu(store),
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
