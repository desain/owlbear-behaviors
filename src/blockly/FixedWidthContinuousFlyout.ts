import { ContinuousFlyout } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";

export class FixedWidthContinuousFlyout extends ContinuousFlyout {
    /**
     * Adapted from:
     * https://github.com/google/blockly/blob/develop/core/flyout_vertical.ts#L300
     */
    protected override reflowInternal_() {
        this.workspace_.scale = this.getFlyoutScale();
        let flyoutWidth = 330; // CHANGE: static width
        flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
        flyoutWidth *= this.workspace_.scale;

        flyoutWidth += Blockly.Scrollbar.scrollbarThickness;

        if (this.getWidth() !== flyoutWidth) {
            if (this.RTL) {
                // With the flyoutWidth known, right-align the flyout contents.
                for (const item of this.getContents()) {
                    const oldX = item.getElement().getBoundingRectangle().left;
                    const newX =
                        flyoutWidth / this.workspace_.scale -
                        item.getElement().getBoundingRectangle().getWidth() -
                        this.MARGIN -
                        this.tabWidth_;
                    item.getElement().moveBy(newX - oldX, 0);
                }
            }

            // CHANGE: remove no-scrollbar case

            this.width_ = flyoutWidth;
            this.position();
            this.targetWorkspace.resizeContents();
            this.targetWorkspace.recordDragTargets();
        }
    }
}
