import OBR, { type ContextMenuContext } from "@owlbear-rodeo/sdk";
import { deferCallAll, getId } from "owlbear-utils";
import logo from "../../assets/logo.svg";
import { BEHAVIOR_ITEM_TYPES, type BehaviorItem } from "../BehaviorItem";
import type { BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import {
    CONTEXT_MENU_ADD_TAGS_ID,
    CONTEXT_MENU_COPY_BEHAVIOR_ID,
    CONTEXT_MENU_ID,
    CONTEXT_MENU_PASTE_BEHAVIOR_ID,
    METADATA_KEY_BEHAVIORS,
    METADATA_KEY_MENU_ITEMS,
} from "../constants";
import { openEditBehaviors } from "../modalEditBehaviors/openEditBehaviors";
import { openAddTags } from "../popoverAddTags/openAddTags";
import {
    usePlayerStorage,
    type LocalStorage,
    type OwlbearStore,
} from "../state/usePlayerStorage";

// Should show

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

// Watcher

export async function startWatchingContextMenuEnabled(
    behaviorRegistry: BehaviorRegistry,
): Promise<VoidFunction> {
    const store = usePlayerStorage.getState();
    if (shouldShowContextMenu(store)) {
        await installEditBehaviorsContextMenu();
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
                await installEditBehaviorsContextMenu();
            } else {
                await uninstallEditBehaviorsContextMenu();
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

    function handleMenuItemsChange(
        newItems: Set<string>,
        oldItems: Set<string>,
    ) {
        const { created, deleted } = diffSets(oldItems, newItems);
        for (const name of created) {
            void installMenuItemContextMenu(name, behaviorRegistry);
        }
        for (const name of deleted) {
            void uninstallMenuItemContextMenu(name);
        }
    }
    handleMenuItemsChange(
        usePlayerStorage.getState().activeMenuItems,
        new Set(),
    );
    const unsubscribeMenuItems = usePlayerStorage.subscribe(
        (state) => state.activeMenuItems,
        handleMenuItemsChange,
    );

    return deferCallAll(
        unsubscribeBehaviors,
        unsubscribeTags,
        unsubscribeCopy,
        unsubscribePaste,
        unsubscribeMenuItems,
    );
}

// Install and uninstall

function installEditBehaviorsContextMenu() {
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
            onClick: (context) => {
                const itemId = context.items[0]?.id;
                if (itemId) {
                    void openEditBehaviors(itemId);
                }
            },
        }),
    ]);
}

function uninstallEditBehaviorsContextMenu() {
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

function installMenuItemContextMenu(
    name: string,
    behaviorRegistry: BehaviorRegistry,
) {
    return OBR.contextMenu.create({
        id: getCustomMenuItemId(name),
        icons: [
            {
                icon: logo,
                label: name,
                filter: {
                    min: 1,
                    some: [
                        {
                            key: ["metadata", METADATA_KEY_MENU_ITEMS, name],
                            value: true,
                        },
                    ],
                },
            },
        ],
        onClick: (context) => {
            const ids = context.items.map(getId);
            behaviorRegistry.handleContextMenuClicked(ids, name);
            void OBR.player.deselect(ids);
        },
    });
}

function uninstallMenuItemContextMenu(name: string) {
    return OBR.contextMenu.remove(getCustomMenuItemId(name));
}

// Helpers

function getCustomMenuItemId(name: string) {
    return `${CONTEXT_MENU_ID}/${name}`;
}

async function copyBehavior(context: ContextMenuContext) {
    const itemId = context.items[0]?.id;
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

async function pasteBehavior(context: ContextMenuContext) {
    if (context.items.length === 0) {
        await OBR.notification.show("No items selected", "ERROR");
        return;
    }

    const clipboard = usePlayerStorage.getState().clipboard;
    if (!clipboard) {
        await OBR.notification.show("No behavior copied to clipboard", "ERROR");
        return;
    }

    const itemsWithBehaviors = context.items.filter(
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

    await OBR.scene.items.updateItems<BehaviorItem>(
        context.items.map(getId),
        (items) => {
            items.forEach((item) => {
                if (item) {
                    item.metadata[METADATA_KEY_BEHAVIORS] = {
                        workspace: clipboard.workspace,
                        lastModified: Date.now(),
                    };
                }
            });
        },
    );
    await OBR.notification.show(
        `Behavior pasted to ${context.items.length} item(s)`,
        "SUCCESS",
    );
}

export function diffSets<T extends string | number>(
    a: Set<T>,
    b: Set<T>,
): { created: T[]; deleted: T[] } {
    const created: T[] = [];
    const deleted: T[] = [];

    for (const t of b) {
        if (!a.has(t)) {
            created.push(t);
        }
    }

    for (const t of a) {
        if (!b.has(t)) {
            deleted.push(t);
        }
    }

    return { created, deleted };
}
