import { Patcher } from "../watcher/Patcher";

interface PendingFlush {
    timeout: NodeJS.Timeout;
    promise: Promise<void>;
}

/**
 * Shared instance of Patcher for batching item updates across behaviors.
 * This reduces API calls by collecting multiple updates and applying them together.
 * All operations return promises that resolve when the batch is flushed.
 */
export class SharedPatcher {
    static #instance?: SharedPatcher;
    readonly #patcher = new Patcher();
    #pendingFlush?: PendingFlush;
    readonly #FLUSH_DELAY_MS = 16; // ~1 frame at 60fps

    static getInstance = (): SharedPatcher => {
        if (!SharedPatcher.#instance) {
            SharedPatcher.#instance = new SharedPatcher();
        }
        return SharedPatcher.#instance;
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
    updateItem = (
        ...args: Parameters<Patcher["updateGlobal"]>
    ): Promise<void> => {
        this.#patcher.updateGlobal(...args);
        return this.#scheduleFlush();
    };

    /**
     * Immediately flush all pending updates.
     * Returns a promise that resolves when the flush completes.
     */
    async flush(): Promise<void> {
        if (this.#pendingFlush !== undefined) {
            clearTimeout(this.#pendingFlush.timeout);
            this.#pendingFlush = undefined;
        }
        await this.#patcher.apply();
    }

    /**
     * Reset the singleton instance (primarily for testing).
     */
    static reset = () => {
        SharedPatcher.#instance = undefined;
    };
}
