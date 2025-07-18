import * as Blockly from "blockly";
import type { ConstantProvider } from "./ConstantProvider";

/**
 * Big round corner for define blocks.
 */
export class BigRoundCorner extends Blockly.blockRendering.Measurable {
    static readonly LEFT = 1 << 24; // first unused iota in https://github.com/google/blockly/blob/908712e19d2d028df9352f55be9046a47eeae303/core/renderers/measurables/types.ts
    static readonly RIGHT = 1 << 25;

    constructor(constants: ConstantProvider, opt_position?: string) {
        super(constants);

        this.type |=
            !opt_position || opt_position === "left"
                ? BigRoundCorner.LEFT
                : BigRoundCorner.RIGHT;

        // cat top left corners are wider for cat features
        this.width =
            constants.DEFINE_HAT_CORNER_RADIUS * (constants.isCat() ? 2 : 1);
        // The rounded corner extends into the next row by 4 so we only take the
        // height that is aligned with this row.
        // TODO subtract instead of divide?
        this.height = constants.DEFINE_HAT_CORNER_RADIUS / 2;
    }
}

export function isLeftBigRoundCorner(
    measurable: Blockly.blockRendering.Measurable,
): boolean {
    return (measurable.type & BigRoundCorner.LEFT) >= 1;
}

export function isRightBigRoundCorner(
    measurable: Blockly.blockRendering.Measurable,
): boolean {
    return (measurable.type & BigRoundCorner.RIGHT) >= 1;
}
