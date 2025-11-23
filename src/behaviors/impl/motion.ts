import OBR, {
    isWall,
    Math2,
    type GridType,
    type Vector2,
} from "@owlbear-rodeo/sdk";
import {
    ANGLE_DIMETRIC_RADIANS,
    complain,
    getBounds,
    getWorldPoints,
    isAttachmentBehavior,
    isBoundableItem,
    ORIGIN,
    SQRT_3,
    units,
    unitsToPixels,
} from "owlbear-utils";
import type { BLOCK_MOVE_DIRECTION } from "../../blockly/blocks";
import { findPath } from "../../pathfinding/findPath";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import { ItemProxy } from "../ItemProxy";

function loopTrap(loopCheck: number): number {
    if (--loopCheck <= 0) {
        throw Error("Exhausted loop iterations");
    }
    return loopCheck;
}

export const X_OFFSET_DIMETRIC = 1 / Math.tan(ANGLE_DIMETRIC_RADIANS);

/**
 * When diagonally moving hexes, the offset of the next hex on the non-dpi axis.
 */
export const HEX_DIAG_OFFSET = 1.5 / SQRT_3;

export type Direction = Exclude<
    (typeof BLOCK_MOVE_DIRECTION)["args0"][0]["options"][number][1],
    "FORWARD"
>;

type CellsPixelsUnits =
    (typeof BLOCK_MOVE_DIRECTION)["args0"][2]["options"][number][1];

export const DIRECTIONS: Record<GridType, Record<Direction, Vector2>> = {
    SQUARE: {
        EAST: { x: 1, y: 0 },
        SOUTHEAST: { x: 1, y: 1 },
        SOUTH: { x: 0, y: 1 },
        SOUTHWEST: { x: -1, y: 1 },
        WEST: { x: -1, y: 0 },
        NORTHWEST: { x: -1, y: -1 },
        NORTH: { x: 0, y: -1 },
        NORTHEAST: { x: 1, y: -1 },
    },
    ISOMETRIC: {
        EAST: { x: SQRT_3, y: 0 },
        SOUTHEAST: { x: SQRT_3 / 2, y: 0.5 },
        SOUTH: { x: 0, y: 1 },
        SOUTHWEST: { x: -SQRT_3 / 2, y: 0.5 },
        WEST: { x: -SQRT_3, y: 0 },
        NORTHWEST: { x: -SQRT_3 / 2, y: -0.5 },
        NORTH: { x: 0, y: -1 },
        NORTHEAST: { x: SQRT_3 / 2, y: -0.5 },
    },
    DIMETRIC: {
        EAST: { x: X_OFFSET_DIMETRIC, y: 0 },
        SOUTHEAST: { x: X_OFFSET_DIMETRIC / 2, y: 0.5 },
        SOUTH: { x: 0, y: 1 },
        SOUTHWEST: { x: -X_OFFSET_DIMETRIC / 2, y: 0.5 },
        WEST: { x: -X_OFFSET_DIMETRIC, y: 0 },
        NORTHWEST: { x: -X_OFFSET_DIMETRIC / 2, y: -0.5 },
        NORTH: { x: 0, y: -1 },
        NORTHEAST: { x: X_OFFSET_DIMETRIC / 2, y: -0.5 },
    },
    HEX_VERTICAL: {
        EAST: { x: 1, y: 0 },
        SOUTHEAST: { x: 0.5, y: HEX_DIAG_OFFSET },
        SOUTH: { x: 0, y: 2 * HEX_DIAG_OFFSET },
        SOUTHWEST: { x: -0.5, y: HEX_DIAG_OFFSET },
        WEST: { x: -1, y: 0 },
        NORTHWEST: { x: -0.5, y: -HEX_DIAG_OFFSET },
        NORTH: { x: 0, y: -2 * HEX_DIAG_OFFSET },
        NORTHEAST: { x: 0.5, y: -HEX_DIAG_OFFSET },
    },
    HEX_HORIZONTAL: {
        EAST: { x: 2 * HEX_DIAG_OFFSET, y: 0 },
        SOUTHEAST: { x: HEX_DIAG_OFFSET, y: 0.5 },
        SOUTH: { x: 0, y: 1 },
        SOUTHWEST: { x: -HEX_DIAG_OFFSET, y: 0.5 },
        WEST: { x: -2 * HEX_DIAG_OFFSET, y: 0 },
        NORTHWEST: { x: -HEX_DIAG_OFFSET, y: -0.5 },
        NORTH: { x: 0, y: -1 },
        NORTHEAST: { x: HEX_DIAG_OFFSET, y: -0.5 },
    },
} as const;

/**
 * Returns the point reached by traveling a given distance along a path.
 * @throws error on invalid (too short) path
 * @returns point given by distance along path; last point if distance > path length
 */
export function getPointAlongPath(
    path: readonly Vector2[],
    distance: number,
): Vector2 {
    if (path.length < 2) {
        throw Error("invalid path");
    }
    let remaining = distance;
    for (let i = 0; i < path.length - 1; i++) {
        const p0 = path[i];
        const p1 = path[i + 1];
        if (!p0 || !p1) {
            continue;
        }

        const segmentLength = Math2.distance(p0, p1);
        if (remaining <= segmentLength) {
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const t = segmentLength === 0 ? 0 : remaining / segmentLength;
            return {
                x: p0.x + t * dx,
                y: p0.y + t * dy,
            };
        } else {
            remaining -= segmentLength;
        }
    }

    // If distance exceeds path length, return last point
    // ! safety: length of path was checked earlier
    return path[path.length - 1]!;
}

export const MOTION_BEHAVIORS = {
    getDirectionOffset: (
        direction: Direction,
        amountUnknown: unknown,
        units: CellsPixelsUnits,
    ): Vector2 => {
        const amount = Number(amountUnknown);
        if (!isFinite(amount) || isNaN(amount)) {
            console.warn(`[getDirectionOffset] amount invalid: ${amount}`);
            return ORIGIN;
        }
        const grid = usePlayerStorage.getState().grid;
        const vec =
            DIRECTIONS[units === "CELLS" ? grid.type : "SQUARE"][direction];

        const distanceMultiplier = {
            CELLS: grid.dpi,
            PIXELS: 1,
            UNITS: grid.dpi / grid.parsedScale.multiplier,
        }[units];

        return {
            x: vec.x * amount * distanceMultiplier,
            y: vec.y * amount * distanceMultiplier,
        };
    },

    getForwardOffset: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        amountUnknown: unknown,
        units: CellsPixelsUnits,
    ): Promise<Vector2> => {
        const amount = Number(amountUnknown);
        if (!isFinite(amount) || isNaN(amount)) {
            console.warn(`[getForwardOffset] amount invalid: ${amount}`);
            return ORIGIN;
        }

        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        if (!selfItem) {
            return ORIGIN;
        }
        signal.throwIfAborted();

        // Convert rotation to radians
        // In Owlbear Rodeo, 0° is up (negative Y direction)
        const angleRadians = (selfItem.rotation * Math.PI) / 180;

        // Calculate forward direction vector
        // Since 0° is up, we use sin for x and -cos for y
        const forwardX = Math.sin(angleRadians);
        const forwardY = -Math.cos(angleRadians);

        const grid = usePlayerStorage.getState().grid;

        const distanceMultiplier = {
            CELLS: grid.dpi,
            PIXELS: 1,
            UNITS: grid.dpi / grid.parsedScale.multiplier,
        }[units];

        const distance = amount * distanceMultiplier;

        return {
            x: forwardX * distance,
            y: forwardY * distance,
        };
    },

    goto: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        xUnknown: unknown,
        yUnknown: unknown,
    ) => {
        const x = Number(xUnknown);
        if (!isFinite(x) || isNaN(x)) {
            console.warn(`[goto] x invalid: ${x}`);
            return;
        }
        const y = Number(yUnknown);
        if (!isFinite(y) || isNaN(y)) {
            console.warn(`[goto] y invalid: ${y}`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            draft.position = { x, y };
        });
        signal.throwIfAborted();
    },

    /**
     * @returns loop check
     */
    glide: async (
        signal: AbortSignal,
        loopCheck: number,
        selfIdUnknown: unknown,
        durationUnknown: unknown,
        xUnknown: unknown,
        yUnknown: unknown,
    ): Promise<number> => {
        const itemProxy = ItemProxy.getInstance();
        const selfItem = await itemProxy.get(String(selfIdUnknown));
        if (!selfItem) {
            console.warn(`[glide] self does not exist`);
            return loopCheck;
        }
        const duration = Number(durationUnknown);
        if (!isFinite(duration) || isNaN(duration) || duration < 0) {
            console.warn(`[glide] duration invalid: ${duration}`);
            return loopCheck;
        }
        const x = Number(xUnknown);
        if (!isFinite(x) || isNaN(x)) {
            console.warn(`[glide] x invalid: ${x}`);
            return loopCheck;
        }
        const y = Number(yUnknown);
        if (!isFinite(y) || isNaN(y)) {
            console.warn(`[glide] y invalid: ${y}`);
            return loopCheck;
        }

        let stop;
        try {
            const startPosition = selfItem.position;
            if (duration > 0) {
                const interaction = await itemProxy.attachInteraction(selfItem);
                const update = interaction[0];
                stop = interaction[1];

                const startTime = Date.now();
                const maxRunTime = duration * 1000;
                let elapsedTime = 0;

                while (elapsedTime < maxRunTime) {
                    loopCheck = loopTrap(loopCheck);

                    update((self) => {
                        self.position.x =
                            startPosition.x +
                            (elapsedTime / maxRunTime) * (x - startPosition.x);
                        self.position.y =
                            startPosition.y +
                            (elapsedTime / maxRunTime) * (y - startPosition.y);
                    });
                    await new Promise((resolve) => setTimeout(resolve, 30));
                    signal.throwIfAborted();
                    elapsedTime = Date.now() - startTime;
                }
            }
            await itemProxy.update(String(selfIdUnknown), (self) => {
                self.position.x = x;
                self.position.y = y;
            });
            signal.throwIfAborted();
        } catch (e) {
            complain(String(e));
        } finally {
            stop?.();
        }

        signal.throwIfAborted();
        return loopCheck;
    },

    /**
     * @returns loop check
     */
    glideRotate: async (
        signal: AbortSignal,
        loopCheck: number,
        selfIdUnknown: unknown,
        durationUnknown: unknown,
        thetaUnknown: unknown,
    ): Promise<number> => {
        const itemProxy = ItemProxy.getInstance();
        const selfItem = await itemProxy.get(String(selfIdUnknown));
        if (!selfItem) {
            console.warn(`[glide] self does not exist`);
            return loopCheck;
        }
        const duration = Number(durationUnknown);
        if (!isFinite(duration) || isNaN(duration) || duration < 0) {
            console.warn(`[glideRotate] duration invalid: ${duration}`);
            return loopCheck;
        }
        const theta = Number(thetaUnknown);
        if (!isFinite(theta) || isNaN(theta)) {
            console.warn(`[glideRotate] theta invalid: ${theta}`);
            return loopCheck;
        }

        let stop;
        try {
            const startRotation = selfItem.rotation;
            if (duration > 0) {
                const interaction = await itemProxy.attachInteraction(selfItem);
                const update = interaction[0];
                stop = interaction[1];

                const startTime = Date.now();
                const maxRunTime = duration * 1000;
                let elapsedTime = 0;

                while (elapsedTime < maxRunTime) {
                    loopCheck = loopTrap(loopCheck);

                    update((self) => {
                        self.rotation =
                            startRotation + (elapsedTime / maxRunTime) * theta;
                    });
                    await new Promise((resolve) => setTimeout(resolve, 30));
                    signal.throwIfAborted();
                    elapsedTime = Date.now() - startTime;
                }
            }
            await itemProxy.update(String(selfIdUnknown), (self) => {
                self.rotation = (startRotation + theta + 360) % 360;
            });
            signal.throwIfAborted();
        } catch (e) {
            complain(String(e));
        } finally {
            stop?.();
        }

        signal.throwIfAborted();
        return loopCheck;
    },

    face: async (signal: AbortSignal, selfId: unknown, targetId: unknown) => {
        if (typeof selfId !== "string") {
            console.warn(`[face] self is required`);
            return;
        }

        if (typeof targetId !== "string") {
            // If target is undefined, don't rotate at all
            return;
        }

        const selfItem = await ItemProxy.getInstance().get(selfId);
        const targetItem = await ItemProxy.getInstance().get(targetId);
        signal.throwIfAborted();
        if (!selfItem || !targetItem) {
            return;
        }

        // Calculate direction vector
        const dx = targetItem.position.x - selfItem.position.x;
        const dy = targetItem.position.y - selfItem.position.y;

        // Calculate angle in radians
        // atan2 gives angle from positive x-axis, but in Owlbear 0° is up (negative y)
        // So we adjust by adding π/2 to make 0° point up
        const angleRadians = Math.atan2(dy, dx) + Math.PI / 2;

        // Convert to degrees and normalize to 0-360 range
        const angleDegrees = ((angleRadians * 180) / Math.PI + 360) % 360;

        await ItemProxy.getInstance().update(selfId, (self) => {
            self.rotation = angleDegrees;
        });
        signal.throwIfAborted();
    },

    snapToGrid: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        if (!selfItem) {
            console.warn(`[snapToGrid] self does not exist`);
            return;
        }

        const snappedPosition = await OBR.scene.grid.snapPosition(
            selfItem.position,
            1,
        );

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.position = snappedPosition;
        });
        signal.throwIfAborted();
    },

    pathfind: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        distUnknown: unknown,
        targetId: unknown,
    ) => {
        const dist = Number(distUnknown);
        if (!isFinite(dist) || isNaN(dist)) {
            console.warn(`[pathfind] invalid distance: ${dist}`);
            return;
        }

        const itemProxy = ItemProxy.getInstance();
        const selfItem = await itemProxy.get(String(selfIdUnknown));
        const targetItem = await itemProxy.get(String(targetId));
        signal.throwIfAborted();
        if (!selfItem || !targetItem || !isBoundableItem(selfItem)) {
            return;
        }

        const grid = usePlayerStorage.getState().grid;

        const bbox = getBounds(selfItem, grid);
        const radius = Math.max(bbox.width, bbox.height) / 2;

        const walls = await OBR.scene.local.getItems(isWall);

        const path = findPath(
            walls.map((wall) => getWorldPoints(wall, grid)),
            selfItem.position,
            targetItem.position,
            radius,
        );

        if (path) {
            // debugLineString(path, 1000);
            // if the path doesn't start at the self item, then it was
            // reversed due to the reverse A* algorithm, so reverse it back
            if (
                selfItem.position.x !== path[0]?.x ||
                selfItem.position.y !== path[0]?.y
            ) {
                path.reverse();
            }
            const distPx = unitsToPixels(units(dist), grid);
            const position = getPointAlongPath(path, distPx);

            // TODO disable lights for self so it can go thru walls when turning around
            // corners
            await itemProxy.update(selfItem, (draft) => {
                draft.position = position;
            });
        }
        signal.throwIfAborted();
    },

    setAttachmentConstraint: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        enable: boolean,
        constraintUnknown: unknown,
    ) => {
        const constraint = String(constraintUnknown);

        if (!isAttachmentBehavior(constraint)) {
            console.warn(
                `[setAttachmentConstraint] invalid constraint: ${constraint}`,
            );
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            const enabled =
                !self.disableAttachmentBehavior?.includes(constraint);
            if (enable && !enabled) {
                // want to enable, so remove from disabled list
                self.disableAttachmentBehavior =
                    self.disableAttachmentBehavior?.filter(
                        (c) => c !== constraint,
                    );
            } else if (!enable && enabled) {
                // add to disabled list
                self.disableAttachmentBehavior = [
                    ...(self.disableAttachmentBehavior ?? []),
                    constraint,
                ];
            }
        });
        signal.throwIfAborted();
    },
};
