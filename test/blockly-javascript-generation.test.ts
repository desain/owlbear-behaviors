import * as Blockly from "blockly";
import { beforeEach, describe, expect, it } from "vitest";
import { BehaviorJavascriptGenerator } from "../src/blockly/BehaviorJavascriptGenerator";
import {
    BLOCK_REPEAT,
    BLOCK_REPEAT_UNTIL,
    CUSTOM_JSON_BLOCKS,
} from "../src/blockly/blocks";

function checkValidJs(code: unknown) {
    // eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions, @typescript-eslint/no-empty-function
    const AsyncFunction = async function () {}.constructor;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    AsyncFunction(code);
}

describe("Blockly JavaScript Generation", () => {
    let workspace: Blockly.Workspace;
    let generator: BehaviorJavascriptGenerator;

    beforeEach(() => {
        // Register the blocks with Blockly
        Blockly.common.defineBlocksWithJsonArray(CUSTOM_JSON_BLOCKS);

        // Create a headless workspace for testing
        workspace = new Blockly.Workspace();
        generator = new BehaviorJavascriptGenerator();
        generator.init(workspace);
    });

    describe("control_repeat_until block", () => {
        it("should generate syntactically valid JavaScript for basic repeat until loop", () => {
            // Create the repeat until block
            const repeatBlock = workspace.newBlock(BLOCK_REPEAT_UNTIL.type);

            // Create a simple boolean condition block (true)
            const conditionBlock = workspace.newBlock("logic_boolean");
            conditionBlock.setFieldValue("TRUE", "BOOL");
            expect(conditionBlock.outputConnection).not.toBeNull();

            // Connect condition to the repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT_UNTIL.args0[0].name)
                ?.connection?.connect(conditionBlock.outputConnection!);

            // Generate JavaScript
            const generatedCode = generator.blockToCode(repeatBlock);

            // Verify the code is not empty and contains expected structure
            expect(generatedCode).toBeTruthy();
            expect(typeof generatedCode).toBe("string");

            // Should be syntactically valid JavaScript
            checkValidJs(generatedCode);
        });

        it("should handle empty condition gracefully", () => {
            // Create repeat block without connecting a condition
            const repeatBlock = workspace.newBlock(BLOCK_REPEAT_UNTIL.type);
            const generatedCode = generator.blockToCode(repeatBlock);

            // Should still generate valid code structure
            expect(generatedCode).toBeTruthy();
            expect(generatedCode).toContain("while");
            expect(generatedCode).toContain("=== false");

            // Should be syntactically valid JavaScript
            checkValidJs(generatedCode);
        });
    });

    describe("control_repeat block", () => {
        it("should generate syntactically valid JavaScript for basic repeat loop", () => {
            // Create the repeat block
            const repeatBlock = workspace.newBlock(BLOCK_REPEAT.type);

            // Create a number block for times (e.g., 5)
            const timesBlock = workspace.newBlock("math_number");
            timesBlock.setFieldValue("5", "NUM");
            expect(timesBlock.outputConnection).not.toBeNull();

            // Connect times to the repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT.args0[0].name)
                ?.connection?.connect(timesBlock.outputConnection!);

            // Generate JavaScript
            const generatedCode = generator.blockToCode(repeatBlock);

            // Verify the code is not empty and contains expected structure
            expect(generatedCode).toBeTruthy();
            expect(typeof generatedCode).toBe("string");
            expect(generatedCode).toContain("for");

            // Should be syntactically valid JavaScript
            checkValidJs(generatedCode);
        });

        it("should handle mathematical expressions for repeat count", () => {
            // Create the repeat block
            const repeatBlock = workspace.newBlock(BLOCK_REPEAT.type);

            // Create a math arithmetic block (e.g., 3 + 2)
            const mathBlock = workspace.newBlock("math_arithmetic");
            mathBlock.setFieldValue("ADD", "OP");

            // Create number blocks for the math operation
            const leftNumber = workspace.newBlock("math_number");
            leftNumber.setFieldValue("3", "NUM");
            const rightNumber = workspace.newBlock("math_number");
            rightNumber.setFieldValue("2", "NUM");

            // Connect numbers to math block
            mathBlock
                .getInput("A")
                ?.connection?.connect(leftNumber.outputConnection!);
            mathBlock
                .getInput("B")
                ?.connection?.connect(rightNumber.outputConnection!);

            // Connect math block to repeat block
            repeatBlock
                .getInput(BLOCK_REPEAT.args0[0].name)
                ?.connection?.connect(mathBlock.outputConnection!);

            // Generate JavaScript
            const generatedCode = generator.blockToCode(repeatBlock);

            // Verify structure
            expect(generatedCode).toBeTruthy();
            expect(generatedCode).toContain("for");

            // Should be syntactically valid JavaScript
            checkValidJs(generatedCode);
        });

        it("should handle empty times input gracefully", () => {
            // Create repeat block without connecting a times input
            const repeatBlock = workspace.newBlock(BLOCK_REPEAT.type);
            const generatedCode = generator.blockToCode(repeatBlock);

            // Should still generate valid code structure
            expect(generatedCode).toBeTruthy();
            expect(generatedCode).toContain("for");

            // Should be syntactically valid JavaScript
            checkValidJs(generatedCode);
        });
    });
});
