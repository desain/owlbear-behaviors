import * as Blockly from "blockly";
import { MIXIN_USES_VOLUME } from "../constants";

export function registerMixinUsesVolume() {
    Blockly.Extensions.registerMixin(MIXIN_USES_VOLUME, {
        getDeveloperVariables: function (this: Blockly.Block): string[] {
            void this;
            return ["volume"];
        },
    } satisfies Pick<Blockly.Block, "getDeveloperVariables">);
}
