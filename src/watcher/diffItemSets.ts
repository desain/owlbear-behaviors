import type { Item } from "@owlbear-rodeo/sdk";

export type ItemMap<ItemType extends Item = Item> = ReadonlyMap<
    ItemType["id"],
    ItemType
>;

export interface ItemDiff<ItemType extends Item = Item> {
    readonly createdItems: ReadonlySet<ItemType>;
    readonly deletedItems: ReadonlySet<ItemType["id"]>;
    readonly updatedItems: readonly ItemType[];
}

export function diffItemSets<ItemType extends Item = Item>(
    oldItems: ItemMap<ItemType>,
    newItems: ItemMap<ItemType>,
): ItemDiff<ItemType> {
    const deletedItems = new Set(oldItems.keys());
    const createdItems = new Set(newItems.values());
    const updatedItems: ItemType[] = [];

    for (const oldItem of oldItems.values()) {
        if (newItems.has(oldItem.id)) {
            deletedItems.delete(oldItem.id);
        }
    }

    for (const newItem of newItems.values()) {
        const oldItem = oldItems.get(newItem.id);
        if (oldItem) {
            createdItems.delete(newItem);
            if (oldItem.lastModified < newItem.lastModified) {
                updatedItems.push(newItem);
            }
        }
    }

    return { createdItems, updatedItems, deletedItems };
}
