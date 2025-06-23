import * as Blockly from "blockly";
import { EXTENSION_MOVE_GRID } from "../constants";
import { BLOCK_MOVE_DIRECTION } from "./blocks";

export function installMoveGridExtension() {
    Blockly.Extensions.register(
        EXTENSION_MOVE_GRID,
        function (this: Blockly.Block) {
            const directionField = this.getField(
                BLOCK_MOVE_DIRECTION.args0[0].name,
            );
            directionField?.setValidator((newValue: string) =>
                newValue === "NOWHERE" ? null : newValue,
            );
        },
    );
}
