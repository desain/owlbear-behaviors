import type { HexColor } from "owlbear-utils";
import {
    BLOCK_BROADCAST_MENU,
    BLOCK_BROADCAST_TARGET_MENU,
    BLOCK_COLOR_PICKER,
    BLOCK_CONTROL_ITEM_MENU,
    BLOCK_DYNAMIC_VAL,
    BLOCK_EVENTS_TAG_MENU,
    BLOCK_OPACITY_SLIDER,
    BLOCK_OTHER,
    BLOCK_SENSING_ITEM_MENU,
    BLOCK_SENSING_TAG_MENU,
    BLOCK_SOUND_MENU,
    BLOCK_URL,
} from "./blocks";

export function shadowNumber(n?: number) {
    return {
        shadow: {
            type: "math_number",
            fields: {
                NUM: n,
            },
        },
    };
}

export function shadowOpacitySlider(opacity: number) {
    return {
        shadow: {
            type: BLOCK_OPACITY_SLIDER.type,
            fields: {
                [BLOCK_OPACITY_SLIDER.args0[0].name]: opacity,
            },
        },
    };
}

export function shadowSoundMenu() {
    return {
        shadow: {
            type: BLOCK_SOUND_MENU.type,
        },
    };
}

export function shadowBroadcastMenu() {
    return {
        shadow: {
            type: BLOCK_BROADCAST_MENU.type,
        },
    };
}

export function shadowBroadcastTargetMenu() {
    return {
        shadow: {
            type: BLOCK_BROADCAST_TARGET_MENU.type,
        },
    };
}

export function shadowTagMenu(category: "sensing" | "events") {
    return {
        shadow: {
            type:
                category === "sensing"
                    ? BLOCK_SENSING_TAG_MENU.type
                    : BLOCK_EVENTS_TAG_MENU.type,
        },
    };
}

export function shadowOther() {
    return {
        shadow: {
            type: BLOCK_OTHER.type,
        },
    };
}

export function shadowDynamic(s?: string) {
    return {
        shadow: {
            type: BLOCK_DYNAMIC_VAL.type,
            fields: {
                [BLOCK_DYNAMIC_VAL.args0[0].name]: s,
            },
        },
    };
}

export function shadowColor(color: HexColor) {
    return {
        shadow: {
            type: BLOCK_COLOR_PICKER.type,
            fields: {
                [BLOCK_COLOR_PICKER.args0[0].name]: color,
            },
        },
    };
}

export function shadowItemMenu(category: "sensing" | "control") {
    return {
        shadow: {
            type:
                category === "sensing"
                    ? BLOCK_SENSING_ITEM_MENU.type
                    : BLOCK_CONTROL_ITEM_MENU.type,
        },
    };
}

export function shadowUrl(url: string) {
    return {
        shadow: {
            type: BLOCK_URL.type,
            fields: {
                [BLOCK_URL.args0[0].name]: url,
            },
        },
    };
}
