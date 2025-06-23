import * as Blockly from "blockly";
import { BLOCK_TOUCH } from "./blocks";

// Prevent touch blocks from overwriting their inputs
const DENY_CONNECTIONS = [
    [BLOCK_TOUCH.type, BLOCK_TOUCH.args0[1].name],
] as const;

export class BehaviorConnectionChecker extends Blockly.ConnectionChecker {
    override doDragChecks(
        a: Blockly.RenderedConnection,
        b: Blockly.RenderedConnection,
        distance: number,
    ): boolean {
        for (const [blockType, inputName] of DENY_CONNECTIONS) {
            if (
                b.getSourceBlock().type === blockType &&
                b.getParentInput()?.name === inputName
            ) {
                return false;
            }
        }

        return super.doDragChecks(a, b, distance);
    }
}
