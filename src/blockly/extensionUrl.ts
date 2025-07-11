import * as Blockly from "blockly";
import { EXTENSION_URL } from "../constants";
export function installExtensionLimitIdLength() {
    Blockly.Extensions.register(EXTENSION_URL, function (this: Blockly.Block) {
        for (const field of this.getFields()) {
            field.maxDisplayLength = 10;
            field.setValidator((url) => {
                try {
                    new URL(String(url));
                    return undefined; // allow setting
                } catch {
                    return null; // deny change
                }
            });
        }
    });
}
