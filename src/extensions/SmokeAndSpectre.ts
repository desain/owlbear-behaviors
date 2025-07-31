import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";
import type { Units } from "owlbear-utils";

const KEY_HAS_VISION = "com.battle-system.smoke/hasVision";
const KEY_IS_VISION_LINE = "com.battle-system.smoke/isVisionLine";
const KEY_DISABLED = "com.battle-system.smoke/disabled";
const KEY_BLOCKING = "com.battle-system.smoke/blocking";
const KEY_DOUBLE_SIDED = "com.battle-system.smoke/doubleSided";
const KEY_IS_DOOR_LOCKED = "com.battle-system.smoke/isDoorLocked";
const KEY_DOOR_OPEN = "com.battle-system.smoke/doorOpen";
const KEY_IS_DOOR = "com.battle-system.smoke/isDoor";
const KEY_IS_WINDOW = "com.battle-system.smoke/isWindow";

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

    setVisionLine: (item: Draft<Item>, enabled: boolean): void => {
        if (enabled) {
            delete item.metadata[KEY_DISABLED];
            item.metadata[KEY_IS_VISION_LINE] = true;
        } else {
            item.metadata[KEY_DISABLED] = true;
        }
    },

    setPassable: (item: Draft<Item>, passable: boolean): void => {
        if (passable) {
            delete item.metadata[KEY_BLOCKING];
        } else {
            item.metadata[KEY_BLOCKING] = true;
        }
    },

    setSided: (item: Draft<Item>, doubleSided: boolean): void => {
        if (doubleSided) {
            item.metadata[KEY_DOUBLE_SIDED] = true;
        } else {
            delete item.metadata[KEY_DOUBLE_SIDED];
        }
    },

    setDoorLocked: (item: Draft<Item>, locked: boolean): void => {
        if (locked) {
            item.metadata[KEY_IS_DOOR_LOCKED] = true;
        } else {
            delete item.metadata[KEY_IS_DOOR_LOCKED];
        }
    },

    setDoorOpen: (item: Draft<Item>, open: boolean): void => {
        if (open) {
            item.metadata[KEY_DOOR_OPEN] = true;
            item.metadata[KEY_DISABLED] = true;
        } else {
            delete item.metadata[KEY_DOOR_OPEN];
            delete item.metadata[KEY_DISABLED];
        }
    },

    setDoorEnabled: (item: Draft<Item>, enabled: boolean): void => {
        if (enabled) {
            item.metadata[KEY_IS_DOOR] = true;
        } else {
            delete item.metadata[KEY_IS_DOOR];
        }
    },

    setWindowEnabled: (item: Draft<Item>, enabled: boolean): void => {
        if (enabled) {
            item.metadata[KEY_IS_WINDOW] = true;
        } else {
            delete item.metadata[KEY_IS_WINDOW];
        }
    },
};
