import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    type Curve,
    type Image,
    type Item,
    type Line,
    type Path,
    type Shape,
} from "@owlbear-rodeo/sdk";
import type { ItemDiff } from "owlbear-utils";
import RBush, { type BBox } from "rbush";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { getBounds } from "./getBounds";

type CollisionItem = Image | Shape | Line | Curve | Path;

function isCollisionItem(item: Item): item is CollisionItem {
    return (
        isImage(item) ||
        isShape(item) ||
        isLine(item) ||
        isCurve(item) ||
        isPath(item)
    );
}

export type Collision = readonly [a: Item["id"], b: Item["id"]];
interface RBushEntry extends BBox {
    id: CollisionItem["id"];
}

function rBushEntryFromItem(item: CollisionItem): RBushEntry {
    const bounds = getBounds(item, usePlayerStorage.getState().grid);
    return {
        minX: bounds.min.x,
        minY: bounds.min.y,
        maxX: bounds.max.x,
        maxY: bounds.max.y,
        id: item.id,
    };
}

export class CollisionEngine {
    readonly rbush = new RBush<RBushEntry>();
    readonly #boundsCache = new Map<CollisionItem["id"], RBushEntry>();
    readonly #inProgress = new Map<
        CollisionItem["id"],
        Set<CollisionItem["id"]>
    >();

    #saveCollided(a: CollisionItem["id"], b: CollisionItem["id"]) {
        const aSet = this.#inProgress.get(a) ?? new Set();
        aSet.add(b);
        this.#inProgress.set(a, aSet);

        const bSet = this.#inProgress.get(b) ?? new Set();
        bSet.add(a);
        this.#inProgress.set(b, bSet);
    }

    handleGlobalItemsUpdate({
        createdItems,
        updatedItems,
        deletedItems,
    }: ItemDiff): {
        readonly newCollisions: readonly Collision[];
        readonly finishedCollisions: readonly Collision[];
    } {
        const finishedCollisions: Collision[] = [];

        // Remove collisions pertaining to deleted items
        for (const id of deletedItems) {
            // Stop tracking any collisions it was part of
            const prevCollided = [...(this.#inProgress.get(id) ?? [])];
            for (const other of prevCollided) {
                finishedCollisions.push([id, other]);
                this.#inProgress.get(other)?.delete(id);
            }
            this.#inProgress.delete(id);

            // Remove it from bounds tracking and spatial index
            const entry = this.#boundsCache.get(id);
            this.#boundsCache.delete(id);
            if (entry) {
                this.rbush.remove(entry);
            }
        }

        // Cache new bounding boxes
        const createdCollisionItems = [...createdItems].filter(isCollisionItem);
        createdCollisionItems.forEach((item) => {
            const entry = rBushEntryFromItem(item);
            this.#boundsCache.set(item.id, entry);
            this.rbush.insert(entry);
        });

        // Update existing bounding boxes
        const updatedCollisionItems = [...updatedItems].filter(isCollisionItem);
        updatedCollisionItems.forEach((item) => {
            const entry = this.#boundsCache.get(item.id);
            if (entry) {
                this.rbush.remove(entry);
            }
            const newEntry = rBushEntryFromItem(item);
            this.#boundsCache.set(item.id, newEntry);
            this.rbush.insert(newEntry);
        });

        // Check for update collisions
        const newCollisions: Collision[] = [];
        const checkItems = [...createdCollisionItems, ...updatedCollisionItems];
        for (const a of checkItems) {
            const entryA = this.#boundsCache.get(a.id);
            if (!entryA) {
                console.error("Missing bounds for created/updated item:", a.id);
                continue;
            }

            const currentCollisions = new Set(
                this.rbush
                    .search(entryA)
                    .map((entry) => entry.id)
                    .filter((id) => id !== a.id),
            );
            const prevCollisions = this.#inProgress.get(a.id) ?? new Set();

            // Add new collisions
            for (const b of currentCollisions) {
                if (!prevCollisions.has(b)) {
                    newCollisions.push([a.id, b]);
                    this.#saveCollided(a.id, b);
                }
            }

            // Finish collisions that are no longer valid
            for (const b of prevCollisions) {
                if (!currentCollisions.has(b)) {
                    finishedCollisions.push([a.id, b]);
                    this.#inProgress.get(a.id)?.delete(b);
                    this.#inProgress.get(b)?.delete(a.id);
                }
            }
        }

        console.log(newCollisions);

        return { newCollisions, finishedCollisions };
    }
}
