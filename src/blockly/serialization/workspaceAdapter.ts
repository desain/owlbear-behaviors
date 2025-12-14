import * as Blockly from "blockly";
import { isObject } from "owlbear-utils";

// Base properties common to both Blockly and Behaviors blocks
interface BaseBlockData {
    id: string;
    // Allow any other properties that Blockly might serialize
    [key: string]: unknown;
}

// Blockly types

interface HasShadow {
    shadow: object;
}

interface HasBlock {
    block: BlocklyBlock;
}

type HasShadowAndOrBlock = HasShadow | HasBlock | (HasShadow & HasBlock);

interface BlocklyBlock extends BaseBlockData {
    next?: HasShadowAndOrBlock;
    inputs?: Record<string, HasShadowAndOrBlock>;
}

export interface BlocklySerializedWorkspace {
    blocks: {
        languageVersion: number;
        blocks: BlocklyBlock[];
    };
    // Allow other properties like 'variables'
    [key: string]: unknown;
}

// Behaviors types

/**
 * Block that could live as the 'next' block of another block, or a
 * block that lives in the input of another block.
 */
interface BehaviorsBlock extends BaseBlockData {
    /**
     * If this field is undefined, this is a top level block.
     * If this field is a string, then that string is the ID of the {@link BlocklyBlock}
     * that should own this block as its 'next' field.
     * If this field is an array of ID and input, then this block should be moved to the
     * `inputs[input].block` field of the {@link BlocklyBlock} with ID `ID`.
     * Short name to save on JSON space.
     */
    p?: BlocklyBlock["id"] | [parent: BlocklyBlock["id"], input: string];

    // In the flattened Behaviors format, next and inputs should only contain shadows,
    // as actual blocks are moved to the top-level 'blocks' array.

    next?: HasShadow;
    inputs?: Record<string, HasShadow>;
}

/**
 * Blocks in behaviors workspaces don't have a block in the next field,
 * or in inputs. A {@link BlocklyBlock} without blocks in those fields
 * is also a {@link BehaviorsBlock}.
 */
// function isBehaviorsBlock(
//     b: BlocklyBlock | BehaviorsBlock,
// ): b is BehaviorsBlock {
//     return (
//         (b.p === undefined ||
//             typeof b.p === "string" ||
//             (Array.isArray(b.p) && b.p.length === 2 && b.p.every(isString))) &&
//         (!b.next || !("block" in b.next)) &&
//         (!b.inputs || Object.values(b.inputs).every((v) => !("block" in v)))
//     );
// }

/**
 * Workspace serialized using Behaviors blocks format. Incompatible with Blockly
 * format without conversion.
 */
interface BehaviorsSerializedWorkspace {
    blocks: {
        languageVersion: number;
        blocks: BehaviorsBlock[];
    };
    // Allow other properties like 'variables'
    [key: string]: unknown;
}

export type SerializedWorkspace =
    | BehaviorsSerializedWorkspace
    | BlocklySerializedWorkspace;

export function isSerializedWorkspace(w: unknown): w is SerializedWorkspace {
    return (
        isObject(w) &&
        "blocks" in w &&
        isObject(w.blocks) &&
        "languageVersion" in w.blocks &&
        typeof w.blocks.languageVersion === "number" &&
        "blocks" in w.blocks &&
        Array.isArray(w.blocks.blocks) &&
        w.blocks.blocks.every((b) => isObject(b))
    );
}

// Conversion

function blocklySerializedToBehaviorsWorkspace(
    raw: BlocklySerializedWorkspace,
): BehaviorsSerializedWorkspace {
    const { blocks, ...otherProps } = raw;

    const flatBlocks: BehaviorsBlock[] = [];

    const processBlock = (block: BlocklyBlock, p: BehaviorsBlock["p"]) => {
        // Extract next and inputs to handle them separately
        const { next, inputs, ...rest } = block;

        const newBlock: BehaviorsBlock = {
            ...rest,
            p,
        };

        // Handle next: Extract block, keep shadow
        if (next) {
            if ("block" in next) {
                processBlock(next.block, block.id);
            }
            // If there's a shadow, preserve it in the new (flattened) block's next
            if ("shadow" in next) {
                newBlock.next = { shadow: next.shadow };
            }
        }

        // Handle inputs: Keep shadows, extract blocks
        if (inputs) {
            const newInputs: Record<string, HasShadow> = {};
            let hasNewInputs = false;

            for (const [key, value] of Object.entries(inputs)) {
                if ("block" in value) {
                    processBlock(value.block, [block.id, key]);
                }

                // If there's a shadow, preserve it in the new (flattened) block's inputs
                if ("shadow" in value && value.shadow) {
                    newInputs[key] = { shadow: value.shadow };
                    hasNewInputs = true;
                }
            }

            if (hasNewInputs) {
                newBlock.inputs = newInputs;
            }
        }

        flatBlocks.push(newBlock);
    };

    // Handle top level blocks
    for (const block of blocks.blocks) {
        // Pass `undefined` as p property since these are top level blocks
        processBlock(block, undefined);
    }

    return { ...otherProps, blocks: { ...blocks, blocks: flatBlocks } };
}

/**
 * @throws Error if:
 *         - A block has an invalid parent
 */
function behaviorsToBlocklySerializedWorkspace(
    workspace: BehaviorsSerializedWorkspace,
): BlocklySerializedWorkspace {
    const { blocks, ...otherProps } = workspace;

    // Clone blocks to avoid mutating input and to allow adding next/inputs properties
    const behaviorsBlocks: BehaviorsBlock[] = blocks.blocks.map((b) => ({
        ...b,
    }));
    const blockMap = new Map<BlocklyBlock["id"], BlocklyBlock>();
    const topLevelBlocks: BlocklyBlock[] = [];

    // 1. Register all blocks in the map, converting them to BlocklyBlock structure (without 'p')
    for (const block of behaviorsBlocks) {
        const { p, ...rest } = block;
        void p;
        const blocklyBlock: BlocklyBlock = { ...rest };
        blockMap.set(blocklyBlock.id, blocklyBlock);
    }

    // 2. Link blocks to reconstruct the nested structure
    for (const block of behaviorsBlocks) {
        // 'block' here is still BehaviorsBlock (with 'p')
        const currentBlock = blockMap.get(block.id)!; // This block is now a BlocklyBlock

        if (block.p === undefined) {
            topLevelBlocks.push(currentBlock);
            continue;
        }

        if (Array.isArray(block.p)) {
            const [parentId, inputName] = block.p;
            const parent = blockMap.get(parentId);
            if (!parent) {
                throw Error(
                    `Cannot find parent block ${parentId} of block ${block.id}`,
                );
            }
            parent.inputs = parent.inputs ?? {};
            // If there's an existing shadow, merge with it, otherwise just set the block
            parent.inputs[inputName] = {
                ...parent.inputs[inputName],
                block: currentBlock,
            };
        } else {
            const parentId = block.p;
            const parent = blockMap.get(parentId);
            if (!parent) {
                throw Error(
                    `Cannot find parent block ${parentId} of block ${block.id}`,
                );
            }
            // If there's an existing shadow, merge with it, otherwise just set the block
            parent.next = { ...parent.next, block: currentBlock };
        }
    }

    return {
        ...otherProps,
        blocks: { ...blocks, blocks: topLevelBlocks },
    };
}

export function blocklyToBehaviorsWorkspace(
    workspace: Blockly.Workspace,
): BehaviorsSerializedWorkspace {
    const raw = Blockly.serialization.workspaces.save(
        workspace,
    ) as BlocklySerializedWorkspace;

    return blocklySerializedToBehaviorsWorkspace(raw);
}

export function loadBehaviorsWorkspace(
    workspace: SerializedWorkspace,
    into: Blockly.Workspace,
) {
    // If any block has a parent marker, we need to process the blocks
    const serialized: BlocklySerializedWorkspace = workspace.blocks.blocks.some(
        (b) => "p" in b && b.p,
    )
        ? behaviorsToBlocklySerializedWorkspace(
              workspace as BehaviorsSerializedWorkspace,
          )
        : workspace;
    Blockly.serialization.workspaces.load(
        serialized satisfies BlocklySerializedWorkspace,
        into,
    );
}
