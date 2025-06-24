import OBR, {
    buildLabel,
    isImage,
    type GridType,
    type Vector2,
} from "@owlbear-rodeo/sdk";
import {
    ANGLE_DIMETRIC_RADIANS,
    assertItem,
    isHexColor,
    isLayer,
    ORIGIN,
    SQRT_3,
    withTimeout,
    type ImageBuildParams,
} from "owlbear-utils";
import { isBehaviorItem, type BehaviorItem } from "../BehaviorItem";
import type { BLOCK_MOVE_DIRECTION } from "../blockly/blocks";
import {
    broadcastPlaySound,
    notifyPlayersToDeselect,
    sendMessage,
} from "../broadcast/broadcast";
import { getBounds, isBoundableItem } from "../collision/getBounds";
import { METADATA_KEY_EFFECT, METADATA_KEY_TAGS } from "../constants";
import { Announcement } from "../extensions/Announcement";
import { Auras } from "../extensions/Auras";
import { Hoot } from "../extensions/Hoot";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { isEffectTarget, type EffectType } from "../watcher/EffectsWatcher";
import { ItemProxy } from "./ItemProxy";

/**
 * Px to move the tail of the speech bubble down from the top of the token.
 */
const SPEECH_VERTICAL_OFFSET = 30;

const X_OFFSET_DIMETRIC = 1 / Math.tan(ANGLE_DIMETRIC_RADIANS);

/**
 * When diagonally moving hexes, the offset of the next hex on the non-dpi axis.
 */
const HEX_DIAG_OFFSET = 1.5 / SQRT_3;

const DIRECTIONS: Record<GridType, Record<Direction, Vector2>> = {
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

type Direction = Exclude<
    (typeof BLOCK_MOVE_DIRECTION)["args0"][0]["options"][number][1],
    "FORWARD"
>;

type Units = (typeof BLOCK_MOVE_DIRECTION)["args0"][2]["options"][number][1];

function loopTrap(loopCheck: number): number {
    if (--loopCheck <= 0) {
        throw Error("Exhausted loop iterations");
    }
    return loopCheck;
}

export const BEHAVIORS_IMPL = {
    sendMessage,
    isHexColor,

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
        if (!isBehaviorItem(item)) {
            return false;
        }
        signal.throwIfAborted();
        return !!item?.metadata[METADATA_KEY_TAGS]?.includes(
            String(tagUnknown),
        );
    },

    getDirectionOffset: (
        direction: Direction,
        amountUnknown: unknown,
        units: Units,
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
        units: Units,
    ): Promise<Vector2> => {
        const amount = Number(amountUnknown);
        if (!isFinite(amount) || isNaN(amount)) {
            console.warn(`[getForwardOffset] amount invalid: ${amount}`);
            return ORIGIN;
        }

        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
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

    deselect: async (ids?: string[]) => {
        const isGm = usePlayerStorage.getState().role === "GM";
        if (isGm) {
            await OBR.player.deselect(ids);
        } else {
            await notifyPlayersToDeselect(ids);
        }
    },

    say: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        message: unknown,
        secsUnknown: unknown,
    ) => {
        if (!self) {
            throw Error("Self must be an Item");
        }
        const secs = Number(secsUnknown);
        if (!isFinite(secs) || isNaN(secs) || secs <= 0) {
            console.warn(`[say] secs invalid: ${secs}`);
            return;
        }

        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        if (!isBoundableItem(selfItem)) {
            return;
        }
        const bounds = getBounds(selfItem, usePlayerStorage.getState().grid);

        const label = buildLabel()
            .plainText(String(message))
            .attachedTo(selfItem.id)
            .position({
                x: bounds.center.x,
                y: bounds.min.y + SPEECH_VERTICAL_OFFSET,
            })
            .backgroundColor("#FFFFFF")
            .backgroundOpacity(1)
            .locked(true)
            .disableHit(true)
            .layer("TEXT")
            .fillColor("#000000")
            .textAlign("CENTER")
            .pointerHeight(50)
            .pointerWidth(20)
            .build();
        await OBR.scene.items.addItems([label]);
        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
        ItemProxy.getInstance().invalidate();
        await OBR.scene.items.deleteItems([label.id]);
        signal.throwIfAborted();
    },

    setEffect: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        effectType: EffectType,
        intensityUnknown: unknown,
        relative: boolean,
    ) => {
        const intensity = Number(intensityUnknown) / 100;
        if (!isFinite(intensity) || isNaN(intensity)) {
            console.warn(`[setEffect] intensity invalid: ${intensity}`);
            return;
        }
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            assertItem(draft, isEffectTarget);
            const effectConfig = draft.metadata[METADATA_KEY_EFFECT] ?? {};
            const oldIntensity = effectConfig[effectType] ?? 0;
            const newIntensity = Math.max(
                0,
                Math.min(1, relative ? oldIntensity + intensity : intensity),
            );

            if (newIntensity <= 0) {
                delete effectConfig[effectType];
            } else {
                effectConfig[effectType] = newIntensity;
            }

            if (Object.keys(effectConfig).length === 0) {
                delete draft.metadata[METADATA_KEY_EFFECT];
            } else {
                // set fill opacity to a low value so effect can handle fill
                // but user can still click in the shape
                draft.style.fillOpacity = 0.1;
                draft.metadata[METADATA_KEY_EFFECT] = effectConfig;
            }
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
            const selfItem = await ItemProxy.getInstance().get(
                String(selfIdUnknown),
            );
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
            const selfItem = await ItemProxy.getInstance().get(
                String(selfIdUnknown),
            );
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

    setSize: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        sizeUnknown: unknown,
    ) => {
        const size = Number(sizeUnknown);
        if (!isFinite(size) || isNaN(size)) {
            console.warn(`[setSize] size invalid: ${size}`);
            return;
        }

        const scale = size / 100;
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.scale.x = scale;
            self.scale.y = scale;
        });
        signal.throwIfAborted();
    },

    changeSize: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        deltaUnknown: unknown,
    ) => {
        const delta = Number(deltaUnknown);
        if (!isFinite(delta) || isNaN(delta)) {
            console.warn(`[changeSize] delta invalid: ${delta}`);
            return;
        }

        const scaledDelta = delta / 100;
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.scale.x = self.scale.x + scaledDelta;
            self.scale.y = self.scale.y + scaledDelta;
        });
        signal.throwIfAborted();
    },

    replaceImage: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        { image, grid }: ImageBuildParams,
    ): Promise<null> => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (!isImage(self)) {
                console.warn("replace image called on non-image");
                return;
            }
            self.image = image;
            self.grid = grid;
        });
        signal.throwIfAborted();
        return null;
    },

    setName: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        labelUnknown: unknown,
    ) => {
        const label = String(labelUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (isImage(self)) {
                self.text.plainText = label;
            } else {
                self.name = label;
            }
        });
        signal.throwIfAborted();
    },

    setLayer: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        layerUnknown: unknown,
    ) => {
        const layer = String(layerUnknown);
        if (!isLayer(layer)) {
            console.warn(`[setLayer] invalid layer: ${layer}`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.layer = layer;
        });

        signal.throwIfAborted();
    },

    playSoundUntilDone: async (
        signal: AbortSignal,
        soundNameUnknown: unknown,
    ): Promise<void> => {
        const soundName = String(soundNameUnknown);
        const state = usePlayerStorage.getState();
        const sound = state.sceneMetadata.sounds[soundName];
        if (!sound) {
            console.warn(`[playSoundUntilDone] Sound not found: ${soundName}`);
            return;
        }

        if (state.role === "GM") {
            void broadcastPlaySound(soundName);
        }

        await withTimeout(
            new Promise<void>((resolve, reject) => {
                const handleAbort = () => {
                    signal.removeEventListener("abort", handleAbort);
                    reject(Error(String(signal.reason)));
                };

                // https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
                if (signal.aborted) {
                    handleAbort();
                    return;
                }

                signal.addEventListener("abort", handleAbort);

                try {
                    const audio = new Audio(sound.url);
                    audio.addEventListener("ended", () => {
                        signal.removeEventListener("abort", handleAbort);
                        resolve();
                    });
                    audio.addEventListener("error", (e) => {
                        signal.removeEventListener("abort", handleAbort);
                        reject(Error(e.message));
                    });
                    audio.addEventListener("canplaythrough", () => {
                        if (signal.aborted) {
                            handleAbort();
                            return;
                        }
                        void audio.play();
                    });
                } catch (e) {
                    reject(
                        Error(
                            `[playSoundUntilDone] Could not play sound: ${
                                sound.url
                            }: ${String(e)}`,
                        ),
                    );
                }
            }),
            20_000,
        );
        signal.throwIfAborted();
    },

    findClosestTagged: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        tagUnknown: unknown,
    ): Promise<BehaviorItem["id"] | undefined> => {
        const tag = String(tagUnknown);
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
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

    announce: (signal: AbortSignal, message: unknown, secsUnknown: unknown) => {
        const secs = Number(secsUnknown);
        if (!isFinite(secs) || isNaN(secs) || secs <= 0) {
            console.warn(`[announce] secs invalid: ${secs}`);
            return;
        }

        return Announcement.announce(signal, String(message), secs);
    },

    hoot: async (signal: AbortSignal, track: unknown, playlist: unknown) => {
        await Hoot.play(String(playlist), String(track), false);
        signal.throwIfAborted();
    },

    removeAuras: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        if (typeof selfIdUnknown === "string") {
            await Auras.removeAll(selfIdUnknown);
            signal.throwIfAborted();
        }
    },

    addAura: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        styleUnknown: unknown,
        colorUnknown: unknown,
        sizeUnknown: unknown,
    ) => {
        if (typeof selfIdUnknown !== "string") {
            return;
        }

        const size = Number(sizeUnknown);
        if (!isFinite(size) || isNaN(size)) {
            console.warn(`[addAura] size invalid: ${size}`);
            return;
        }

        const color = String(colorUnknown);
        if (!isHexColor(color)) {
            console.warn(`[addAura] color invalid: ${color}`);
            return;
        }

        await Auras.add(selfIdUnknown, String(styleUnknown), color, size);
        signal.throwIfAborted();
    },
};
