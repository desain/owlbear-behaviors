import * as Blockly from "blockly";
import { MUTATOR_MATCH } from "../constants";
import {
    BLOCK_MATCH,
    BLOCK_MATCH_CASE,
    BLOCK_MATCH_MATCH,
    BLOCK_MATCH_RANGE,
} from "./blocks";
interface ExactCaseState {
    exact: string;
}
interface RangeCaseState {
    lo: string;
    hi: string;
}
type MatchCaseState = ExactCaseState | RangeCaseState;

export interface MatchBlockExtraState {
    readonly default: boolean;
    readonly cases: MatchCaseState[];
}

export interface MatchBlock extends Blockly.Block {
    matchState: MatchBlockExtraState;
}

interface MatchMatchBlock extends Blockly.BlockSvg {
    /**
     * Previous connection of topmost input block of 'default' input.
     */
    matchDefaultConnection?: Blockly.Connection;
}

type MatchCaseOrRangeBlock = Blockly.BlockSvg & {
    /**
     * Previous connection of topmost of corresponding case input.
     */
    matchCaseConnection?: Blockly.Connection;
};

const INPUT_MATCH_DEFAULTNAME = BLOCK_MATCH.args3[0].name;
const INPUT_MATCH_DEFAULT = BLOCK_MATCH.args4[0].name;

/**
 * @returns Name for dummy input that labels the i'th case.
 */
function caseLabelInputName(i: number) {
    return `CASELABEL_${i}`;
}

/**
 * @returns Text for dummy input that labels the case.
 */
function caseLabelText(state: MatchCaseState) {
    if ("exact" in state) {
        return `is ${state.exact}`;
    } else {
        return `is between ${state.lo} and ${state.hi}`;
    }
}

/**
 * @returns Name of case statement input for i'th case.
 */
export function caseStatementInputName(i: number) {
    return `CASE_${i}`;
}

function getCaseInputs(
    match: Blockly.Block,
): { caseLabelInput: Blockly.Input; caseInput: Blockly.Input }[] {
    const inputs: {
        caseLabelInput: Blockly.Input;
        caseInput: Blockly.Input;
    }[] = [];
    for (
        let i = 0,
            caseLabelInput: Blockly.Input | null,
            caseInput: Blockly.Input | null;
        (caseInput = match.getInput(caseStatementInputName(i))),
            (caseLabelInput = match.getInput(caseLabelInputName(i))),
            caseInput && caseLabelInput;
        i++
    ) {
        if (!caseInput || !caseLabelInput) {
            throw Error("should be impossible due to check in for loop");
        }
        inputs.push({ caseLabelInput, caseInput });
    }
    return inputs;
}

function mutatorTopBlockToState(match: MatchMatchBlock): {
    state: MatchBlockExtraState;
    matchCaseConnections: (Blockly.Connection | undefined)[];
    defaultConnection?: Blockly.Connection;
} {
    const state: MatchBlockExtraState = {
        cases: [],
        default:
            match.getFieldValue(BLOCK_MATCH_MATCH.args2[0].name) === "TRUE",
    };
    const matchCaseConnections: (Blockly.Connection | undefined)[] = [];

    for (
        let caseBlock: Blockly.Block | null | undefined =
            match.getInputTargetBlock(BLOCK_MATCH_MATCH.args1[0].name);
        caseBlock && !caseBlock.isInsertionMarker();
        caseBlock = caseBlock?.getNextBlock()
    ) {
        if (caseBlock.type === BLOCK_MATCH_CASE.type) {
            state.cases.push({
                exact: String(
                    caseBlock.getFieldValue(BLOCK_MATCH_CASE.args0[0].name),
                ),
            });
        } else if (caseBlock.type === BLOCK_MATCH_RANGE.type) {
            state.cases.push({
                lo: String(
                    caseBlock.getFieldValue(BLOCK_MATCH_RANGE.args0[0].name),
                ),
                hi: String(
                    caseBlock.getFieldValue(BLOCK_MATCH_RANGE.args0[1].name),
                ),
            });
        } else {
            throw Error("invalid case block");
        }
        matchCaseConnections.push(
            (caseBlock as MatchCaseOrRangeBlock).matchCaseConnection,
        );
    }
    return {
        state,
        matchCaseConnections,
        defaultConnection: match.matchDefaultConnection,
    };
}

function setupMatchBlockFromState(
    match: MatchBlock,
    state: MatchBlockExtraState,
    matchCaseConnections?: (Blockly.Connection | undefined)[],
    defaultConnection?: Blockly.Connection,
) {
    // save state
    match.matchState = state;

    // remove existing case inputs
    getCaseInputs(match).forEach(({ caseInput, caseLabelInput }) => {
        match.removeInput(caseInput.name);
        match.removeInput(caseLabelInput.name);
    });

    // append new case inputs
    state.cases.forEach((caseState, i) => {
        match
            .appendDummyInput(caseLabelInputName(i))
            .appendField(caseLabelText(caseState));
        const statementInput = match.appendStatementInput(
            caseStatementInputName(i),
        );
        const connection = matchCaseConnections?.[i];
        if (connection) {
            statementInput.connection?.connect(connection);
        }
    });

    // remove existing default input
    match.removeInput(INPUT_MATCH_DEFAULTNAME, true);
    match.removeInput(INPUT_MATCH_DEFAULT, true);

    // append new default input
    if (state.default) {
        match.appendDummyInput(INPUT_MATCH_DEFAULTNAME).appendField("default");
        const statementInput = match.appendStatementInput(INPUT_MATCH_DEFAULT);
        if (defaultConnection) {
            statementInput.connection?.connect(defaultConnection);
        }
    }
}

export function registerMutatorMatch() {
    Blockly.Extensions.registerMutator(
        MUTATOR_MATCH,
        {
            saveExtraState: function (this: MatchBlock): MatchBlockExtraState {
                return this.matchState;
            },

            loadExtraState: function (
                this: MatchBlock,
                extraState: MatchBlockExtraState,
            ) {
                setupMatchBlockFromState(this, extraState);
            },

            /**
             * Turn this block into a set of blocks in the mutator workspace
             * @param workspace mutator workspace
             * @returns top level mutator match block
             */
            decompose: function (
                this: MatchBlock,
                workspace: Blockly.WorkspaceSvg,
            ): Blockly.Block {
                const match = workspace.newBlock(BLOCK_MATCH_MATCH.type);
                match.initSvg();
                match.render();

                let caseConnection = match.getInput(
                    BLOCK_MATCH_MATCH.args1[0].name,
                )?.connection;

                for (const caseData of this.matchState.cases) {
                    let caseBlock: Blockly.BlockSvg;
                    if ("exact" in caseData) {
                        caseBlock = workspace.newBlock(BLOCK_MATCH_CASE.type);
                        caseBlock.setFieldValue(
                            caseData.exact,
                            BLOCK_MATCH_CASE.args0[0].name,
                        );
                    } else {
                        caseBlock = workspace.newBlock(BLOCK_MATCH_RANGE.type);
                        caseBlock.setFieldValue(
                            caseData.lo,
                            BLOCK_MATCH_RANGE.args0[0].name,
                        );
                        caseBlock.setFieldValue(
                            caseData.hi,
                            BLOCK_MATCH_RANGE.args0[1].name,
                        );
                    }

                    if (!caseConnection || !caseBlock.previousConnection) {
                        throw Error("[match decompose] missing connections");
                    }

                    caseConnection.connect(caseBlock.previousConnection);
                    caseConnection = caseBlock.nextConnection;
                    caseBlock.initSvg();
                    caseBlock.render();
                }

                match.setFieldValue(
                    String(this.matchState.default).toUpperCase(),
                    BLOCK_MATCH_MATCH.args2[0].name,
                );

                return match;
            },

            saveConnections: function (
                this: Blockly.BlockSvg,
                topBlock: MatchMatchBlock,
            ) {
                topBlock.matchDefaultConnection =
                    this.getInputTargetBlock(INPUT_MATCH_DEFAULT)
                        ?.previousConnection ?? undefined;

                for (
                    let caseBlock: Blockly.Block | null | undefined =
                            topBlock.getInputTargetBlock(
                                BLOCK_MATCH_MATCH.args1[0].name,
                            ),
                        i = 0;
                    caseBlock && !caseBlock.isInsertionMarker();
                    caseBlock = caseBlock?.getNextBlock(), i++
                ) {
                    (caseBlock as MatchCaseOrRangeBlock).matchCaseConnection =
                        this.getInputTargetBlock(caseStatementInputName(i))
                            ?.previousConnection ?? undefined;
                }
            },

            /**
             * Modify this block based on what happened in the mutator workspace
             * @param topBlock top block in mutator workspace
             * @returns
             */
            compose: function (this: MatchBlock, topBlock: MatchMatchBlock) {
                const { state, matchCaseConnections, defaultConnection } =
                    mutatorTopBlockToState(topBlock);

                setupMatchBlockFromState(
                    this,
                    state,
                    matchCaseConnections,
                    defaultConnection,
                );
            },
        },
        function (this: MatchBlock) {
            if (!this.matchState) {
                this.matchState = { cases: [], default: false };
            }
        },
        [BLOCK_MATCH_CASE.type, BLOCK_MATCH_RANGE.type],
    );
}
