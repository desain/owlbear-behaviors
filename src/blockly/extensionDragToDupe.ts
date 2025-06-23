import * as Blockly from "blockly";
import { EXTENSION_DRAG_TO_DUPE } from "../constants";
import { BLOCK_OTHER_SRC, BLOCK_OTHER_VAL } from "./blocks";

/**
 * Drag strategy that duplicates the block on drag.
 * Adapted from:
 * https://github.com/google/blockly-samples/blob/4259cd384a3255d0e9d8b3755edaa3cc8b067c1d/plugins/block-test/src/drag.js#L25
 */
class DragToDupe implements Blockly.IDragStrategy {
    readonly #block: Blockly.BlockSvg;
    readonly #cloneType: string;
    #baseStrat?: Blockly.dragging.BlockDragStrategy;
    #copy?: Blockly.BlockSvg;

    constructor(block: Blockly.BlockSvg, cloneType: string) {
        this.#block = block;
        this.#cloneType = cloneType;
    }

    // eslint-disable-next-line class-methods-use-this
    isMovable = () => true;

    startDrag(e?: PointerEvent) {
        const copy = this.#block.workspace.newBlock(this.#cloneType);
        if (!(copy instanceof Blockly.BlockSvg)) {
            throw Error("copy is not block");
        }
        copy.initSvg();
        copy.render();
        this.#copy = copy;
        this.#baseStrat = new Blockly.dragging.BlockDragStrategy(this.#copy);
        this.#baseStrat.startDrag(e);
    }

    drag(newLoc: Blockly.utils.Coordinate) {
        this.#baseStrat?.drag(newLoc);
    }

    endDrag(e?: PointerEvent) {
        this.#baseStrat?.endDrag(e);
    }

    revertDrag() {
        this.#copy?.dispose();
    }
}

export function installExtensionDragToDupe() {
    Blockly.Extensions.register(
        EXTENSION_DRAG_TO_DUPE,
        function (this: Blockly.Block) {
            if (
                this instanceof Blockly.BlockSvg &&
                this.type === BLOCK_OTHER_SRC.type
            ) {
                this.setDeletable(false);
                this.setDragStrategy(
                    new DragToDupe(this, BLOCK_OTHER_VAL.type),
                );
            }
        },
    );
}
