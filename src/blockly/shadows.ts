import type { HexColor } from "owlbear-utils";
import { BLOCK_COLOR_PICKER, BLOCK_DYNAMIC_VAL } from "./blocks";

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
                TEXT: s,
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
