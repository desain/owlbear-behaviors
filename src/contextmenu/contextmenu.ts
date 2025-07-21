import OBR from "@owlbear-rodeo/sdk";
import logo from "../../assets/logo.svg";
import type { BehaviorItem } from "../BehaviorItem";
import { BEHAVIOR_ITEM_TYPES } from "../BehaviorItem";
import {
    CONTEXT_MENU_ADD_TAGS_ID,
    CONTEXT_MENU_COPY_BEHAVIOR_ID,
    CONTEXT_MENU_ID,
    CONTEXT_MENU_PASTE_BEHAVIOR_ID,
    METADATA_KEY_BEHAVIORS,
} from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import { openAddTags } from "../popoverAddTags/openAddTags";
import {
    usePlayerStorage,
    type LocalStorage,
    type OwlbearStore,
} from "../state/usePlayerStorage";

function shouldShowContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && state.contextMenuEnabled;
}

function shouldShowAddTagsContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && !!state.showAddTagsContextMenu;
}

function shouldShowCopyContextMenu(state: LocalStorage & OwlbearStore) {
    return state.role === "GM" && !!state.showCopyPasteContextMenu;
}

function shouldShowPasteContextMenu(state: LocalStorage & OwlbearStore) {
    return (
        state.role === "GM" &&
        !!state.showCopyPasteContextMenu &&
        state.clipboard
    );
}

export async function startWatchingContextMenuEnabled(): Promise<VoidFunction> {
    const store = usePlayerStorage.getState();
    if (shouldShowContextMenu(store)) {
        await installContextMenu();
    }
    if (shouldShowAddTagsContextMenu(store)) {
        await installAddTagsContextMenu();
    }
    if (shouldShowCopyContextMenu(store)) {
        await installCopyContextMenu();
    }
    if (shouldShowPasteContextMenu(store)) {
        await installPasteContextMenu();
    }

    const unsubscribeBehaviors = usePlayerStorage.subscribe(
        shouldShowContextMenu,
        async (enabled) => {
            if (enabled) {
                await installContextMenu();
            } else {
                await uninstallContextMenu();
            }
        },
    );

    const unsubscribeTags = usePlayerStorage.subscribe(
        shouldShowAddTagsContextMenu,
        async (enabled) => {
            if (enabled) {
                await installAddTagsContextMenu();
            } else {
                await uninstallAddTagsContextMenu();
            }
        },
    );

    const unsubscribeCopy = usePlayerStorage.subscribe(
        shouldShowCopyContextMenu,
        async (enabled) => {
            if (enabled) {
                await installCopyContextMenu();
            } else {
                await uninstallCopyContextMenu();
            }
        },
    );

    const unsubscribePaste = usePlayerStorage.subscribe(
        shouldShowPasteContextMenu,
        async (enabled) => {
            if (enabled) {
                await installPasteContextMenu();
            } else {
                await uninstallPasteContextMenu();
            }
        },
    );

    return () => {
        unsubscribeBehaviors();
        unsubscribeTags();
        unsubscribeCopy();
        unsubscribePaste();
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
                },
            },
        ],
        onClick: openAddTags,
    });
}

function uninstallAddTagsContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_ADD_TAGS_ID);
}

async function copyBehavior() {
    const selection = await OBR.player.getSelection();
    const itemId = selection?.[0];
    if (!itemId) {
        void OBR.notification.show("No item selected", "ERROR");
        return;
    }

    const items = await OBR.scene.items.getItems<BehaviorItem>([itemId]);
    const item = items[0];
    if (!item) {
        void OBR.notification.show("Item not found", "ERROR");
        return;
    }

    const behaviorData = item.metadata[METADATA_KEY_BEHAVIORS];
    if (!behaviorData) {
        void OBR.notification.show("Item has no behaviors to copy", "ERROR");
        return;
    }

    usePlayerStorage.getState().setClipboard({
        workspace: behaviorData.workspace,
    });

    void OBR.notification.show("Behaviors copied to clipboard", "SUCCESS");
}

async function pasteBehavior() {
    const selection = await OBR.player.getSelection();
    if (!selection || selection.length === 0) {
        await OBR.notification.show("No items selected", "ERROR");
        return;
    }

    const clipboard = usePlayerStorage.getState().clipboard;
    if (!clipboard) {
        await OBR.notification.show("No behavior copied to clipboard", "ERROR");
        return;
    }

    const items = await OBR.scene.items.getItems(selection);
    const itemsWithBehaviors = items.filter(
        (item) => item.metadata[METADATA_KEY_BEHAVIORS],
    );

    if (itemsWithBehaviors.length > 0) {
        const confirmed = confirm(
            `${itemsWithBehaviors.length} items already have behaviors, overwrite?`,
        );

        if (!confirmed) {
            return;
        }
    }

    await OBR.scene.items.updateItems<BehaviorItem>(selection, (items) => {
        items.forEach((item) => {
            item.metadata[METADATA_KEY_BEHAVIORS] = {
                workspace: clipboard.workspace,
                lastModified: Date.now(),
            };
        });
    });
    await OBR.notification.show(
        `Behavior pasted to ${selection.length} item(s)`,
        "SUCCESS",
    );
}

function installCopyContextMenu() {
    return OBR.contextMenu.create({
        id: CONTEXT_MENU_COPY_BEHAVIOR_ID,
        icons: [
            {
                icon: logo,
                label: "Copy Behavior",
                filter: {
                    min: 1,
                    max: 1,
                    every: [
                        {
                            key: ["metadata", METADATA_KEY_BEHAVIORS],
                            operator: "!=",
                            value: undefined,
                        },
                    ],
                },
            },
        ],
        onClick: copyBehavior,
    });
}

function installPasteContextMenu() {
    return OBR.contextMenu.create({
        id: CONTEXT_MENU_PASTE_BEHAVIOR_ID,
        icons: BEHAVIOR_ITEM_TYPES.map((type) => ({
            icon: logo,
            label: "Paste Behavior",
            filter: {
                min: 1,
                every: [
                    {
                        key: "type",
                        value: type,
                    },
                ],
            },
        })),
        onClick: pasteBehavior,
    });
}

function uninstallCopyContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_COPY_BEHAVIOR_ID);
}

function uninstallPasteContextMenu() {
    return OBR.contextMenu.remove(CONTEXT_MENU_PASTE_BEHAVIOR_ID);
}
