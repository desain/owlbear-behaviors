import type { InteractionManager, Item } from "@owlbear-rodeo/sdk";
import OBR from "@owlbear-rodeo/sdk";
import { Patcher } from "owlbear-utils";

interface PendingFlush {
    timeout: NodeJS.Timeout;
    promise: Promise<void>;
}

export class ItemProxy {
    static #instance?: ItemProxy;

    readonly #patcher = new Patcher();
    #pendingFlush?: PendingFlush;
    readonly #FLUSH_DELAY_MS = 16; // ~1 frame at 60fps

    readonly #cache = new Map<Item["id"], Item>();
    readonly #interactions = new Map<
        Item["id"],
        | { creating: Promise<InteractionManager<Item>> }
        | { count: number; manager: InteractionManager<Item> }
    >();

    static getInstance = (): ItemProxy => {
        if (!ItemProxy.#instance) {
            ItemProxy.#instance = new ItemProxy();
        }
        return ItemProxy.#instance;
    };

    /**
     * Schedule a flush of pending updates. Returns the promise for the current batch.
     */
    #scheduleFlush(): Promise<void> {
        if (this.#pendingFlush === undefined) {
            let timeout: NodeJS.Timeout;
            const promise = new Promise<void>((resolve, reject) => {
                timeout = setTimeout(async () => {
                    this.#pendingFlush = undefined;
                    this.#cache.clear();
                    try {
                        await this.#patcher.apply();
                        resolve();
                    } catch (error) {
                        reject(error as Error);
                    }
                }, this.#FLUSH_DELAY_MS);
            });

            this.#pendingFlush = { timeout: timeout!, promise };
            return promise;
        }
        return this.#pendingFlush.promise;
    }

    /**
     * Add an item update to the batch and schedule a flush.
     * Returns a promise that resolves when the batch is flushed.
     */
    readonly update = (
        ...[itemOrId, updater]: Parameters<Patcher["updateGlobal"]>
    ): Promise<void> => {
        const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;
        this.#cache.delete(id); // TODO apply update instead?
        this.#patcher.updateGlobal(itemOrId, updater);
        return this.#scheduleFlush();
    };

    readonly get = async (id?: Item["id"]): Promise<Item | undefined> => {
        if (!id) {
            return undefined;
        }

        const cached = this.#cache.get(id);
        if (cached) {
            return cached;
        }

        // If there are pending updates, the value directly from the API
        // won't reflect them, so wait until those updates are flushed
        if (this.#pendingFlush) {
            await this.#pendingFlush.promise;
        }

        const [item] = await OBR.scene.items.getItems([id]);
        return item;
    };

    readonly invalidate = () => this.#cache.clear();

    readonly attachInteraction = async (
        item: Item,
    ): Promise<InteractionManager<Item>> => {
        const existing = this.#interactions.get(item.id);
        let manager: InteractionManager<Item>;
        if (existing && "manager" in existing) {
            manager = existing.manager;
        } else if (existing && "creating" in existing) {
            manager = await existing.creating;
        } else {
            const creating = OBR.interaction.startItemInteraction(item);
            this.#interactions.set(item.id, { creating });
            manager = await creating;
        }

        this.#incrementInteractionCount(item.id, manager);

        return [manager[0], () => this.#detachInteraction(item.id)];
    };

    readonly #incrementInteractionCount = (
        itemId: Item["id"],
        manager: InteractionManager<Item>,
    ) => {
        const existing = this.#interactions.get(itemId);
        if (existing && "count" in existing) {
            existing.count++;
        } else if (existing) {
            this.#interactions.set(itemId, { count: 1, manager });
        }
    };

    readonly #detachInteraction = (itemId: Item["id"]) => {
        const existing = this.#interactions.get(itemId);
        if (existing && "count" in existing) {
            existing.count--;
            if (existing.count === 0) {
                existing.manager[1]();
                this.#interactions.delete(itemId);
            }
        } else {
            console.warn("cannot detach nonexistent interaction");
        }
    };
}
