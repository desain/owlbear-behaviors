import * as Blockly from "blockly";
import { EXTENSION_SENSING_OF } from "../constants";
import { BLOCK_SENSING_OF } from "./blocks";

const NUMBER_PROPS: string[] = [
    BLOCK_SENSING_OF.args0[0].options[0][1],
    BLOCK_SENSING_OF.args0[0].options[1][1],
    BLOCK_SENSING_OF.args0[0].options[2][1],
];

export function registerSensingOfExtension() {
    Blockly.Extensions.register(
        EXTENSION_SENSING_OF,
        function (this: Blockly.Block) {
            this.getField(BLOCK_SENSING_OF.args0[0].name)?.setValidator((v) => {
                const outputsNumber = NUMBER_PROPS.includes(v as string);
                if (outputsNumber) {
                    this.outputConnection?.setCheck("Number");
                } else {
                    this.outputConnection?.setCheck("String");
                }
                return undefined; // allow setting
            });
        },
    );
}
