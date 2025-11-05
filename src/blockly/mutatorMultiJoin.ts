import * as Blockly from "blockly";
import { MUTATOR_MULTI_JOIN } from "../constants";
import {
    BLOCK_DYNAMIC_VAL,
    BLOCK_MULTI_JOIN_CONTAINER,
    BLOCK_MULTI_JOIN_ITEM,
} from "./blocks";

export interface MultiJoinBlockExtraState {
    itemCount: number;
}

export interface MultiJoinBlock extends Blockly.Block {
    itemCount: number;
}

interface MultiJoinItemBlock extends Blockly.BlockSvg {
    /**
     * If set, either a string representing the shadow block
     * content, or a connection from a target block.
     */
    itemConnection?: Blockly.Connection | string;
}

export function multiJoinInputName(i: number) {
    return `S${i}`;
}

const mutator = {
    saveExtraState: function (this: MultiJoinBlock): MultiJoinBlockExtraState {
        return {
            itemCount: this.itemCount,
        };
    },

    loadExtraState: function (
        this: MultiJoinBlock,
        extraState: MultiJoinBlockExtraState,
    ) {
        this.itemCount = extraState.itemCount;
        updateShape(this);
    },

    /**
     * Turn this block into a set of blocks in the mutator workspace
     * @param workspace mutator workspace
     * @returns top level mutator match block
     */
    decompose: function (
        this: MultiJoinBlock,
        workspace: Blockly.WorkspaceSvg,
    ): Blockly.Block {
        const containerBlock = workspace.newBlock(
            BLOCK_MULTI_JOIN_CONTAINER.type,
        );
        containerBlock.initSvg();

        let connection = containerBlock.getInput(
            BLOCK_MULTI_JOIN_CONTAINER.args1[0].name,
        )?.connection;
        for (let i = 0; i < this.itemCount; i++) {
            const itemBlock = workspace.newBlock(BLOCK_MULTI_JOIN_ITEM.type);
            itemBlock.initSvg();
            connection?.connect(
                itemBlock.previousConnection as Blockly.Connection,
            );
            connection = itemBlock.nextConnection;
        }

        return containerBlock;
    },

    /**
     * Called after decomposing source block into mutator block workspace.
     * Saves connections on the source block to the mutator blocks, so when
     * mutator blocks are moved around, the blocks that are connected to
     * the source block move with them.
     * @param this source block.
     * @param containerBlock top level block in mutator workspace.
     */
    saveConnections: function (
        this: MultiJoinBlock,
        containerBlock: Blockly.Block,
    ) {
        for (
            let itemBlock = containerBlock.getInputTargetBlock(
                    BLOCK_MULTI_JOIN_CONTAINER.args1[0].name,
                ),
                i = 0;
            itemBlock && !itemBlock.isInsertionMarker();
            itemBlock = itemBlock.nextConnection?.targetBlock() ?? null, i++
        ) {
            const targetBlock = this.getInputTargetBlock(multiJoinInputName(i));
            (itemBlock as MultiJoinItemBlock).itemConnection =
                targetBlock?.isShadow()
                    ? (targetBlock.getFieldValue(
                          BLOCK_DYNAMIC_VAL.args0[0].name,
                      ) as string)
                    : targetBlock?.outputConnection ?? undefined;
        }
    },

    /**
     * Modify this block based on what happened in the mutator workspace
     * @param topBlock top block in mutator workspace
     * @returns
     */
    compose: function (this: MultiJoinBlock, containerBlock: Blockly.Block) {
        const connections: (Blockly.Connection | string | undefined)[] = [];
        let itemBlock = containerBlock.getInputTargetBlock(
            BLOCK_MULTI_JOIN_CONTAINER.args1[0].name,
        );
        let count = 0;
        while (itemBlock) {
            connections.push((itemBlock as MultiJoinItemBlock).itemConnection);
            count++;
            itemBlock = itemBlock.nextConnection?.targetBlock() ?? null;
        }
        this.itemCount = count;
        updateShape(this, connections);
    },
};

function updateShape(
    block: MultiJoinBlock,
    connections: (Blockly.Connection | string | undefined)[] = [],
) {
    // Remove inputs.
    for (let i = 0; block.getInput(multiJoinInputName(i)); i++) {
        block.removeInput(multiJoinInputName(i));
    }

    // Add new inputs.
    for (let i = 0; i < block.itemCount; i++) {
        const input = block
            .appendValueInput(multiJoinInputName(i))
            .setCheck(["String", "Number"]);

        const connection = connections[i];
        input.connection?.setShadowState({
            type: BLOCK_DYNAMIC_VAL.type,
            fields: {
                [BLOCK_DYNAMIC_VAL.args0[0].name]:
                    typeof connection === "string" ? connection : "",
            },
        });

        if (connection instanceof Blockly.Connection) {
            input.connection?.connect(connection);
        }
    }
}

export function registerMutatorMultiJoin() {
    Blockly.Extensions.registerMutator(
        MUTATOR_MULTI_JOIN,
        mutator,
        function (this: MultiJoinBlock) {
            this.itemCount = 0;
        },
        [BLOCK_MULTI_JOIN_ITEM.type],
    );
}
