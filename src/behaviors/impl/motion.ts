import OBR, { type GridType, type Vector2 } from "@owlbear-rodeo/sdk";
import { ANGLE_DIMETRIC_RADIANS, ORIGIN, SQRT_3 } from "owlbear-utils";
import type { BLOCK_MOVE_DIRECTION } from "../../blockly/blocks";
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
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
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
                const interaction = await OBR.interaction.startItemInteraction([
                    selfItem,
                ]);
                const update = interaction[0];
                stop = interaction[1];

                const startTime = Date.now();
                const maxRunTime = duration * 1000;
                let elapsedTime = 0;

                while (elapsedTime < maxRunTime) {
                    loopCheck = loopTrap(loopCheck);

                    update(([self]) => {
                        if (self) {
                            self.position.x =
                                startPosition.x +
                                (elapsedTime / maxRunTime) *
                                    (x - startPosition.x);
                            self.position.y =
                                startPosition.y +
                                (elapsedTime / maxRunTime) *
                                    (y - startPosition.y);
                        }
                    });
                    await new Promise((resolve) => setTimeout(resolve, 30));
                    signal.throwIfAborted();
                    elapsedTime = Date.now() - startTime;
                }
            }
            await ItemProxy.getInstance().update(
                String(selfIdUnknown),
                (self) => {
                    self.position.x = x;
                    self.position.y = y;
                },
            );
            signal.throwIfAborted();
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
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
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
                const interaction = await OBR.interaction.startItemInteraction([
                    selfItem,
                ]);
                const update = interaction[0];
                stop = interaction[1];

                const startTime = Date.now();
                const maxRunTime = duration * 1000;
                let elapsedTime = 0;

                while (elapsedTime < maxRunTime) {
                    loopCheck = loopTrap(loopCheck);

                    update(([self]) => {
                        if (self) {
                            self.rotation =
                                startRotation +
                                (elapsedTime / maxRunTime) * theta;
                        }
                    });
                    await new Promise((resolve) => setTimeout(resolve, 30));
                    signal.throwIfAborted();
                    elapsedTime = Date.now() - startTime;
                }
            }
            await ItemProxy.getInstance().update(
                String(selfIdUnknown),
                (self) => {
                    self.rotation = (startRotation + theta + 360) % 360;
                },
            );
            signal.throwIfAborted();
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
};
