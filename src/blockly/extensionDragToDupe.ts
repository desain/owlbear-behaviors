import * as Blockly from "blockly";
import { MIXIN_DRAG_TO_DUPE } from "../constants";
import { BLOCK_OTHER, BLOCK_OTHER_SRC, type CustomBlockType } from "./blocks";
import type { HasDragDuplicate } from "./Dragger";

/**
 * legacy way of doing drag to dupe. Must support because there are still
 * workspaces out there with BLOCK_OTHER_SRC in the serialization
 */
const CREATE_OTHER_BLOCK: Partial<Record<string, CustomBlockType>> = {
    [BLOCK_OTHER_SRC.type]: BLOCK_OTHER.type,
};

export function registerMixinDragToDupe() {
    Blockly.Extensions.registerMixin(MIXIN_DRAG_TO_DUPE, {
        getDragDuplicate: function (this: Blockly.BlockSvg) {
            const mappedBlock = CREATE_OTHER_BLOCK[this.type];

            // no duplicate for solid blocks that don't have mapped blocks
            if (!this.isShadow() && !mappedBlock) {
                return undefined;
            }

            const state = mappedBlock
                ? { type: mappedBlock }
                : Blockly.serialization.blocks.save(this);
            if (!state) {
                throw Error("failed to serialize");
            }

            const copy = Blockly.serialization.blocks.append(
                state,
                this.workspace,
            );

            if (!(copy instanceof Blockly.BlockSvg)) {
                throw Error("copy is not block");
            }

            const coord = this.getRelativeToSurfaceXY();
            copy.moveBy(coord.x, coord.y, ["move clone to current pos"]);
            copy.initSvg();
            copy.render();

            return copy;
        },
    } satisfies HasDragDuplicate);
}
