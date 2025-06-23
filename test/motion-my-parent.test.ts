import type { Block } from "blockly";
import { describe, expect, it } from "vitest";
import { BehaviorJavascriptGenerator } from "../src/blockly/BehaviorJavascriptGenerator";
import { BLOCK_MY_PARENT } from "../src/blockly/blocks";

describe("motion_my_parent block", () => {
    it("should generate correct JavaScript code", () => {
        const generator = new BehaviorJavascriptGenerator();

        // Mock block
        const mockBlock = {
            type: BLOCK_MY_PARENT.type,
            getFieldValue: () => null,
            getInput: () => null,
            getNextBlock: () => null,
            getPreviousBlock: () => null,
            outputConnection: {},
            previousConnection: null,
            nextConnection: null,
        };

        const blockGenerator = generator.forBlock[BLOCK_MY_PARENT.type];
        expect(blockGenerator).toBeDefined();
        const result = blockGenerator!(
            mockBlock as unknown as Block,
            generator,
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        if (Array.isArray(result)) {
            const [code, precedence] = result;
            expect(code).toBe(
                "ItemProxy.of((self.cached ?? await self.cache(signal)).attachedTo)",
            );
            expect(precedence).toBeDefined();
        }
    });

    it("should be defined in CUSTOM_JSON_BLOCKS", () => {
        expect(BLOCK_MY_PARENT.type).toBe("motion_my_parent");
        expect(BLOCK_MY_PARENT.message0).toBe("my parent");
        expect(BLOCK_MY_PARENT.output).toBe("ItemProxy");
    });
});
