import * as Blockly from "blockly";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
    BlocklySerializedWorkspace,
    SerializedWorkspace,
} from "../src/blockly/serialization/workspaceAdapter";
import {
    blocklyToBehaviorsWorkspace,
    isSerializedWorkspace,
    loadBehaviorsWorkspace,
} from "../src/blockly/serialization/workspaceAdapter";

vi.mock("blockly", () => ({
    serialization: {
        workspaces: {
            save: vi.fn(),
            load: vi.fn(),
        },
    },
}));

function getLoadedWorkspace() {
    return vi.mocked(Blockly.serialization.workspaces.load).mock
        .calls[0]![0] as BlocklySerializedWorkspace;
}

describe("workspaceAdapter", () => {
    const DUMMY_BLOCKLY_WORKSPACE: Blockly.Workspace = {} as Blockly.Workspace;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("blocklyToBehaviorsWorkspace", () => {
        it("should flatten nested blocks (next connection)", () => {
            const nested = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        {
                            id: "root",
                            type: "root_block",
                            next: {
                                block: {
                                    id: "child",
                                    type: "child_block",
                                },
                            },
                        },
                    ],
                },
            } satisfies SerializedWorkspace;
            vi.mocked(Blockly.serialization.workspaces.save).mockReturnValue(
                nested,
            );

            const result = blocklyToBehaviorsWorkspace(DUMMY_BLOCKLY_WORKSPACE);

            expect(result.blocks.blocks).toHaveLength(2);
            // Root block
            const root = result.blocks.blocks.find((b) => b.id === "root");
            expect(root).toBeDefined();
            expect(root?.p).toBeUndefined();
            expect(root?.next).toBeUndefined();

            // Child block
            const child = result.blocks.blocks.find((b) => b.id === "child");
            expect(child).toBeDefined();
            expect(child?.p).toBe("root");
        });

        it("should flatten nested blocks (input connection)", () => {
            const nested = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        {
                            id: "root",
                            inputs: {
                                SUBSTACK: {
                                    block: {
                                        id: "child",
                                    },
                                },
                            },
                        },
                    ],
                },
            } satisfies SerializedWorkspace;
            vi.mocked(Blockly.serialization.workspaces.save).mockReturnValue(
                nested,
            );

            const result = blocklyToBehaviorsWorkspace(DUMMY_BLOCKLY_WORKSPACE);

            const child = result.blocks.blocks.find((b) => b.id === "child");
            expect(child).toBeDefined();
            expect(child?.p).toEqual(["root", "SUBSTACK"]);
        });

        it("should preserve shadows in inputs", () => {
            const nested = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        {
                            id: "root",
                            inputs: {
                                ARG: {
                                    shadow: { id: "shadow1" },
                                    block: { id: "child" }, // Block covering shadow
                                },
                                ARG2: {
                                    shadow: { id: "shadow2" }, // Just shadow
                                },
                            },
                        },
                    ],
                },
            } satisfies SerializedWorkspace;
            vi.mocked(Blockly.serialization.workspaces.save).mockReturnValue(
                nested,
            );

            const result = blocklyToBehaviorsWorkspace(DUMMY_BLOCKLY_WORKSPACE);

            const root = result.blocks.blocks.find((b) => b.id === "root");
            // ARG should still have shadow
            expect(root?.inputs?.ARG).toEqual({ shadow: { id: "shadow1" } });
            // ARG2 should still have shadow
            expect(root?.inputs?.ARG2).toEqual({ shadow: { id: "shadow2" } });

            const child = result.blocks.blocks.find((b) => b.id === "child");
            expect(child?.p).toEqual(["root", "ARG"]);
        });
    });

    describe("loadBehaviorsWorkspace", () => {
        it("should reconstruct nested structure", () => {
            const behaviors = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        { id: "root" },
                        { id: "child1", p: "root" }, // next
                        { id: "child2", p: ["root", "INPUT"] }, // input
                    ],
                },
            } satisfies SerializedWorkspace;

            loadBehaviorsWorkspace(behaviors, DUMMY_BLOCKLY_WORKSPACE);

            // Get the first argument of the first call to load
            const calledArg = getLoadedWorkspace();
            const root = calledArg.blocks.blocks.find((b) => b.id === "root");

            expect(root).toBeDefined();
            expect(root?.next).toHaveProperty("block");
            expect((root?.next as { block: { id: string } }).block.id).toBe(
                "child1",
            );
            expect(root?.inputs?.INPUT).toHaveProperty("block");
            expect(
                (root?.inputs?.INPUT as { block: { id: string } }).block.id,
            ).toBe("child2");
        });

        it("should merge with existing shadows in inputs during reconstruction", () => {
            const behaviors = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        {
                            id: "root",
                            inputs: {
                                INPUT: { shadow: { id: "shadow1" } },
                            },
                        },
                        { id: "child", p: ["root", "INPUT"] },
                    ],
                },
            } satisfies SerializedWorkspace;

            loadBehaviorsWorkspace(behaviors, DUMMY_BLOCKLY_WORKSPACE);

            const calledArg = getLoadedWorkspace();
            const root = calledArg.blocks.blocks.find((b) => b.id === "root");

            expect(
                (root?.inputs?.INPUT as { shadow: { id: string } }).shadow.id,
            ).toBe("shadow1");
            expect(
                (root?.inputs?.INPUT as { block: { id: string } }).block.id,
            ).toBe("child");
        });

        it("Should throw an error if a parent block is missing", () => {
            const behaviors = {
                blocks: {
                    languageVersion: 0,
                    blocks: [
                        {
                            id: "bad",
                            p: "nonexistent",
                        },
                    ],
                },
            } satisfies SerializedWorkspace;

            expect(() => {
                loadBehaviorsWorkspace(behaviors, DUMMY_BLOCKLY_WORKSPACE);
            }).toThrow();
        });
    });

    describe("isBehaviorsWorkspace", () => {
        it("should identify behaviors workspace", () => {
            const valid = {
                blocks: { languageVersion: 0, blocks: [{ id: "1" }] },
            };
            expect(isSerializedWorkspace(valid)).toBe(true);
        });

        it("should reject invalid objects", () => {
            expect(isSerializedWorkspace({})).toBe(false);
            expect(isSerializedWorkspace({ blocks: "not array" })).toBe(false);
            expect(isSerializedWorkspace(null)).toBe(false);
        });

        it("should accept empty blocks array", () => {
            expect(
                isSerializedWorkspace({
                    blocks: { languageVersion: 0, blocks: [] },
                }),
            ).toBe(true);
        });
    });
});
