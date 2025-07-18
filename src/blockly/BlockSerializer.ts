import * as Blockly from "blockly";
import { isDefineBlock } from "./procedures/blockDefine";

export class BehaviorBlockSerializer extends Blockly.serialization.blocks
    .BlockSerializer {
    static register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.SERIALIZER,
            "blocks",
            new BehaviorBlockSerializer(),
            true,
        );
    };

    // eslint-disable-next-line class-methods-use-this
    override save = (
        workspace: Blockly.Workspace,
    ): {
        languageVersion: number;
        blocks: Blockly.serialization.blocks.State[];
    } | null => {
        const blockStates = [];
        for (const block of workspace.getTopBlocks(false)) {
            const state = Blockly.serialization.blocks.save(block, {
                addCoordinates: true,
                doFullSerialization: false,
                addInputBlocks: !isDefineBlock(block), // CHANGE: don't serialize input blocks for defines
            });
            if (state) {
                blockStates.push(state);
            }
        }
        if (blockStates.length) {
            return {
                languageVersion: 0, // Currently unused.
                blocks: blockStates,
            };
        }
        return null;
    };
}
