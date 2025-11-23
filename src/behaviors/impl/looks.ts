import OBR, {
    buildImage,
    buildLabel,
    isImage,
    isText,
    Math2,
    type Descendant,
    type ImageContent,
    type Item,
    type Vector2,
} from "@owlbear-rodeo/sdk";
import {
    assertItem,
    complain,
    getBounds,
    isBoundableItem,
    isLayer,
    isObject,
    isVector2,
    ORIGIN,
} from "owlbear-utils";
import type { ImageFieldValue } from "../../blockly/FieldTokenImage";
import {
    broadcastSetViewport,
    broadcastShowSpeechBubble,
} from "../../broadcast/broadcast";
import { METADATA_KEY_EFFECT } from "../../constants";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import {
    isEffectTarget,
    type BehaviorEffectType,
} from "../../watcher/EffectsWatcher";
import { ItemProxy } from "../ItemProxy";

/**
 * Px to move the tail of the speech bubble down from the top of the token.
 */
const SPEECH_VERTICAL_OFFSET = 30;

export function getText(item: Item): string {
    function descendantText(descendant: Descendant, prefix = ""): string {
        if ("text" in descendant) {
            const surrounding =
                (descendant.bold ? "**" : "") + (descendant.italic ? "_" : "");
            return (
                prefix +
                surrounding +
                descendant.text +
                surrounding.split("").reverse().join("")
            );
        } else {
            switch (descendant.type) {
                case "paragraph":
                case "list-item": // the parent will set the right prefix
                    return prefix + descendantsText(descendant.children);
                case "heading-one":
                    return "# " + descendantsText(descendant.children);
                case "heading-two":
                    return "## " + descendantsText(descendant.children);
                case "bulleted-list":
                    return descendantsText(descendant.children, "\n", "- ");
                case "numbered-list":
                    return descendant.children
                        .map((descendant, i) =>
                            descendantText(descendant, `${i + 1}. `),
                        )
                        .join("\n");
            }
        }
    }

    function descendantsText(
        descendants: Descendant[],
        between = "",
        prefix = "",
    ): string {
        return descendants
            .map((descendant) => descendantText(descendant, prefix))
            .join(between);
    }

    if (isImage(item) || isText(item)) {
        return item.text.type === "PLAIN"
            ? item.text.plainText
            : descendantsText(item.text.richText, "\n");
    } else {
        return item.name;
    }
}

export interface SpeechBubbleParams {
    readonly message: string;
    readonly position: Vector2;
    readonly attachedTo: Item["id"];
    readonly millis: number;
}

export function isSpeechBubbleParams(
    params: unknown,
): params is SpeechBubbleParams {
    return (
        isObject(params) &&
        "message" in params &&
        typeof params.message === "string" &&
        "position" in params &&
        isVector2(params.position) &&
        "attachedTo" in params &&
        typeof params.attachedTo === "string" &&
        "millis" in params &&
        typeof params.millis === "number"
    );
}

export async function showSpeechBubble({
    message,
    attachedTo,
    position,
    millis,
}: SpeechBubbleParams) {
    const label = buildLabel()
        .plainText(message)
        .attachedTo(attachedTo)
        .position(position)
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
    await OBR.scene.local.addItems([label]);
    await new Promise((resolve) => setTimeout(resolve, millis));
    await OBR.scene.local.deleteItems([label.id]);
}

/**
 * Animate the viewport to zoom to specified scale and move to the specified center.
 */
export async function setViewport(
    zoom?: number,
    newWorldCenter?: Vector2,
): Promise<void> {
    const [viewportWidth, viewportHeight, currentScale, worldTopLeft] =
        await Promise.all([
            OBR.viewport.getWidth(),
            OBR.viewport.getHeight(),
            OBR.viewport.getScale(),
            OBR.viewport.inverseTransformPoint(ORIGIN),
        ]);

    // OBR's max zoom is 1000% and min is 2%
    const scale =
        zoom !== undefined
            ? Math.max(0.02, Math.min(10, zoom / 100))
            : currentScale;

    // Get the center of the viewport in screen-space
    const viewportCenter: Vector2 = {
        x: viewportWidth / 2,
        y: viewportHeight / 2,
    };

    const worldCenter = await OBR.viewport.inverseTransformPoint(
        viewportCenter,
    );

    // Vector from center to top left
    const worldTopLeftDelta = Math2.subtract(worldTopLeft, worldCenter);

    // multiplying by current scale gives us the top left world position if we
    // were at 100% scale.
    // dividing that by new scale gives us top left world position in new scale
    const zoomedWorldTopLeft = Math2.add(
        worldCenter,
        Math2.multiply(worldTopLeftDelta, currentScale / scale),
    );

    const worldDelta =
        newWorldCenter !== undefined
            ? Math2.subtract(newWorldCenter, worldCenter)
            : ORIGIN;

    const newWorldTopLeft = Math2.add(zoomedWorldTopLeft, worldDelta);

    await OBR.viewport.animateTo({
        position: Math2.multiply(newWorldTopLeft, -scale),
        scale: scale,
    });
}

/**
 * Get an existing
 * @param id ID of parent item
 * @param url URL to look for in attachment image
 * @returns Attachment, or undefined if it doesn't exist
 */
async function getAttachment(
    id: Item["id"],
    { url }: Pick<ImageContent, "url">,
) {
    const attachedItems = await OBR.scene.items.getItemAttachments([id]);
    return attachedItems.find(
        (item) => isImage(item) && item.id !== id && item.image.url === url,
    );
}

export const LOOKS_BEHAVIORS = {
    say: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        message: unknown,
        secsUnknown: unknown,
    ) => {
        const secs = Number(secsUnknown);
        if (!isFinite(secs) || isNaN(secs) || secs <= 0) {
            complain(`[say] duration invalid: ${secs}`);
            return;
        }

        const self = await ItemProxy.getInstance().get(String(selfIdUnknown));
        if (!self) {
            return;
        }
        const { center, min } = isBoundableItem(self)
            ? getBounds(self, usePlayerStorage.getState().grid)
            : { center: self.position, min: self.position };
        const position = {
            x: center.x,
            y: min.y + SPEECH_VERTICAL_OFFSET,
        };

        const params = {
            message: String(message),
            position,
            attachedTo: self.id,
            millis: secs * 1000,
        };

        if (usePlayerStorage.getState().role === "GM") {
            void broadcastShowSpeechBubble(params);
        }
        await showSpeechBubble(params);

        ItemProxy.getInstance().invalidate();
        signal.throwIfAborted();
    },

    /**
     * @param dimension if unset, both X and Y. If 'X', only x; if 'Y', only y.
     */
    setSize: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        sizeUnknown: unknown,
        dimension?: unknown,
    ) => {
        const size = Number(sizeUnknown);
        if (!isFinite(size) || isNaN(size)) {
            complain(`[setSize] size invalid: ${size}`);
            return;
        }

        const scale = size / 100;
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (!dimension || dimension === "X") {
                self.scale.x = scale;
            }
            if (!dimension || dimension === "Y") {
                self.scale.y = scale;
            }
        });
        signal.throwIfAborted();
    },

    /**
     * @param dimension if unset, both X and Y. If 'X', only x; if 'Y', only y.
     */
    changeSize: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        deltaUnknown: unknown,
        dimension?: unknown,
    ) => {
        const delta = Number(deltaUnknown);
        if (!isFinite(delta) || isNaN(delta)) {
            complain(`[changeSize] delta invalid: ${delta}`);
            return;
        }

        const scaledDelta = delta / 100;
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (!dimension || dimension === "X") {
                self.scale.x = self.scale.x + scaledDelta;
            }
            if (!dimension || dimension === "Y") {
                self.scale.y = self.scale.y + scaledDelta;
            }
        });
        signal.throwIfAborted();
    },

    replaceImage: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        { image, grid }: ImageFieldValue,
    ): Promise<void> => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (!isImage(self)) {
                complain("[replaceImage] called on non-image");
                return;
            }
            self.image = image;
            self.grid = grid;
        });
        signal.throwIfAborted();
    },

    takeImageFrom: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        targetIdUnknown: unknown,
    ): Promise<void> => {
        const targetId = String(targetIdUnknown);
        const target = await ItemProxy.getInstance().get(targetId);
        signal.throwIfAborted();

        if (!target || !isImage(target)) {
            complain(`[takeImageFrom] Target image '${targetId}' not found`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (!isImage(self)) {
                complain("[takeImageFrom] called on non-image");
                return;
            }
            self.image = target.image;
            self.grid = target.grid;
        });
        signal.throwIfAborted();
    },

    addAttachment: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        { image, grid, imageName }: ImageFieldValue,
    ): Promise<void> => {
        const selfId = String(selfIdUnknown);

        // Don't create more than one of the same attachment
        if (await getAttachment(selfId, image)) {
            console.warn(
                `[Behaviors] Item already has attachment: ${imageName}`,
            );
            return;
        }

        const self = await ItemProxy.getInstance().get(selfId);
        if (!self) {
            return;
        }
        const attachment = buildImage(image, grid)
            .attachedTo(selfId)
            .layer("ATTACHMENT")
            .name(imageName)
            .position(self.position)
            .rotation(self.rotation)
            .scale(self.scale)
            .build();
        await OBR.scene.items.addItems([attachment]);
        signal.throwIfAborted();
    },

    removeAttachment: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        { image, imageName }: ImageFieldValue,
    ): Promise<void> => {
        const selfId = String(selfIdUnknown);
        const attachmentToRemove = await getAttachment(selfId, image);
        if (attachmentToRemove) {
            await OBR.scene.items.deleteItems([attachmentToRemove.id]);
        } else {
            console.warn(`[Behaviors] No attachment to delete: ${imageName}`);
        }
        signal.throwIfAborted();
    },

    hasAttachment: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        { image }: ImageFieldValue,
    ): Promise<boolean> => {
        const selfId = String(selfIdUnknown);
        const attachment = await getAttachment(selfId, image);
        signal.throwIfAborted();
        return !!attachment;
    },

    getText: async (
        signal: AbortSignal,
        itemIdUnknown: unknown,
    ): Promise<string> => {
        const itemId = String(itemIdUnknown);
        const item = await ItemProxy.getInstance().get(itemId);
        signal.throwIfAborted();
        if (!item) {
            complain(`[getText] Item not found: ${itemId}`);
            return "";
        }

        return getText(item);
    },

    getScale: async (
        signal: AbortSignal,
        itemIdUnknown: unknown,
    ): Promise<number> => {
        const itemId = String(itemIdUnknown);
        const item = await ItemProxy.getInstance().get(itemId);
        signal.throwIfAborted();
        if (!item) {
            complain(`[getScale] Item not found: ${itemId}`);
            return 0;
        }

        return item.scale.x * 100;
    },

    setText: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        textUnknown: unknown,
    ) => {
        const text = String(textUnknown).replace(
            /\\(.)/g,
            (match, code: string) => {
                if (code) {
                    switch (code) {
                        case "\\":
                            return "\\";
                        case "n":
                            return "\n";
                    }
                }
                return match;
            },
        );

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (isImage(self) || isText(self)) {
                switch (self.text.type) {
                    case "PLAIN":
                        self.text.plainText = text;
                        break;
                    case "RICH":
                        self.text.richText = text.split("\n").map((t) => ({
                            type: "paragraph",
                            children: [{ text: t }],
                        }));
                        break;
                }
            } else {
                self.name = text;
            }
        });
        signal.throwIfAborted();
    },

    getAccessibilityName: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<string> => {
        const selfId = String(selfIdUnknown);
        const self = await ItemProxy.getInstance().get(selfId);
        signal.throwIfAborted();
        return self?.name ?? "";
    },

    setAccessibilityName: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        nameUnknown: unknown,
    ) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.name = String(nameUnknown);
        });
        signal.throwIfAborted();
    },

    getAccessibilityDescription: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<string> => {
        const selfId = String(selfIdUnknown);
        const self = await ItemProxy.getInstance().get(selfId);
        signal.throwIfAborted();
        return self?.description ?? "";
    },

    setAccessibilityDescription: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        descriptionUnknown: unknown,
    ) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            self.description = String(descriptionUnknown);
        });
        signal.throwIfAborted();
    },

    setLayer: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        layerUnknown: unknown,
    ) => {
        const selfId = String(selfIdUnknown);
        const layer = String(layerUnknown).toUpperCase();

        if (isLayer(layer)) {
            await ItemProxy.getInstance().update(selfId, (self) => {
                self.layer = layer;
            });
        } else if (layer === "BACK OF CURRENT") {
            const self = await ItemProxy.getInstance().get(selfId);
            const itemsOnCurrentLayer = await OBR.scene.items.getItems(
                (item) => item.layer === self?.layer,
            );
            await ItemProxy.getInstance().update(selfId, (self) => {
                self.zIndex =
                    Math.min(
                        0,
                        ...itemsOnCurrentLayer.map((item) => item.zIndex),
                    ) - 1;
            });
        } else if (layer === "FRONT OF CURRENT") {
            const self = await ItemProxy.getInstance().get(selfId);
            const itemsOnCurrentLayer = await OBR.scene.items.getItems(
                (item) => item.layer === self?.layer,
            );
            await ItemProxy.getInstance().update(selfId, (self) => {
                self.zIndex =
                    Math.max(
                        0,
                        ...itemsOnCurrentLayer.map((item) => item.zIndex),
                    ) + 1;
            });
        } else {
            complain(`[setLayer] invalid layer: ${layer}`);
            return;
        }

        signal.throwIfAborted();
    },

    setEffect: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        effectType: BehaviorEffectType,
        intensityUnknown: unknown,
        relative: boolean,
    ) => {
        const intensity = Number(intensityUnknown) / 100;
        if (!isFinite(intensity) || isNaN(intensity)) {
            complain(`[setEffect] intensity invalid: ${intensity}`);
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
     * @param targetUnknown "MY" or "EVERYONE"
     * @param zoomUnknown 2-100 or undefined
     * @param xUnknown x position or undefined
     * @param yUnknown y position or undefined
     * @returns
     */
    setViewport: async (
        signal: AbortSignal,
        targetUnknown: unknown,
        zoomUnknown: unknown,
        xUnknown: unknown,
        yUnknown: unknown,
    ) => {
        const target = String(targetUnknown);
        if (target !== "MY" && target !== "EVERYONE") {
            console.warn(`[setViewport] target invalid: ${target}`);
            return;
        }

        const zoom =
            zoomUnknown === undefined ? undefined : Number(zoomUnknown);
        if (typeof zoom === "number" && (!isFinite(zoom) || isNaN(zoom))) {
            complain(`zoom invalid: ${zoom}`);
        }
        const x = xUnknown === undefined ? undefined : Number(xUnknown);
        if (typeof x === "number" && (!isFinite(x) || isNaN(x))) {
            complain(`[setViewport] x invalid: ${x}`);
        }
        const y = yUnknown === undefined ? undefined : Number(yUnknown);
        if (typeof y === "number" && (!isFinite(y) || isNaN(y))) {
            complain(`[setViewport] y invalid: ${y}`);
        }

        const center =
            x !== undefined && y !== undefined ? { x, y } : undefined;

        await setViewport(zoom, center);
        if (targetUnknown === "EVERYONE") {
            await broadcastSetViewport(zoom, center);
        }
        signal.throwIfAborted();
    },

    setFontSize: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        sizeUnknown: unknown,
    ) => {
        const size = Number(sizeUnknown);
        if (!isFinite(size) || isNaN(size) || size <= 0) {
            complain(`font size invalid: ${size}`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (isImage(self) || isText(self)) {
                self.text.style.fontSize = size;
            }
        });
        signal.throwIfAborted();
    },

    setTextColor: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        colorUnknown: unknown,
    ) => {
        const color = String(colorUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (isImage(self) || isText(self)) {
                self.text.style.fillColor = color;
            }
        });
        signal.throwIfAborted();
    },

    setFontFamily: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fontUnknown: unknown,
    ) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            if (isImage(self) || isText(self)) {
                self.text.style.fontFamily = String(fontUnknown);
            }
        });
        signal.throwIfAborted();
    },
};
