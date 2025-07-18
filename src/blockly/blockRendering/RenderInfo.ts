import * as Blockly from "blockly";
import { isDefineBlock } from "../procedures/blockDefine";
import { BigRoundCorner } from "./BigRoundCorner";
import { ConstantProvider } from "./ConstantProvider";

/**
 * Custom render info that tracks whether this is a define block
 * top class impl: https://github.com/google/blockly/blob/908712e19d2d028df9352f55be9046a47eeae303/core/renderers/common/info.ts#L229
 * superclass impl: https://github.com/google/blockly/blob/908712e19d2d028df9352f55be9046a47eeae303/core/renderers/zelos/info.ts
 */
export class RenderInfo extends Blockly.zelos.RenderInfo {
    static assertInstance(
        info: Blockly.blockRendering.RenderInfo,
    ): asserts info is RenderInfo {
        if (!(info instanceof RenderInfo)) {
            throw Error("info should be behaviors info");
        }
    }

    #isDefineBlock() {
        return isDefineBlock(this.block_);
    }

    /**
     * Override top row to put big round corners on the top of define blocks
     */
    protected override populateTopRow_(): void {
        // CHANGE: check constants class
        ConstantProvider.assertInstance(this.constants_);

        const hasPrevious = !!this.block_.previousConnection;
        const hasHat =
            (this.block_.hat
                ? this.block_.hat === "cap"
                : this.constants_.ADD_START_HATS) &&
            !this.outputConnection &&
            !hasPrevious;

        let cornerClass = this.#isDefineBlock()
            ? BigRoundCorner // CHANGE: add BigRoundCorner for defines
            : this.topRow.hasLeftSquareCorner(this.block_)
            ? Blockly.blockRendering.SquareCorner
            : Blockly.blockRendering.RoundCorner;
        this.topRow.elements.push(new cornerClass(this.constants_));

        // CHANGE: no hats for defines
        if (!this.#isDefineBlock() && hasHat) {
            const hat = new Blockly.blockRendering.Hat(this.constants_);
            this.topRow.elements.push(hat);
        } else if (hasPrevious) {
            this.topRow.hasPreviousConnection = true;
            this.topRow.connection =
                new Blockly.blockRendering.PreviousConnection(
                    this.constants_,
                    this.block_.previousConnection,
                );
            this.topRow.elements.push(this.topRow.connection);
        }

        const precedesStatement =
            this.block_.inputList.length &&
            this.block_.inputList[0] instanceof Blockly.inputs.StatementInput;

        // This is the minimum height for the row. If one of its elements has a
        // greater height it will be overwritten in the compute pass.
        if (precedesStatement && !this.block_.isCollapsed()) {
            this.topRow.minHeight =
                this.constants_.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT;
        } else {
            this.topRow.minHeight = this.constants_.TOP_ROW_MIN_HEIGHT;
        }

        cornerClass = this.#isDefineBlock()
            ? BigRoundCorner // CHANGE: add BigRoundCorner for defines
            : this.topRow.hasRightSquareCorner(this.block_)
            ? Blockly.blockRendering.SquareCorner
            : Blockly.blockRendering.RoundCorner;
        this.topRow.elements.push(new cornerClass(this.constants_, "right"));
    }

    /**
     * Override inputs for define blocks.
     */
    override addInput_(
        input: Blockly.Input,
        activeRow: Blockly.blockRendering.Row,
    ): void {
        if (
            this.#isDefineBlock() &&
            input instanceof Blockly.inputs.StatementInput
        ) {
            // Define blocks render their prototype statement input inline
            activeRow.elements.push(
                new Blockly.blockRendering.InlineInput(this.constants_, input),
            );
            activeRow.hasInlineInput = true;
        } else {
            super.addInput_(input, activeRow);
        }
    }

    /**
     * Remove spacer rows from define blocks since the prototype field gives the block enough height.
     */
    override getSpacerRowHeight_(
        prev: Blockly.blockRendering.Row,
        next: Blockly.blockRendering.Row,
    ): number {
        if (this.#isDefineBlock()) {
            return this.constants_.NO_PADDING;
        } else {
            return super.getSpacerRowHeight_(prev, next);
        }
    }
}
