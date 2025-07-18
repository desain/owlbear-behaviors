import * as Blockly from "blockly";
import { isDefineBlock } from "../procedures/blockDefine";
import { isLeftBigRoundCorner, isRightBigRoundCorner } from "./BigRoundCorner";
import { ConstantProvider } from "./ConstantProvider";
import { PathObject } from "./PathObject";

/**
 * Custom drawer that draws the define hat shape
 */
export class Drawer extends Blockly.zelos.Drawer {
    protected override drawTop_(): void {
        // CHANGE: check classes
        ConstantProvider.assertInstance(this.constants_);
        PathObject.assertInstance(this.block_.pathObject);

        const topRow = this.info_.topRow;
        const elements = topRow.elements;

        this.positionPreviousConnection_();
        this.outlinePath_ += Blockly.utils.svgPaths.moveBy(
            topRow.xPos,
            this.info_.startY +
                // CHANGE: hack to get define blocks to be shorter
                (isDefineBlock(this.block_)
                    ? this.constants_.DEFINE_HAT_CORNER_RADIUS
                    : 0),
        );
        for (let i = 0, elem; (elem = elements[i]); i++) {
            // CHANGE: check big round corners
            if (isLeftBigRoundCorner(elem)) {
                this.outlinePath_ += this.constants_.isCat()
                    ? this.constants_.DEFINE_HAT_LEFT_EAR_UP +
                      this.constants_.DEFINE_HAT_RIGHT_EAR_UP
                    : this.constants_.DEFINE_HAT_TOP_LEFT_CORNER;
            } else if (isRightBigRoundCorner(elem)) {
                this.outlinePath_ +=
                    this.constants_.DEFINE_HAT_TOP_RIGHT_CORNER;
            } else if (Blockly.blockRendering.Types.isLeftRoundedCorner(elem)) {
                this.outlinePath_ += this.constants_.OUTSIDE_CORNERS.topLeft;
            } else if (
                Blockly.blockRendering.Types.isRightRoundedCorner(elem)
            ) {
                this.outlinePath_ += this.constants_.OUTSIDE_CORNERS.topRight;
            } else if (
                Blockly.blockRendering.Types.isPreviousConnection(elem)
            ) {
                this.outlinePath_ += (
                    elem.shape as Blockly.blockRendering.Notch
                ).pathLeft;
            } else if (Blockly.blockRendering.Types.isHat(elem)) {
                this.outlinePath_ += this.constants_.START_HAT.path;
            } else if (Blockly.blockRendering.Types.isSpacer(elem)) {
                this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis(
                    "h",
                    elem.width,
                );
            }
        }
        // No branch for a square corner, because it's a no-op.
        this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis(
            "v",
            topRow.height,
        );

        // CHANGE: add cat stuff to top of block
        if (
            this.constants_.isCat() &&
            !this.block_.outputConnection &&
            !this.block_.previousConnection
        ) {
            this.block_.pathObject.ensureCatElements();
        }
    }
}
