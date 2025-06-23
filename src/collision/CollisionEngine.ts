import type {
    BoundingBox,
    Curve,
    Image,
    Item,
    Line,
    Path,
    Shape,
} from "@owlbear-rodeo/sdk";
import { usePlayerStorage } from "../state/usePlayerStorage";
import type { ItemDiff } from "../watcher/diffItemSets";
import { getBounds } from "./getBounds";

type CollisionItem = Image | Shape | Line | Curve | Path;

export type Collision = readonly [a: Item["id"], b: Item["id"]];

interface CollisionUpdate {
    readonly newCollisions: readonly Collision[];
    readonly finishedCollisions: readonly Collision[];
}

function checkBoundingBoxOverlap(a: BoundingBox, b: BoundingBox): boolean {
    // AABB collision: overlaps if NOT separated on any axis
    return !(
        (
            a.max.x < b.min.x || // a is left of b
            a.min.x > b.max.x || // a is right of b
            a.max.y < b.min.y || // a is above b
            a.min.y > b.max.y
        )
        // a is below b
    );
}

export class CollisionEngine {
    readonly #boundsCache = new Map<CollisionItem["id"], BoundingBox>();
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

    // TODO: Make this take a parameter 'id' to get collision candidates for,
    // and add spatial hashing so we only look at candidates that occupy the
    // same spatial hash cells as the target
    #getCollisionCandidates(): CollisionItem["id"][] {
        return [...this.#boundsCache.keys()];
    }

    handleGlobalItemsUpdate({
        createdItems,
        updatedItems,
        deletedItems,
    }: ItemDiff<CollisionItem>): CollisionUpdate {
        const newCollisions: Collision[] = [];
        const finishedCollisions: Collision[] = [];

        // Remove collisions pertaining to deleted items
        for (const id of deletedItems) {
            const prevCollided = [...(this.#inProgress.get(id) ?? [])];
            for (const other of prevCollided) {
                finishedCollisions.push([id, other]);
                this.#inProgress.get(other)?.delete(id);
            }
            this.#inProgress.delete(id);
            this.#boundsCache.delete(id);
        }

        // Cache new bounding boxes
        for (const createdItem of createdItems) {
            this.#boundsCache.set(
                createdItem.id,
                getBounds(createdItem, usePlayerStorage.getState().grid),
            );
        }

        for (const updatedItem of updatedItems) {
            this.#boundsCache.set(
                updatedItem.id,
                getBounds(updatedItem, usePlayerStorage.getState().grid),
            );
        }

        // Check for update collisions
        // Simple O(n^2 solution for now)
        const checkItems = [...createdItems, ...updatedItems];
        for (const a of checkItems) {
            const boundsA = this.#boundsCache.get(a.id);

            for (const bId of this.#getCollisionCandidates()) {
                if (a.id === bId) {
                    continue;
                }

                const boundsB = this.#boundsCache.get(bId);
                if (!boundsA || !boundsB) {
                    throw Error("Missing bounds");
                }
                const wasCollided = !!this.#inProgress.get(a.id)?.has(bId);
                const nowCollided = checkBoundingBoxOverlap(boundsA, boundsB);
                if (!wasCollided && nowCollided) {
                    newCollisions.push([a.id, bId]);
                    this.#saveCollided(a.id, bId);
                } else if (wasCollided && !nowCollided) {
                    finishedCollisions.push([a.id, bId]);
                    this.#inProgress.get(a.id)?.delete(bId);
                    this.#inProgress.get(bId)?.delete(a.id);
                }
            }
        }

        return { newCollisions, finishedCollisions };
    }
}
