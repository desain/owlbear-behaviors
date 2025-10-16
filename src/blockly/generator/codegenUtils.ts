import type { Block } from "blockly";
import * as Blockly from "blockly";
import * as javascript from "blockly/javascript";
import type { DistributiveOmit } from "owlbear-utils";
import type { BEHAVIORS_IMPL } from "../../behaviors/BehaviorImpl";
import type { TriggerHandler } from "../../behaviors/TriggerHandler";
import {
    CONSTANT_TRIGGER_HANDLERS,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_HAT_ID,
    PARAMETER_ITEM_PROXY,
    PARAMETER_OTHER_ID,
    PARAMETER_SELF_ID,
    PARAMETER_SIGNAL,
    VAR_LOOP_CHECK,
} from "../../constants";
import type { BehaviorJavascriptGenerator } from "./BehaviorJavascriptGenerator";

export function generateBlock(
    generator: BehaviorJavascriptGenerator,
    prefix: string,
    contents: string,
    prefix2?: string,
    contents2?: string,
): string {
    return [
        `${prefix} {`,
        generator.prefixLines(contents, generator.INDENT),
        ...(prefix2 && contents2
            ? [
                  [
                      `} ${prefix2} {`,
                      generator.prefixLines(contents2, generator.INDENT),
                      "}\n",
                  ].join("\n"),
              ]
            : ["}\n"]),
    ].join("\n");
}

export function provideNum(generator: BehaviorJavascriptGenerator): string {
    return generator.provideFunction_("num", [
        `function ${generator.FUNCTION_NAME_PLACEHOLDER_}(x) {`,
        generator.prefixLines(
            [
                "const n = Number(x);",
                "return isFinite(n) && !isNaN(n) ? n : 0",
            ].join("\n"),
            generator.INDENT,
        ),
        "}",
    ]);
}

export function provideComparison(
    generator: BehaviorJavascriptGenerator,
    op: "<" | "===" | ">",
) {
    const opName = {
        "<": "Lt",
        "===": "Eq",
        ">": "Gt",
    }[op];
    return generator.provideFunction_(`compare${opName}`, [
        "function " + generator.FUNCTION_NAME_PLACEHOLDER_ + "(a, b) {",
        // Check if both values are numeric
        "  const aNum = Number(a);",
        "  const bNum = Number(b);",
        '  if (!isNaN(aNum) && !isNaN(bNum) && a !== "" && b !== "") {',
        // Numeric comparison
        `    return aNum ${op} bNum;`,
        "  }",
        // String comparison
        `  return a ${op} b`,
        "}",
    ]);
}

export function noCodegen(block: Block): string {
    throw Error(`${block.type} should not be used for codegen`);
}

export function getHatBlockBehaviorFunction(
    block: Blockly.Block,
    generator: BehaviorJavascriptGenerator,
) {
    const nextBlock = block.getNextBlock();
    const statementsResult = nextBlock ? generator.blockToCode(nextBlock) : "";
    const statementsCode =
        typeof statementsResult === "string"
            ? statementsResult
            : statementsResult[0];

    return generateBlock(
        generator,
        `async (${PARAMETER_SIGNAL}, ${PARAMETER_HAT_ID}, ${PARAMETER_OTHER_ID}) =>`,
        generateBlock(
            generator,
            "try",
            [`let ${VAR_LOOP_CHECK} = 10_000;`, statementsCode].join("\n"),
            "catch(e)",
            `console.warn('error in block ' + ${PARAMETER_HAT_ID}, e)\n` +
                generateBlock(
                    generator,
                    "if (e instanceof Error)",
                    'void OBR.notification.show(e.message, "ERROR")',
                    "else if (e?.error?.message)",
                    'void OBR.notification.show(e.error.message, "ERROR")',
                ),
        ),
    );
}

export function generateAddTriggerHandler(
    block: Blockly.Block,
    generator: BehaviorJavascriptGenerator,
    handler: DistributiveOmit<TriggerHandler, "behaviorFunction">,
) {
    const behaviorFunction = getHatBlockBehaviorFunction(block, generator);
    const handlerJson = JSON.stringify(handler).replace(
        /}$/,
        ', "behaviorFunction": ' + behaviorFunction + "}",
    );
    return `${CONSTANT_TRIGGER_HANDLERS}.push(${handlerJson});`;
}

export function generateSelfUpdate(
    generator: BehaviorJavascriptGenerator,
    updateCode: string,
) {
    return [
        `await ${PARAMETER_ITEM_PROXY}.update(${PARAMETER_SELF_ID}, (self) => {`,
        generator.prefixLines(updateCode, generator.INDENT),
        "});",
        `${PARAMETER_SIGNAL}.throwIfAborted();\n`,
    ].join("\n");
}

export function generateVariable(
    generator: BehaviorJavascriptGenerator,
    name: string,
    value: string,
    mutable?: boolean,
): [varName: string, initVar: string] {
    const varName =
        generator.nameDB_?.getDistinctName(
            name,
            Blockly.Names.NameType.VARIABLE,
        ) ?? name;
    const init = `${mutable ? "let" : "const"} ${varName} = ${value};`;
    return [varName, init];
}

export function getStringFieldValue(
    block: Blockly.Block,
    name: string,
): string {
    const value: unknown = block.getFieldValue(name);
    if (typeof value !== "string") {
        throw Error(`${name} should be string`);
    }
    return value;
}

interface BlockTypeWithDropdownAt<Args0Index extends number> {
    args0: Record<Args0Index, { name: string; options: readonly unknown[] }>;
}
type SecondOfTuple<T> = T extends readonly [a: unknown, b: infer S] ? S : never;
type DropdownValue<
    Args0Index extends number,
    BlockType extends BlockTypeWithDropdownAt<Args0Index>,
> = SecondOfTuple<BlockType["args0"][Args0Index]["options"][number]>;
export function getDropdownFieldValue<
    Args0Index extends number,
    BlockType extends BlockTypeWithDropdownAt<Args0Index>,
>(
    block: Blockly.Block,
    blockDefinition: BlockType,
    index: Args0Index,
): DropdownValue<Args0Index, BlockType> {
    return getStringFieldValue(
        block,
        blockDefinition.args0[index].name,
    ) as DropdownValue<Args0Index, BlockType>;
}

export function getNumberFieldValue(
    block: Blockly.Block,
    name: string,
): number {
    const value: unknown = block.getFieldValue(name);
    if (typeof value !== "number") {
        throw Error(`${name} should be string`);
    }
    return value;
}

type BehaviorParams<T extends readonly unknown[]> = {
    [K in keyof T]: T[K] extends AbortSignal
        ? typeof PARAMETER_SIGNAL
        : T[K] extends boolean
        ? "true" | "false"
        : string;
};
/**
 * Generate a call to a behavior function by name.
 * @param behaviorName The name of the behavior function to call.
 * @returns A string representing the behavior function call.
 */
export function behave<T extends keyof typeof BEHAVIORS_IMPL>(
    behaviorName: T,
    ...params: BehaviorParams<Parameters<(typeof BEHAVIORS_IMPL)[T]>>
) {
    return `${PARAMETER_BEHAVIOR_IMPL}.${behaviorName}(${params.join(", ")})`;
}

/**
 * Generate a call to an async behavior function by name, as a value with a JS order.
 * @param behaviorName The name of the behavior function to call.
 * @returns A string representing the behavior function call.
 */
export function awaitBehaveValue<T extends keyof typeof BEHAVIORS_IMPL>(
    behaviorName: T,
    ...params: BehaviorParams<Parameters<(typeof BEHAVIORS_IMPL)[T]>>
): [code: string, order: javascript.Order] {
    return [`await ${behave(behaviorName, ...params)}`, javascript.Order.AWAIT];
}

/**
 * Generate a call to an async behavior function by name, as a statement.
 * @param behaviorName The name of the behavior function to call.
 * @returns A string representing the behavior function call.
 */
export function awaitBehaveStatement<T extends keyof typeof BEHAVIORS_IMPL>(
    behaviorName: T,
    ...params: BehaviorParams<Parameters<(typeof BEHAVIORS_IMPL)[T]>>
) {
    return `await ${behave(behaviorName, ...params)};\n`;
}
