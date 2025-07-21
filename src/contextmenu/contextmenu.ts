import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import { BEHAVIOR_ITEM_TYPES } from "../BehaviorItem";
import {
    CONTEXT_MENU_ADD_TAGS_ID,
    CONTEXT_MENU_ID,
    ID_POPOVER_ADD_TAGS,
} from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import {
    usePlayerStorage,
    type LocalStorage,
    type OwlbearStore,
} from "../state/usePlayerStorage";

function shouldShowContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && state.contextMenuEnabled;
}

function shouldShowAddTagsContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && (state.showAddTagsContextMenu ?? true);
}

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    const store = usePlayerStorage.getState();
    if (shouldShowContextMenu(store)) {
        await installContextMenu();
    }
    if (shouldShowAddTagsContextMenu(store)) {
        await installAddTagsContextMenu();
    }

    const unsubscribeBehaviors = usePlayerStorage.subscribe(
        (store) => shouldShowContextMenu(store),
        async (enabled) => {
            if (enabled && usePlayerStorage.getState().role === "GM") {
                await installContextMenu();
            } else {
                await uninstallContextMenu();
            }
        },
    );

    const unsubscribeTags = usePlayerStorage.subscribe(
        (store) => shouldShowAddTagsContextMenu(store),
        async (enabled) => {
            if (enabled && usePlayerStorage.getState().role === "GM") {
                await installAddTagsContextMenu();
            } else {
                await uninstallAddTagsContextMenu();
            }
        },
    );

    return () => {
        unsubscribeBehaviors();
        unsubscribeTags();
    };
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

function installAddTagsContextMenu() {
    return OBR.contextMenu.create({
        id: CONTEXT_MENU_ADD_TAGS_ID,
        shortcut: undefined,
        embed: undefined,
        icons: [
            {
                icon: logo,
                label: "Add Tags",
                filter: {
                    min: 1,
                    max: undefined, // Allow multiple items to be selected
                    every: [], // Apply to all item types
                },
            },
        ],
        onClick: async () =>
            OBR.popover.open({
                id: ID_POPOVER_ADD_TAGS,
                url: `/src/popoverAddTags/popoverAddTags.html`,
                height: 250,
                width: 350,
                anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
                transformOrigin: { horizontal: "CENTER", vertical: "CENTER" },
            }),
    });
}

function uninstallAddTagsContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_ADD_TAGS_ID);
}
