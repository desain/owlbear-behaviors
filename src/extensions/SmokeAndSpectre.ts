import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";
import type { Units } from "owlbear-utils";

const KEY_HAS_VISION = "com.battle-system.smoke/hasVision";

export const SmokeAndSpectre = {
    hasVision: (item: Item): boolean => !!item.metadata[KEY_HAS_VISION],

    /**
     * Add vision to an item draft.
     */
    addVision: (
        item: Draft<Item>,
        attenuationRadius: Units,
        shape: "circle" | "cone",
    ): void => {
        // Set the base vision metadata
        item.metadata[KEY_HAS_VISION] = true;
        item.metadata["com.battle-system.smoke/visionRange"] =
            String(attenuationRadius);

        if (shape === "cone") {
            item.metadata["com.battle-system.smoke/visionInAngle"] = "45";
            item.metadata["com.battle-system.smoke/visionOutAngle"] = "60";
        } else {
            item.metadata["com.battle-system.smoke/visionInAngle"] = "360";
            item.metadata["com.battle-system.smoke/visionOutAngle"] = "360";
        }
    },

    disableVision: (item: Draft<Item>): void => {
        delete item.metadata[KEY_HAS_VISION];
    },
};
