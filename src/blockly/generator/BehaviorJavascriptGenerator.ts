import type { Block, Workspace } from "blockly";
import * as Blockly from "blockly";
import * as javascript from "blockly/javascript";
import {
    CONSTANT_TRIGGER_HANDLERS,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_BEHAVIOR_REGISTRY,
    PARAMETER_GLOBALS,
    PARAMETER_HAT_ID,
    PARAMETER_ITEM_PROXY,
    PARAMETER_SELF_ID,
    PARAMETER_SIGNAL,
    VAR_LOOP_CHECK,
} from "../../constants";
import { isGlobal } from "../variables/VariableMap";
import { GENERATORS, type CodeGenerator } from "./blockGenerators";

function isHatBlock(block: Blockly.Block): boolean {
    // https://github.com/google/blockly/blob/d1b17d1f900b89ce7fee8d9a631f79dde7bd35ac/core/renderers/common/info.ts#L219
    return (
        block.outputConnection === null &&
        block.previousConnection === null &&
        block.nextConnection !== null
    );
}

export class BehaviorJavascriptGenerator extends javascript.JavascriptGenerator {
    readonly #globalIds = new Set<Blockly.IVariableState["id"]>();

    constructor() {
        super();
        this.addReservedWords(
            [
                PARAMETER_SELF_ID,
                PARAMETER_SIGNAL,
                PARAMETER_BEHAVIOR_IMPL,
                PARAMETER_ITEM_PROXY,
                PARAMETER_BEHAVIOR_REGISTRY,
                PARAMETER_HAT_ID,
                CONSTANT_TRIGGER_HANDLERS,
                VAR_LOOP_CHECK,
            ].join(","),
        );

        Object.entries(javascript.javascriptGenerator.forBlock).forEach(
            ([blockType, generator]) =>
                (this.forBlock[blockType] =
                    generator as unknown as CodeGenerator),
        );

        Object.entries(GENERATORS).forEach(
            ([blockType, generator]) => (this.forBlock[blockType] = generator),
        );
        this.INFINITE_LOOP_TRAP = [
            `if (--${VAR_LOOP_CHECK} <= 0) {`,
            '  throw Error("Exhausted loop iterations in block %1");',
            "}\n",
        ].join("\n");
    }

    /**
     * Get either a variable name (for locals), or an index expression (for globals)
     */
    readonly getVariableReference = (
        id: Blockly.IVariableState["id"],
    ): string => {
        if (this.#globalIds.has(id)) {
            return `${PARAMETER_GLOBALS}[${this.quote_(id)}]`;
        } else {
            return this.getVariableName(id);
        }
    };

    readonly getDeveloperVariableName = (name: string): string => {
        // see https://github.com/google/blockly/blob/8580d763b34b10c961d43ae8a61ce76c8669548c/core/generator.ts#L539
        if (!this.nameDB_) {
            throw new Error(
                "Name database is not defined. You must initialize `nameDB_` in your generator class and call `init` first.",
            );
        }
        return this.nameDB_.getName(
            name,
            Blockly.Names.NameType.DEVELOPER_VARIABLE,
        );
    };

    /**
     * Mostly copied from https://github.com/google/blockly/blob/8580d763b34b10c961d43ae8a61ce76c8669548c/generators/javascript/javascript_generator.ts#L150
     * @param workspace
     */
    override readonly init = (workspace: Workspace) => {
        this.definitions_ = {};
        this.functionNames_ = {};

        if (!this.nameDB_) {
            this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
        } else {
            this.nameDB_.reset();
        }

        this.nameDB_.setVariableMap(workspace.getVariableMap());
        this.nameDB_.populateVariables(workspace);
        this.nameDB_.populateProcedures(workspace);

        const defvars = [];
        // Add developer variables (not created or named by the user).
        const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
        for (const devVar of devVarList) {
            defvars.push(
                this.nameDB_.getName(
                    devVar,
                    Blockly.Names.NameType.DEVELOPER_VARIABLE,
                ),
            );
        }

        // Add user variables, but only ones that are being used.
        const variables = Blockly.Variables.allUsedVarModels(workspace);
        this.#globalIds.clear();
        for (const varModel of variables) {
            // CHANGE: only generate non-globals, save IDs of globals
            if (isGlobal(varModel)) {
                this.#globalIds.add(varModel.getId());
            } else {
                defvars.push(
                    this.nameDB_.getName(
                        varModel.getId(),
                        Blockly.Names.NameType.VARIABLE,
                    ),
                );
            }
        }

        // Declare all of the variables.
        if (defvars.length) {
            this.definitions_.variables = "let " + defvars.join(", ") + ";"; // CHANGE: use 'let' not 'var'
        }
        this.isInitialized = true;
    };

    /**
     * Mostly copied from https://github.com/google/blockly/blob/3ccfba9c4b7d3953caec14a3cfc347c0205c9c06/core/generator.ts#L147
     * @returns Code for hat blocks only
     */
    override readonly workspaceToCode = (workspace?: Workspace): string => {
        if (!workspace) {
            // Backwards compatibility from before there could be multiple workspaces.
            console.warn(
                "No workspace specified in workspaceToCode call.  Guessing.",
            );
            workspace = Blockly.common.getMainWorkspace();
        }
        const code = [];
        this.init(workspace);
        const blocks = workspace.getTopBlocks(false); // CHANGE: don't bother sorting
        for (let i = 0, block; (block = blocks[i]); i++) {
            // CHANGE: filter for hat blocks
            if (!isHatBlock(block)) {
                continue;
            }
            let line = this.blockToCode(block, true); // CHANGE: enable thisOnly, hat blocks autogen their next blocks
            if (Array.isArray(line)) {
                // Value blocks return tuples of code and operator order.
                // Top-level blocks don't care about operator order.
                line = line[0];
            }
            if (line) {
                if (block.outputConnection) {
                    // This block is a naked value.  Ask the language's code generator if
                    // it wants to append a semicolon, or something.
                    line = this.scrubNakedValue(line);
                    if (this.STATEMENT_PREFIX && !block.suppressPrefixSuffix) {
                        line =
                            this.injectId(this.STATEMENT_PREFIX, block) + line;
                    }
                    if (this.STATEMENT_SUFFIX && !block.suppressPrefixSuffix) {
                        line =
                            line + this.injectId(this.STATEMENT_SUFFIX, block);
                    }
                }
                code.push(line);
            }
        }
        // Blank line between each section.
        let codeString = code.join("\n");
        codeString = this.finish(codeString);
        // Final scrubbing of whitespace.
        codeString = codeString.replace(/^\s+\n/, "");
        codeString = codeString.replace(/\n\s+$/, "\n");
        codeString = codeString.replace(/[ \t]+\n/g, "\n");
        return codeString;
    };

    /**
     * @returns "undefined" if the inner evaluation was empty, otherwise the inner evaluation.
     */
    override valueToCode(
        block: Block,
        name: string,
        outerOrder: number,
    ): string {
        const result = super.valueToCode(block, name, outerOrder);
        if (result === "") {
            return "undefined";
        } else {
            return result;
        }
    }
}
