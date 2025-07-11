import type { HexColor } from "owlbear-utils";
import {
    BLOCK_COLOR_PICKER,
    BLOCK_CONTROL_ITEM_MENU,
    BLOCK_DYNAMIC_VAL,
    BLOCK_SENSING_ITEM_MENU,
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
