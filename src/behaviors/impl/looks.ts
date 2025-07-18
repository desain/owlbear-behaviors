import OBR, {
    buildLabel,
    isImage,
    isText,
    type Descendant,
    type Item,
} from "@owlbear-rodeo/sdk";
import { assertItem, isLayer, type ImageBuildParams } from "owlbear-utils";
import { getBounds, isBoundableItem } from "../../collision/getBounds";
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

export const LOOKS_BEHAVIORS = {
    say: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        message: unknown,
        secsUnknown: unknown,
    ) => {
        const secs = Number(secsUnknown);
        if (!isFinite(secs) || isNaN(secs) || secs <= 0) {
            console.warn(`[say] secs invalid: ${secs}`);
            return;
        }

        const self = await ItemProxy.getInstance().get(String(selfIdUnknown));
        if (!self) {
            return;
        }
        const { center, min } = isBoundableItem(self)
            ? getBounds(self, usePlayerStorage.getState().grid)
            : { center: self.position, min: self.position };

        const label = buildLabel()
            .plainText(String(message))
            .attachedTo(self.id)
            .position({
                x: center.x,
                y: min.y + SPEECH_VERTICAL_OFFSET,
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

    getText: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<string> => {
        const selfId = String(selfIdUnknown);
        const self = await ItemProxy.getInstance().get(selfId);
        signal.throwIfAborted();
        if (!self) {
            console.warn(`[getText] Item not found: ${selfId}`);
            return "";
        }

        return getText(self);
    },

    setText: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        textUnknown: unknown,
    ) => {
        console.log(textUnknown);
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
            console.warn(`[setLayer] invalid layer: ${layer}`);
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
};
