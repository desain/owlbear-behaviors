import { type Item } from "@owlbear-rodeo/sdk";
import { Patcher } from "./Patcher";
import type { ItemDiff } from "./diffItemSets";

interface ItemWatcherCtor<GlobalItemType extends Item = Item> {
    isTarget: (item: Item) => item is GlobalItemType;
    new (
        globalItem: GlobalItemType,
        patcher: Patcher,
    ): ItemWatcher<GlobalItemType>;
}

export interface ItemWatcher<GlobalItemType extends Item = Item> {
    handleItemUpdate: (globalItem: GlobalItemType, patcher: Patcher) => void;
    handleItemDelete: (patcher: Patcher) => void;
}

export class Watcher {
    readonly #patcher = new Patcher();
    readonly #watcherCtors = new Set<ItemWatcherCtor>();
    readonly #watchers = new Map<Item["id"], ItemWatcher[]>();

    addWatcher = <GlobalItemType extends Item = Item>(
        ctor: ItemWatcherCtor<GlobalItemType>,
    ) => {
        this.#watcherCtors.add(ctor as unknown as ItemWatcherCtor);
    };

    // clear = () => {
    //     this.#watcherCtors.clear();
    //     this.#watchers.clear();
    // };

    handleGlobalItemsUpdate = ({
        createdItems,
        updatedItems,
        deletedItems,
    }: ItemDiff) => {
        for (const deletedItem of deletedItems) {
            this.#watchers
                .get(deletedItem)
                ?.forEach((watcher) => watcher.handleItemDelete(this.#patcher));
            this.#watchers.delete(deletedItem);
        }

        for (const createdItem of createdItems) {
            const watchers = [...this.#watcherCtors]
                .filter((ctor) => ctor.isTarget(createdItem))
                .map((ctor) => new ctor(createdItem, this.#patcher));
            this.#watchers.set(createdItem.id, watchers);
        }

        for (const updatedItem of updatedItems) {
            this.#watchers
                .get(updatedItem.id)
                ?.forEach((watcher) =>
                    watcher.handleItemUpdate(updatedItem, this.#patcher),
                );
        }

        return this.#patcher.apply();
    };
}
