import * as Blockly from "blockly";
import { EXTENSION_STOP } from "../constants";
import { BLOCK_STOP } from "./blocks";

export function registerStopExtension() {
    Blockly.Extensions.register(EXTENSION_STOP, function (this: Blockly.Block) {
        this.getField(BLOCK_STOP.args0[0].name)?.setValidator((v) => {
            const canHaveNextStatement =
                v === BLOCK_STOP.args0[0].options[2][1];
            if (!canHaveNextStatement) {
                this.nextConnection?.disconnect();
            }
            this.setNextStatement(canHaveNextStatement);
            return undefined; // allow setting
        });
    });
}
