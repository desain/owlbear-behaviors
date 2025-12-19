import OBR, { type BoundingBox } from "@owlbear-rodeo/sdk";
import {
    assertItem,
    cells,
    cellsToUnits,
    getBounds,
    getName,
    isBoundableItem,
} from "owlbear-utils";
import { isBehaviorItem, type BehaviorItem } from "../../BehaviorItem";
import { notifyAllToDeselect } from "../../broadcast/broadcast";
import { METADATA_KEY_TAGS } from "../../constants";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import { ItemProxy } from "../ItemProxy";

export function checkBoundingBoxOverlap(
    a: BoundingBox,
    b: BoundingBox,
): boolean {
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

export const SENSING_BEHAVIORS = {
    addTag: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        tagUnknown: unknown,
    ) => {
        const tag = String(tagUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            assertItem(self, isBehaviorItem);
            const tags = self.metadata[METADATA_KEY_TAGS] ?? [];
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
            self.metadata[METADATA_KEY_TAGS] = tags;
        });
        signal.throwIfAborted();
    },

    removeTag: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        tagUnknown: unknown,
    ) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            assertItem(self, isBehaviorItem);
            const tags = self.metadata[METADATA_KEY_TAGS];
            if (tags) {
                const index = tags.indexOf(String(tagUnknown));
                if (index !== -1) {
                    tags.splice(index, 1);
                }
                if (tags.length === 0) {
                    delete self.metadata[METADATA_KEY_TAGS];
                }
            }
        });
        signal.throwIfAborted();
    },

    hasTag: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        tagUnknown: unknown,
    ): Promise<boolean> => {
        const item = await ItemProxy.getInstance().get(String(selfIdUnknown));
        if (!item || !isBehaviorItem(item)) {
            return false;
        }
        signal.throwIfAborted();
        return !!item?.metadata[METADATA_KEY_TAGS]?.includes(
            String(tagUnknown),
        );
    },

    getTagged: async (
        signal: AbortSignal,
        tagUnknown: unknown,
    ): Promise<BehaviorItem["id"][]> => {
        const tag = String(tagUnknown);
        const items = await OBR.scene.items.getItems(
            (item) =>
                isBehaviorItem(item) &&
                !!item.metadata[METADATA_KEY_TAGS]?.includes(tag),
        );
        signal.throwIfAborted();
        return items.map((item) => item.id);
    },

    deselect: notifyAllToDeselect,

    findClosestTagged: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        tagUnknown: unknown,
    ): Promise<BehaviorItem["id"] | undefined> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        if (!selfItem) {
            return undefined;
        }
        const tag = String(tagUnknown);

        signal.throwIfAborted();
        const itemsOfInterest = usePlayerStorage.getState().itemsOfInterest;

        let closestItem: BehaviorItem | undefined;
        let closestDistance = Infinity;

        for (const item of itemsOfInterest.values()) {
            // Skip self
            if (item.id === selfItem.id) {
                continue;
            }

            // Check if item has the tag
            if (!item.metadata[METADATA_KEY_TAGS]?.includes(tag)) {
                continue;
            }

            // Calculate euclidean distance
            const dx = item.position.x - selfItem.position.x;
            const dy = item.position.y - selfItem.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        }

        return closestItem?.id;
    },

    tokenNamed: (nameUnknown: unknown): BehaviorItem["id"] | undefined => {
        const name = String(nameUnknown);
        const itemsOfInterest = usePlayerStorage.getState().itemsOfInterest;

        for (const item of itemsOfInterest.values()) {
            if (getName(item) === name) {
                return item.id;
            }
        }

        return undefined;
    },

    distanceTo: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        targetIdUnknown: unknown,
    ): Promise<number> => {
        const [selfItem, targetItem] = await Promise.all([
            ItemProxy.getInstance().get(String(selfIdUnknown)),
            ItemProxy.getInstance().get(String(targetIdUnknown)),
        ]);

        if (!selfItem || !targetItem) {
            // Return a large number if either item is not found
            return Infinity;
        }

        const cellDist = await OBR.scene.grid.getDistance(
            selfItem.position,
            targetItem.position,
        );
        signal.throwIfAborted();

        return cellsToUnits(cells(cellDist), usePlayerStorage.getState().grid);
    },

    touching: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        targetIdUnknown: unknown,
    ): Promise<boolean> => {
        const [selfItem, targetItem] = await Promise.all([
            ItemProxy.getInstance().get(String(selfIdUnknown)),
            ItemProxy.getInstance().get(String(targetIdUnknown)),
        ]);
        signal.throwIfAborted();

        if (
            !selfItem ||
            !targetItem ||
            !isBoundableItem(selfItem) ||
            !isBoundableItem(targetItem)
        ) {
            return false;
        }

        const grid = usePlayerStorage.getState().grid;
        const selfBounds = getBounds(selfItem, grid);
        const targetBounds = getBounds(targetItem, grid);

        return checkBoundingBoxOverlap(selfBounds, targetBounds);
    },
};
