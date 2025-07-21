import * as Blockly from "blockly";
import { MUTATOR_MATCH } from "../constants";
import { BLOCK_MATCH, BLOCK_MATCH_CASE, BLOCK_MATCH_MATCH } from "./blocks";

interface MatchBlockExtraState {
    readonly default: boolean;
    readonly cases: string[];
}

type MatchMatchBlock = Blockly.BlockSvg & {
    /**
     * Previous connection of topmost input block of 'default' input.
     */
    matchDefaultConnection?: Blockly.Connection;
};

type MatchCaseBlock = Blockly.BlockSvg & {
    /**
     * Previous connection of topmost of corresponding case input.
     */
    matchCaseConnection?: Blockly.Connection;
};

const INPUT_MATCH_DEFAULTNAME = BLOCK_MATCH.args3[0].name;
const INPUT_MATCH_DEFAULT = BLOCK_MATCH.args4[0].name;

function hasDefault(match: Blockly.Block): boolean {
    return !!match.getInput(INPUT_MATCH_DEFAULT);
}

function caseLabel(i: number) {
    return `CASELABEL_${i}`;
}

function caseI(i: number) {
    return `CASE_${i}`;
}

export function getCaseInputs(
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
        (caseInput = match.getInput(caseI(i))),
            (caseLabelInput = match.getInput(caseLabel(i))),
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

export function getCaseName(caseLabelInput: Blockly.Input): string {
    return String(caseLabelInput.fieldRow[0]?.getValue() ?? "");
}

function getCases(match: Blockly.Block): string[] {
    return getCaseInputs(match).map(({ caseLabelInput }) =>
        getCaseName(caseLabelInput),
    );
}

function getMutatorCases(
    match: MatchMatchBlock,
): { name: string; connection?: Blockly.Connection }[] {
    const cases: { name: string; connection?: Blockly.Connection }[] = [];
    for (
        let caseBlock: Blockly.Block | null | undefined =
            match.getInputTargetBlock(BLOCK_MATCH_MATCH.args1[0].name);
        caseBlock && !caseBlock.isInsertionMarker();
        caseBlock = caseBlock?.getNextBlock()
    ) {
        cases.push({
            name: String(
                caseBlock.getFieldValue(BLOCK_MATCH_CASE.args0[0].name),
            ),
            connection: (caseBlock as MatchCaseBlock).matchCaseConnection,
        });
    }
    return cases;
}

export function registerMutatorMatch() {
    Blockly.Extensions.registerMutator(
        MUTATOR_MATCH,
        {
            saveExtraState: function (
                this: Blockly.Block,
            ): MatchBlockExtraState {
                return {
                    default: hasDefault(this),
                    cases: getCases(this),
                };
            },

            loadExtraState: function (
                this: Blockly.Block,
                extraState: MatchBlockExtraState,
            ) {
                // remove existing case inputs
                getCaseInputs(this).forEach(({ caseInput, caseLabelInput }) => {
                    this.removeInput(caseInput.name);
                    this.removeInput(caseLabelInput.name);
                });

                // append new case inputs
                extraState.cases.forEach((name, i) => {
                    this.appendDummyInput(caseLabel(i)).appendField(name);
                    this.appendStatementInput(caseI(i));
                });

                // remove existing default input
                this.removeInput(INPUT_MATCH_DEFAULTNAME, true);
                this.removeInput(INPUT_MATCH_DEFAULT, true);

                // append new default input
                if (extraState.default) {
                    this.appendDummyInput(INPUT_MATCH_DEFAULTNAME).appendField(
                        "default",
                    );
                    this.appendStatementInput(INPUT_MATCH_DEFAULT);
                }
            },

            decompose: function (
                this: Blockly.BlockSvg,
                workspace: Blockly.WorkspaceSvg,
            ) {
                const match = workspace.newBlock(BLOCK_MATCH_MATCH.type);
                match.initSvg();
                match.render();

                let caseConnection = match.getInput(
                    BLOCK_MATCH_MATCH.args1[0].name,
                )?.connection;
                if (!caseConnection) {
                    throw Error("match should have case connection");
                }

                const cases = getCases(this);
                for (const caseName of cases) {
                    const caseBlock = workspace.newBlock(BLOCK_MATCH_CASE.type);
                    caseBlock.setFieldValue(
                        caseName,
                        BLOCK_MATCH_CASE.args0[0].name,
                    );
                    caseConnection.connect(caseBlock.previousConnection);
                    caseConnection = caseBlock.nextConnection;
                    caseBlock.initSvg();
                    caseBlock.render();
                }

                match.setFieldValue(
                    String(hasDefault(this)).toUpperCase(),
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
                    (caseBlock as MatchCaseBlock).matchCaseConnection =
                        this.getInputTargetBlock(caseI(i))
                            ?.previousConnection ?? undefined;
                }
            },

            compose: function (
                this: Blockly.BlockSvg,
                topBlock: MatchMatchBlock,
            ) {
                // remove existing case inputs
                getCaseInputs(this).forEach(({ caseInput, caseLabelInput }) => {
                    this.removeInput(caseInput.name);
                    this.removeInput(caseLabelInput.name);
                });

                // append new case inputs
                getMutatorCases(topBlock).forEach(({ name, connection }, i) => {
                    this.appendDummyInput(caseLabel(i)).appendField(name);
                    const caseInput = this.appendStatementInput(caseI(i));
                    if (connection) {
                        caseInput.connection?.connect(connection);
                    }
                });

                const shouldHaveDefault =
                    topBlock.getFieldValue(BLOCK_MATCH_MATCH.args2[0].name) ===
                    "TRUE";

                // remove existing default input
                this.removeInput(INPUT_MATCH_DEFAULTNAME, true);
                this.removeInput(INPUT_MATCH_DEFAULT, true);

                // append new default input
                if (shouldHaveDefault) {
                    this.appendDummyInput(INPUT_MATCH_DEFAULTNAME).appendField(
                        "default",
                    );
                    const defaultInput =
                        this.appendStatementInput(INPUT_MATCH_DEFAULT);
                    if (topBlock.matchDefaultConnection) {
                        defaultInput.connection?.connect(
                            topBlock.matchDefaultConnection,
                        );
                    }
                }

                return;
            },
        },
        undefined,
        [BLOCK_MATCH_CASE.type],
    );
}
