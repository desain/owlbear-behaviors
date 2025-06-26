import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";
import type { Pixels } from "owlbear-utils";

const METADATA_KEY = "rodeo.owlbear.dynamic-fog/light";

export const Fog = {
    hasLight: (item: Item): boolean => !!item.metadata[METADATA_KEY],

    /**
     * Add a light to an item draft.
     */
    addLight: (
        item: Draft<Item>,
        attenuationRadiusPixels: Pixels,
        shape: "circle" | "cone",
    ): void => {
        const baseMetadata = {
            attenuationRadius: attenuationRadiusPixels,
            sourceRadius: 25,
            falloff: 0.2,
        };

        if (shape === "cone") {
            item.metadata[METADATA_KEY] = {
                ...baseMetadata,
                innerAngle: 45,
                outerAngle: 60,
            };
        } else {
            item.metadata[METADATA_KEY] = baseMetadata;
        }
    },

    removeLight: (item: Draft<Item>): void => {
        delete item.metadata[METADATA_KEY];
    },
};
