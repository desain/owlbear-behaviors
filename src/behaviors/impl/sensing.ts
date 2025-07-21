import OBR from "@owlbear-rodeo/sdk";
import { assertItem, cells, cellsToUnits } from "owlbear-utils";
import { isBehaviorItem, type BehaviorItem } from "../../BehaviorItem";
import { notifyPlayersToDeselect } from "../../broadcast/broadcast";
import { checkBoundingBoxOverlap } from "../../collision/CollisionEngine";
import { getBounds, isBoundableItem } from "../../collision/getBounds";
import { METADATA_KEY_TAGS } from "../../constants";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import { ItemProxy } from "../ItemProxy";

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

    deselect: async (ids?: string[]) => {
        const isGm = usePlayerStorage.getState().role === "GM";
        if (isGm) {
            await OBR.player.deselect(ids);
        } else {
            await notifyPlayersToDeselect(ids);
        }
    },

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
