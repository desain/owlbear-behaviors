import type { Block, Workspace } from "blockly";
import * as Blockly from "blockly";
import * as javascript from "blockly/javascript";
import { isHexColor, type DistributiveOmit } from "owlbear-utils";
import type { BEHAVIORS_IMPL } from "../behaviors/BehaviorImpl";
import type { TriggerHandler } from "../behaviors/TriggerHandler";
import {
    CONSTANT_BEHAVIOR_DEFINITION,
    FIELD_BROADCAST,
    FIELD_SOUND,
    FIELD_TAG,
    INPUT_TAG,
    METADATA_KEY_EFFECT,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_ITEM_PROXY,
    PARAMETER_OTHER_ID,
    PARAMETER_SELF_ID,
    PARAMETER_SIGNAL,
    VAR_LOOP_CHECK,
} from "../constants";
import {
    BLOCK_ADD_AURA,
    BLOCK_ANGLE,
    BLOCK_ANNOUNCEMENT,
    BLOCK_ATTACH,
    BLOCK_BROADCAST,
    BLOCK_CHANGE_EFFECT_BY,
    BLOCK_CHANGE_SIZE,
    BLOCK_COLOR_PICKER,
    BLOCK_CONTAINS,
    BLOCK_DESELECT,
    BLOCK_DYNAMIC_VAL,
    BLOCK_EQUALS,
    BLOCK_FACE,
    BLOCK_FOREVER,
    BLOCK_GLIDE,
    BLOCK_GLIDE_ROTATE_LEFT,
    BLOCK_GLIDE_ROTATE_RIGHT,
    BLOCK_GOTO,
    BLOCK_GREATER_THAN,
    BLOCK_HAS_TAG_OTHER,
    BLOCK_HOOT,
    BLOCK_IF,
    BLOCK_IF_ELSE,
    BLOCK_ITEM_MENU,
    BLOCK_JOIN,
    BLOCK_LESS_THAN,
    BLOCK_LETTER_OF,
    BLOCK_MOVE_DIRECTION,
    BLOCK_OPACITY_SLIDER,
    BLOCK_POINT_IN_DIRECTION,
    BLOCK_REMOVE_TAG,
    BLOCK_REPEAT,
    BLOCK_REPEAT_UNTIL,
    BLOCK_REPLACE_IMAGE,
    BLOCK_ROTATE_LEFT,
    BLOCK_ROTATE_RIGHT,
    BLOCK_SAY,
    BLOCK_SET_EFFECT_TO,
    BLOCK_SET_FILL_COLOR,
    BLOCK_SET_FILL_OPACITY,
    BLOCK_SET_LABEL,
    BLOCK_SET_LAYER,
    BLOCK_SET_SIZE,
    BLOCK_SET_STROKE_COLOR,
    BLOCK_SET_STROKE_OPACITY,
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_TAG,
    BLOCK_TOUCH,
    BLOCK_WAIT,
    BLOCK_WAIT_UNTIL,
    BLOCK_WHEN_I,
    type CustomBlockType,
} from "./blocks";

const THROW_ON_ABORT = `${PARAMETER_SIGNAL}.throwIfAborted();\n`;

type Generator = (
    block: Block,
    generator: javascript.JavascriptGenerator,
) => [code: string, precedence: number] | string | null;

function generateBlock(
    generator: javascript.JavascriptGenerator,
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

function provideNum(generator: javascript.JavascriptGenerator): string {
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

function provideComparison(
    generator: javascript.JavascriptGenerator,
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

/**
 * Access self, only awaiting if necessary.
 */
const SELF = `(await ${PARAMETER_ITEM_PROXY}.get(${PARAMETER_SELF_ID}))`;

type TriggerHandlerJson = DistributiveOmit<
    TriggerHandler,
    "behaviorFunction"
> & {
    behaviorFunction: string;
};

function getHatBlockBehaviorFunction(
    block: Blockly.Block,
    generator: javascript.JavascriptGenerator,
) {
    const nextBlock = block.getNextBlock();
    const statementsResult = nextBlock ? generator.blockToCode(nextBlock) : "";
    const statementsCode =
        typeof statementsResult === "string"
            ? statementsResult
            : statementsResult[0];

    return generateBlock(
        generator,
        `async (${PARAMETER_SIGNAL}, ${PARAMETER_OTHER_ID}) =>`,
        generateBlock(
            generator,
            "try",
            [`let ${VAR_LOOP_CHECK} = 10_000;`, statementsCode].join("\n"),
            "catch(e)",
            `console.warn('error in block ${block.id}', e)\n` +
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

function generateAddTriggerHandler(handler: TriggerHandlerJson) {
    const handlerWithoutBehaviorFunction: Partial<typeof handler> = {
        ...handler,
    };
    delete handlerWithoutBehaviorFunction.behaviorFunction;
    const handlerJson = JSON.stringify(handlerWithoutBehaviorFunction).replace(
        "{",
        `{"behaviorFunction": ${handler.behaviorFunction},`,
    );

    return `${CONSTANT_BEHAVIOR_DEFINITION}.triggerHandlers.push(${handlerJson});`;
}

function generateSelfUpdate(
    generator: javascript.JavascriptGenerator,
    updateCode: string,
) {
    return [
        `await ${PARAMETER_ITEM_PROXY}.update(${PARAMETER_SELF_ID}, (self) => {`,
        generator.prefixLines(updateCode, generator.INDENT),
        "});",
        `${PARAMETER_SIGNAL}.throwIfAborted();\n`,
    ].join("\n");
}

function generateVariable(
    generator: javascript.JavascriptGenerator,
    name: string,
    value: string,
): [varName: string, initVar: string] {
    const varName =
        generator.nameDB_?.getDistinctName(
            name,
            Blockly.Names.NameType.VARIABLE,
        ) ?? name;
    const init = `const ${varName} = ${value};`;
    return [varName, init];
}

/**
 * Generate a call to a behavior function by name.
 * @param behaviorName The name of the behavior function to call.
 * @returns A string representing the behavior function call.
 */
function behave(
    behaviorName: keyof typeof BEHAVIORS_IMPL,
    ...params: string[]
) {
    return `${PARAMETER_BEHAVIOR_IMPL}.${behaviorName}(${params.join(", ")})`;
}

const GENERATORS: Record<CustomBlockType, Generator> = {
    // Motion blocks
    motion_xposition: () => [`${SELF}.position.x`, javascript.Order.MEMBER],
    motion_yposition: () => [`${SELF}.position.y`, javascript.Order.MEMBER],
    motion_gotoxy: (block, generator) => {
        const x = generator.valueToCode(
            block,
            BLOCK_GOTO.args0[0].name,
            javascript.Order.NONE,
        );
        const y = generator.valueToCode(
            block,
            BLOCK_GOTO.args0[1].name,
            javascript.Order.NONE,
        );
        const num = provideNum(generator);
        return generateSelfUpdate(
            generator,
            [
                `self.position.x = ${num}(${x});`,
                `self.position.y = ${num}(${y})`,
            ].join("\n"),
        );
    },
    motion_glidesecstoxy: (block, generator) => {
        const duration = generator.valueToCode(
            block,
            BLOCK_GLIDE.args0[0].name,
            javascript.Order.NONE,
        );
        const x = generator.valueToCode(
            block,
            BLOCK_GLIDE.args0[1].name,
            javascript.Order.NONE,
        );
        const y = generator.valueToCode(
            block,
            BLOCK_GLIDE.args0[2].name,
            javascript.Order.NONE,
        );
        return `${VAR_LOOP_CHECK} = await ${behave(
            "glide",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            x,
            y,
        )};\n`;
    },
    motion_glide_turnleft: (block, generator) => {
        const duration = generator.valueToCode(
            block,
            BLOCK_GLIDE_ROTATE_LEFT.args0[0].name,
            javascript.Order.NONE,
        );
        const degrees = generator.valueToCode(
            block,
            BLOCK_GLIDE_ROTATE_LEFT.args0[2].name,
            javascript.Order.UNARY_NEGATION,
        );
        return `${VAR_LOOP_CHECK} = await ${behave(
            "glideRotate",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            "-" + degrees,
        )};\n`;
    },
    motion_glide_turnright: (block, generator) => {
        const duration = generator.valueToCode(
            block,
            BLOCK_GLIDE_ROTATE_RIGHT.args0[0].name,
            javascript.Order.NONE,
        );
        const degrees = generator.valueToCode(
            block,
            BLOCK_GLIDE_ROTATE_RIGHT.args0[2].name,
            javascript.Order.NONE,
        );
        return `${VAR_LOOP_CHECK} = await ${behave(
            "glideRotate",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            degrees,
        )};\n`;
    },
    motion_move_direction: (block, generator) => {
        const direction: unknown = block.getFieldValue(
            BLOCK_MOVE_DIRECTION.args0[0].name,
        );
        if (typeof direction !== "string") {
            throw Error("direction should be string");
        }
        const amount = generator.valueToCode(
            block,
            BLOCK_MOVE_DIRECTION.args0[1].name,
            javascript.Order.NONE,
        );
        const units: unknown = block.getFieldValue(
            BLOCK_MOVE_DIRECTION.args0[2].name,
        );
        if (typeof units !== "string") {
            throw Error("units should be string");
        }

        if (direction === "FORWARD") {
            const [offsetVar, initOffset] = generateVariable(
                generator,
                "forwardOffset",
                `await ${behave(
                    "getForwardOffset",
                    PARAMETER_SIGNAL,
                    PARAMETER_SELF_ID,
                    amount,
                    generator.quote_(units),
                )}`,
            );
            return [
                initOffset,
                generateSelfUpdate(
                    generator,
                    `self.position = Math2.add(self.position, ${offsetVar});`,
                ),
            ].join("\n");
        } else {
            return generateSelfUpdate(
                generator,
                `self.position = Math2.add(self.position, ${behave(
                    "getDirectionOffset",
                    generator.quote_(direction),
                    amount,
                    generator.quote_(units),
                )});`,
            );
        }
    },

    motion_attach: (block, generator) => {
        const item =
            generator.valueToCode(
                block,
                BLOCK_ATTACH.args0[0].name,
                javascript.Order.MEMBER,
            ) || "undefined";
        const [newParent, initNewParent] = generateVariable(
            generator,
            "newParent",
            `${item}`,
        );
        return [
            initNewParent,
            generateSelfUpdate(generator, `self.attachedTo = ${newParent};`),
        ].join("\n");
    },

    motion_detach: (_block, generator) =>
        generateSelfUpdate(generator, "self.attachedTo = undefined;"),

    motion_my_parent: () => [`${SELF}.attachedTo`, javascript.Order.MEMBER],

    motion_attached: () => [
        `${SELF}.attachedTo !== undefined`,
        javascript.Order.EQUALITY,
    ],

    motion_turnleft: (block, generator) => {
        const degrees = generator.valueToCode(
            block,
            BLOCK_ROTATE_LEFT.args0[1].name,
            javascript.Order.NONE,
        );
        return generateSelfUpdate(
            generator,
            `self.rotation -= ${provideNum(generator)}(${degrees});`,
        );
    },
    motion_turnright: (block, generator) => {
        const degrees = generator.valueToCode(
            block,
            BLOCK_ROTATE_RIGHT.args0[1].name,
            javascript.Order.ASSIGNMENT,
        );
        return generateSelfUpdate(
            generator,
            `self.rotation += ${provideNum(generator)}(${degrees});`,
        );
    },

    motion_pointindirection: (block, generator) => {
        const direction = generator.valueToCode(
            block,
            BLOCK_POINT_IN_DIRECTION.args0[0].name,
            javascript.Order.ASSIGNMENT,
        );
        const [directionVar, initDirection] = generateVariable(
            generator,
            "rotation",
            `${provideNum(generator)}(${direction})`,
        );
        return [
            initDirection,
            generateSelfUpdate(generator, `self.rotation = ${directionVar};`),
        ].join("\n");
    },

    motion_pointtowards: (block, generator) => {
        const target =
            generator.valueToCode(
                block,
                BLOCK_FACE.args0[0].name,
                javascript.Order.NONE,
            ) || "undefined";
        return `await ${behave(
            "face",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            target,
        )};\n`;
    },

    motion_direction: () => [`${SELF}.rotation`, javascript.Order.MEMBER],

    // Looks blocks
    looks_show: (_block, generator) =>
        generateSelfUpdate(generator, `self.visible = true;`),
    looks_hide: (_block, generator) =>
        generateSelfUpdate(generator, `self.visible = false;`),
    looks_lock: (_block, generator) =>
        generateSelfUpdate(generator, `self.locked = true;`),
    looks_unlock: (_block, generator) =>
        generateSelfUpdate(generator, `self.locked = false;`),
    looks_visible: () => [`${SELF}.visible`, javascript.Order.MEMBER],
    looks_locked: () => [`${SELF}.locked`, javascript.Order.MEMBER],

    looks_sayforsecs: (block, generator) => {
        const message = generator.valueToCode(
            block,
            BLOCK_SAY.args0[0].name,
            javascript.Order.NONE,
        );
        const secs = generator.valueToCode(
            block,
            BLOCK_SAY.args0[1].name,
            javascript.Order.NONE,
        );

        return `await ${behave(
            "say",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            message,
            secs,
        )};\n`;
    },

    // TODO: should this respect horizontal scaling?
    // eg if the item is flipped horizontally (scale.x = -1)
    // then setting size to 200 should make scale.x = -2
    looks_setsizeto: (block, generator) => {
        const size = generator.valueToCode(
            block,
            BLOCK_SET_SIZE.args0[0].name,
            javascript.Order.ATOMIC,
        );
        return `await ${behave(
            "setSize",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            size,
        )};\n`;
    },

    looks_changesizeby: (block, generator) => {
        const delta = generator.valueToCode(
            block,
            BLOCK_CHANGE_SIZE.args0[0].name,
            javascript.Order.ATOMIC,
        );

        return `await ${behave(
            "changeSize",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            delta,
        )};\n`;
    },

    looks_size: () => [
        `100 * Math.max(${SELF}.scale.x, ${SELF}.scale.y)`,
        javascript.Order.MULTIPLICATION,
    ],

    looks_replace_image: (block) => {
        const data = JSON.stringify(
            block.getFieldValue(BLOCK_REPLACE_IMAGE.args0[0].name),
        );
        return `await ${behave(
            "replaceImage",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            data,
        )};\n`;
    },

    looks_get_label: () => [
        `${SELF}.text?.plainText ?? ""`,
        javascript.Order.LOGICAL_OR,
    ],

    looks_set_label: (block, generator) => {
        const label = generator.valueToCode(
            block,
            BLOCK_SET_LABEL.args0[0].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "setName",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            label,
        )};\n`;
    },

    looks_get_layer: () => [`${SELF}.layer`, javascript.Order.MEMBER],
    looks_set_layer: (block, generator) => {
        const layer = generator.valueToCode(
            block,
            BLOCK_SET_LAYER.args0[0].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "setLayer",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            layer,
        )};\n`;
    },

    looks_set_stroke_color: (block, generator) => {
        const color = generator.valueToCode(
            block,
            BLOCK_SET_STROKE_COLOR.args0[0].name,
            javascript.Order.NONE,
        );
        const [colorVar, initColor] = generateVariable(
            generator,
            "color",
            `String(${color})`,
        );
        return generateSelfUpdate(
            generator,
            [
                initColor,
                `if (${behave(
                    "isHexColor",
                    colorVar,
                )} && self?.style?.strokeColor) {`,
                `${generator.INDENT}self.style.strokeColor = ${colorVar};`,
                "}",
            ].join("\n"),
        );
    },

    looks_set_stroke_opacity: (block, generator) => {
        const opacity = generator.valueToCode(
            block,
            BLOCK_SET_STROKE_OPACITY.args0[0].name,
            javascript.Order.NONE,
        );

        return generateSelfUpdate(
            generator,
            [
                "if (self?.style && 'strokeOpacity' in self.style) {",
                `${
                    generator.INDENT
                }self.style.strokeOpacity = Math.max(0, Math.min(100, ${provideNum(
                    generator,
                )}(${opacity}))) / 100`,
                "}",
            ].join("\n"),
        );
    },

    looks_set_fill_color: (block, generator) => {
        const color = generator.valueToCode(
            block,
            BLOCK_SET_FILL_COLOR.args0[0].name,
            javascript.Order.ASSIGNMENT,
        );
        const colorVar =
            generator.nameDB_?.getDistinctName(
                "fillColor",
                Blockly.Names.NameType.VARIABLE,
            ) ?? "fillColor";
        return generateSelfUpdate(
            generator,
            [
                `const ${colorVar} = String(${color});`,
                `if (${behave(
                    "isHexColor",
                    colorVar,
                )} && self?.style?.fillColor) {`,
                `${generator.INDENT}self.style.fillColor = ${colorVar};`,
                "}",
            ].join("\n"),
        );
    },

    looks_set_fill_opacity: (block, generator) => {
        const opacity = generator.valueToCode(
            block,
            BLOCK_SET_FILL_OPACITY.args0[0].name,
            javascript.Order.ATOMIC,
        );
        return generateSelfUpdate(
            generator,
            [
                "if (self?.style && 'fillOpacity' in self.style) {",
                `${
                    generator.INDENT
                }self.style.fillOpacity = Math.max(0, Math.min(100, ${provideNum(
                    generator,
                )}(${opacity}))) / 100`,
                "}",
            ].join("\n"),
        );
    },

    looks_get_stroke_color: () => [
        `${SELF}.style?.strokeColor ?? "#000000"`,
        javascript.Order.LOGICAL_OR,
    ],
    looks_get_stroke_opacity: () => [
        `100 * (${SELF}.style?.strokeOpacity ?? 1)`,
        javascript.Order.MULTIPLICATION,
    ],
    looks_get_fill_color: () => [
        `${SELF}.style?.fillColor ?? "#000000"`,
        javascript.Order.LOGICAL_OR,
    ],
    looks_get_fill_opacity: () => [
        `100 * (${SELF}.style?.fillOpacity ?? 1)`,
        javascript.Order.MULTIPLICATION,
    ],

    looks_seteffectto: (block, generator) => {
        const effect: unknown = block.getFieldValue(
            BLOCK_SET_EFFECT_TO.args0[0].name,
        );
        if (typeof effect !== "string") {
            throw Error("effect should be string");
        }

        const intensity = generator.valueToCode(
            block,
            BLOCK_SET_EFFECT_TO.args0[1].name,
            javascript.Order.NONE,
        );

        return `await ${behave(
            "setEffect",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(effect),
            intensity,
            "false",
        )};\n`;
    },

    looks_changeeffectby: (block, generator) => {
        const effect: unknown = block.getFieldValue(
            BLOCK_CHANGE_EFFECT_BY.args0[0].name,
        );
        if (typeof effect !== "string") {
            throw Error("effect should be string");
        }

        const intensity = generator.valueToCode(
            block,
            BLOCK_CHANGE_EFFECT_BY.args0[1].name,
            javascript.Order.DIVISION,
        );

        return `await ${behave(
            "setEffect",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(effect),
            intensity,
            "true",
        )};\n`;
    },

    looks_cleargraphiceffects: (_block, generator) =>
        generateSelfUpdate(
            generator,
            `delete self.metadata["${METADATA_KEY_EFFECT}"];`,
        ),

    // Sound blocks
    sound_play: (block, generator) => {
        const sound = generator.valueToCode(
            block,
            BLOCK_SOUND_PLAY.args0[0].name,
            javascript.Order.NONE,
        );
        return `void ${behave(
            "playSoundUntilDone",
            PARAMETER_SIGNAL,
            sound,
        )};\n`;
    },

    sound_playuntildone: (block, generator) => {
        const sound = generator.valueToCode(
            block,
            BLOCK_SOUND_PLAY_UNTIL_DONE.args0[0].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "playSoundUntilDone",
            PARAMETER_SIGNAL,
            sound,
        )};\n${PARAMETER_ITEM_PROXY}.invalidate();\n`;
    },

    // Event blocks
    event_broadcast_menu: (block, generator) => {
        const broadcastId: unknown = block.getFieldValue(FIELD_BROADCAST);
        if (typeof broadcastId !== "string") {
            throw Error(
                `Expected broadcast ID to be a string, got ${typeof broadcastId}`,
            );
        }
        return [generator.quote_(broadcastId), javascript.Order.ATOMIC];
    },

    event_broadcast: (block, generator) => {
        const broadcast = generator.valueToCode(
            block,
            BLOCK_BROADCAST.args0[0].name,
            javascript.Order.NONE,
        );
        return `void ${behave("sendMessage", broadcast)};\n`;
    },
    event_immediately: (block, generator) =>
        `${CONSTANT_BEHAVIOR_DEFINITION}.immediately.push(${getHatBlockBehaviorFunction(
            block,
            generator,
        )});\n`,

    event_whenbroadcastreceived: (block, generator) => {
        const broadcastId: unknown = block.getFieldValue(FIELD_BROADCAST);
        if (typeof broadcastId !== "string") {
            throw Error("Expected broadcast ID to be a string");
        }
        return generateAddTriggerHandler({
            type: "broadcast",
            broadcast: broadcastId,
            behaviorFunction: getHatBlockBehaviorFunction(block, generator),
        });
    },

    event_on_property_change: (block, generator) => {
        const behaviorFunction = getHatBlockBehaviorFunction(block, generator);
        const spec = block.getFieldValue(
            BLOCK_WHEN_I.args0[0].name,
        ) as (typeof BLOCK_WHEN_I)["args0"][0]["options"][number][1];
        switch (spec) {
            case "position":
                return generateAddTriggerHandler({
                    type: "position",
                    behaviorFunction,
                });
            case "rotation":
                return generateAddTriggerHandler({
                    type: "rotation",
                    behaviorFunction,
                });
            case "layer":
                return generateAddTriggerHandler({
                    type: "layer",
                    behaviorFunction,
                });
            case "locked:true":
                return generateAddTriggerHandler({
                    type: "locked",
                    newValue: true,
                    behaviorFunction,
                });
            case "locked:false":
                return generateAddTriggerHandler({
                    type: "locked",
                    newValue: false,
                    behaviorFunction,
                });
            case "visible:true": {
                return generateAddTriggerHandler({
                    type: "visible",
                    newValue: true,
                    behaviorFunction,
                });
            }
            case "visible:false": {
                return generateAddTriggerHandler({
                    type: "visible",
                    newValue: false,
                    behaviorFunction,
                });
            }
            case "SELECTED:true":
                return generateAddTriggerHandler({
                    type: "selected",
                    selectedState: true,
                    behaviorFunction,
                });
            case "SELECTED:false":
                return generateAddTriggerHandler({
                    type: "selected",
                    selectedState: false,
                    behaviorFunction,
                });
        }
    },

    event_whentouchingobject: (block, generator) => {
        const touchState: unknown = block.getFieldValue(
            BLOCK_TOUCH.args0[0].name,
        );
        if (typeof touchState !== "string") {
            throw Error("touchState should be string");
        }

        const behaviorFunction = getHatBlockBehaviorFunction(block, generator);
        return generateAddTriggerHandler({
            type: "collision",
            start: touchState === "true",
            behaviorFunction,
        });
    },

    // Control blocks
    control_wait: (block, generator) => {
        const duration = generator.valueToCode(
            block,
            BLOCK_WAIT.args0[0].name,
            javascript.Order.MULTIPLICATION,
        );
        return [
            `await new Promise(resolve => setTimeout(resolve, 1000 * ${provideNum(
                generator,
            )}(${duration})));`,
            `${PARAMETER_ITEM_PROXY}.invalidate();`, // items could have changed during wait
            THROW_ON_ABORT,
        ].join("\n");
    },

    control_behavior_stop: () => "return;\n",

    control_behavior_if: (block, generator) => {
        const condition =
            generator.valueToCode(
                block,
                BLOCK_IF.args0[0].name,
                javascript.Order.NONE,
            ) || "false";
        const statements = generator.statementToCode(
            block,
            BLOCK_IF.args0[2].name,
        );
        return generateBlock(generator, `if (${condition})`, statements);
    },

    control_behavior_if_else: (block, generator) => {
        const condition =
            generator.valueToCode(
                block,
                BLOCK_IF_ELSE.args0[0].name,
                javascript.Order.NONE,
            ) || "false";
        const thenStatements = generator.statementToCode(
            block,
            BLOCK_IF_ELSE.args1[0].name,
        );
        const elseStatements = generator.statementToCode(
            block,
            BLOCK_IF_ELSE.args3[0].name,
        );
        return generateBlock(
            generator,
            `if (${condition})`,
            thenStatements,
            "else",
            elseStatements,
        );
    },

    control_forever: (block, generator) => {
        const statements = generator.statementToCode(
            block,
            BLOCK_FOREVER.args1[0].name,
        );
        return `while (true) {\n${generator.addLoopTrap(
            statements,
            block,
        )}\n}\n`;
    },

    control_repeat: (block, generator) => {
        const countVar =
            generator.nameDB_?.getDistinctName(
                "count",
                Blockly.Names.NameType.VARIABLE,
            ) ?? "count";
        const times = generator.valueToCode(
            block,
            BLOCK_REPEAT.args0[0].name,
            javascript.Order.RELATIONAL,
        );
        let declareMax = "";
        let max = times;
        if (!/\d+/.exec(times)) {
            const maxVar =
                generator.nameDB_?.getDistinctName(
                    "repeat_end",
                    Blockly.Names.NameType.VARIABLE,
                ) ?? "repeat_end";
            declareMax = `const ${maxVar} = ${provideNum(
                generator,
            )}(${times});\n`;
            max = maxVar;
        }
        const statements = generator.statementToCode(
            block,
            BLOCK_REPEAT.args1[0].name,
        );
        return `${declareMax}for (let ${countVar} = 0; ${countVar} < ${max}; ${countVar}++) {\n${generator.addLoopTrap(
            statements,
            block,
        )}\n}\n`;
    },

    control_repeat_until: (block, generator) => {
        const condition =
            generator.valueToCode(
                block,
                BLOCK_REPEAT_UNTIL.args0[0].name,
                javascript.Order.UNARY_NEGATION,
            ) || "true"; // TODO should this be false? false leads to infinite loop
        const statements = generator.statementToCode(
            block,
            BLOCK_REPEAT_UNTIL.args1[0].name,
        );
        return `while (!${condition}) {\n${generator.addLoopTrap(
            statements,
            block,
        )}\n}\n`;
    },

    control_wait_until: (block, generator) => {
        const condition =
            generator.valueToCode(
                block,
                BLOCK_WAIT_UNTIL.args0[0].name,
                javascript.Order.UNARY_NEGATION,
            ) || "true"; // TODO should this be false? leads to infinite loop
        const TIME_BETWEEN_CHECKS = 1000;
        return `while (!${condition}) {\n${generator.addLoopTrap(
            [
                `await new Promise(resolve => setTimeout(resolve, ${TIME_BETWEEN_CHECKS}));`,
                `${PARAMETER_ITEM_PROXY}.invalidate();`,
                THROW_ON_ABORT,
            ].join("\n"),
            block,
        )}\n}\n`;
    },

    // Sensing blocks
    sensing_tag: (block, generator) => {
        const target = generator.valueToCode(
            block,
            BLOCK_TAG.args0[0].name,
            javascript.Order.NONE,
        );
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return `await ${behave("addTag", PARAMETER_SIGNAL, target, tag)};\n`;
    },

    sensing_remove_tag: (block, generator) => {
        const target = generator.valueToCode(
            block,
            BLOCK_REMOVE_TAG.args0[0].name,
            javascript.Order.NONE,
        );
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return `await ${behave("removeTag", PARAMETER_SIGNAL, target, tag)};\n`;
    },

    sensing_has_tag_self: (block, generator) => {
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return [
            `await ${behave(
                "hasTag",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                tag,
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    sensing_has_tag_other: (block, generator) => {
        const target = generator.valueToCode(
            block,
            BLOCK_HAS_TAG_OTHER.args0[0].name,
            javascript.Order.NONE,
        );
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return [
            `await ${behave("hasTag", PARAMETER_SIGNAL, target, tag)}`,
            javascript.Order.AWAIT,
        ];
    },

    sensing_closest_tagged: (block, generator) => {
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return [
            `await ${behave(
                "findClosestTagged",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                tag,
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    sensing_deselect: (block) => {
        const target = block.getFieldValue(
            BLOCK_DESELECT.args0[0].name,
        ) as (typeof BLOCK_DESELECT)["args0"][0]["options"][number][1];
        const deselectArg = target === "THIS" ? `[${PARAMETER_SELF_ID}]` : "";
        return [
            `await ${behave("deselect", deselectArg)};`,
            THROW_ON_ABORT,
        ].join("\n");
    },

    sensing_other_src: () => "",
    sensing_other_val: () => [PARAMETER_OTHER_ID, javascript.Order.ATOMIC],

    // Operator blocks
    operator_join: (block, generator) => {
        const string1 = generator.valueToCode(
            block,
            BLOCK_JOIN.args0[0].name,
            javascript.Order.NONE,
        );
        const string2 = generator.valueToCode(
            block,
            BLOCK_JOIN.args0[1].name,
            javascript.Order.NONE,
        );
        return [
            `String(${string1}) + String(${string2})`,
            javascript.Order.ADDITION,
        ];
    },

    operator_gt: (block, generator) => {
        const operarand1 = generator.valueToCode(
            block,
            BLOCK_GREATER_THAN.args0[0].name,
            javascript.Order.NONE,
        );
        const operarand2 = generator.valueToCode(
            block,
            BLOCK_GREATER_THAN.args0[1].name,
            javascript.Order.NONE,
        );
        const gt = provideComparison(generator, ">");
        return [
            `${gt}(${operarand1}, ${operarand2})`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    operator_lt: (block, generator) => {
        const operarand1 = generator.valueToCode(
            block,
            BLOCK_LESS_THAN.args0[0].name,
            javascript.Order.NONE,
        );
        const operarand2 = generator.valueToCode(
            block,
            BLOCK_LESS_THAN.args0[1].name,
            javascript.Order.NONE,
        );
        const lt = provideComparison(generator, "<");
        return [
            `${lt}(${operarand1}, ${operarand2})`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    operator_equals: (block, generator) => {
        const operarand1 = generator.valueToCode(
            block,
            BLOCK_EQUALS.args0[0].name,
            javascript.Order.NONE,
        );
        const operarand2 = generator.valueToCode(
            block,
            BLOCK_EQUALS.args0[1].name,
            javascript.Order.NONE,
        );
        const eq = provideComparison(generator, "===");
        return [
            `${eq}(${operarand1}, ${operarand2})`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    operator_letter_of: (block, generator) => {
        const letter = generator.valueToCode(
            block,
            BLOCK_LETTER_OF.args0[0].name,
            javascript.Order.SUBTRACTION,
        );
        const string = generator.valueToCode(
            block,
            BLOCK_LETTER_OF.args0[1].name,
            javascript.Order.NONE,
        );
        // 1-based index, fallback to empty string if out of range
        return [
            `String(${string}).charAt(${letter} - 1)`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    operator_contains: (block, generator) => {
        const string1 = generator.valueToCode(
            block,
            BLOCK_CONTAINS.args0[0].name,
            javascript.Order.NONE,
        );
        const string2 = generator.valueToCode(
            block,
            BLOCK_CONTAINS.args0[1].name,
            javascript.Order.NONE,
        );
        return [
            `String(${string1}).includes(${string2})`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    // Extension blocks
    extension_announcement: (block, generator) => {
        const content = generator.valueToCode(
            block,
            BLOCK_ANNOUNCEMENT.args0[1].name,
            javascript.Order.NONE,
        );
        const duration = generator.valueToCode(
            block,
            BLOCK_ANNOUNCEMENT.args0[2].name,
            javascript.Order.NONE,
        );

        return `await ${behave(
            "announce",
            PARAMETER_SIGNAL,
            content,
            duration,
        )}; ${PARAMETER_ITEM_PROXY}.invalidate();`;
    },

    extension_hoot_play: (block, generator) => {
        const track = generator.valueToCode(
            block,
            BLOCK_HOOT.args0[1].name,
            javascript.Order.NONE,
        );

        const playlist = generator.valueToCode(
            block,
            BLOCK_HOOT.args0[2].name,
            javascript.Order.NONE,
        );

        return `await ${behave(
            "hoot",
            PARAMETER_SIGNAL,
            track,
            playlist,
        )}; ${PARAMETER_ITEM_PROXY}.invalidate();`;
    },

    extension_auras_remove: () =>
        `await ${behave(
            "removeAuras",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        )}; ${PARAMETER_ITEM_PROXY}.invalidate();`,

    extension_auras_add: (block, generator) => {
        const size = generator.valueToCode(
            block,
            BLOCK_ADD_AURA.args0[1].name,
            javascript.Order.NONE,
        );
        const color = generator.valueToCode(
            block,
            BLOCK_ADD_AURA.args0[2].name,
            javascript.Order.NONE,
        );
        const style: unknown = block.getFieldValue(
            BLOCK_ADD_AURA.args0[3].name,
        );
        if (typeof style !== "string") {
            throw Error("style should be string");
        }
        return `await ${behave(
            "addAura",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(style),
            color,
            size,
        )}; ${PARAMETER_ITEM_PROXY}.invalidate();`;
    },

    // Utility blocks
    looks_opacity_slider: (block) => {
        // Output the slider value as a stringified number
        const opacity: unknown = block.getFieldValue(
            BLOCK_OPACITY_SLIDER.args0[0].name,
        );
        if (typeof opacity !== "number") {
            throw Error("Opacity should be a number");
        }
        return [opacity.toString(), javascript.Order.ATOMIC];
    },

    behavior_dynamic_val: (block, generator) => {
        const text: unknown = block.getFieldValue(
            BLOCK_DYNAMIC_VAL.args0[0].name,
        );
        if (typeof text !== "string") {
            throw Error("Text should be string");
        }

        // Check if the raw input is a number
        const code =
            text !== "" && /^-?\d*(\.\d+)?$/.exec(text)
                ? text
                : generator.quote_(text);
        return [code, javascript.Order.ATOMIC];
    },

    math_angle: (block) => {
        const angle: unknown = block.getFieldValue(BLOCK_ANGLE.args0[0].name);
        if (typeof angle !== "number") {
            throw Error("Angle should be number");
        }
        return [String(angle), javascript.Order.ATOMIC];
    },

    color_hsv_sliders: (block, generator) => {
        // This block just outputs the color string from the field
        const color: unknown = block.getFieldValue(
            BLOCK_COLOR_PICKER.args0[0].name,
        );
        if (typeof color !== "string" || !isHexColor(color)) {
            throw Error("Colour should be hex color string");
        }
        return [generator.quote_(color), javascript.Order.ATOMIC];
    },

    menu_tag: (block, generator) => {
        const tagId: unknown = block.getFieldValue(FIELD_TAG);
        if (typeof tagId !== "string") {
            throw Error(`Expected tag ID to be a string, got ${typeof tagId}`);
        }
        return [generator.quote_(tagId), javascript.Order.ATOMIC];
    },

    menu_sound: (block, generator) => {
        const soundId: unknown = block.getFieldValue(FIELD_SOUND);
        if (typeof soundId !== "string") {
            throw Error(
                `Expected sound ID to be a string, got ${typeof soundId}`,
            );
        }
        return [generator.quote_(soundId), javascript.Order.ATOMIC];
    },

    menu_layer: (block, generator) => {
        const layer: unknown = block.getFieldValue("LAYER");
        if (typeof layer !== "string") {
            throw Error("layer should be string");
        }
        return [generator.quote_(layer), javascript.Order.ATOMIC];
    },

    menu_item: (block) => {
        // This block just outputs the color string from the field
        const ref = block.getFieldValue(
            BLOCK_ITEM_MENU.args0[0].name,
        ) as (typeof BLOCK_ITEM_MENU)["args0"][0]["options"][number][1];
        switch (ref) {
            case "MYSELF":
                return [PARAMETER_SELF_ID, javascript.Order.ATOMIC];
        }
    },
};

function isHatBlock(block: Blockly.Block): boolean {
    // https://github.com/google/blockly/blob/d1b17d1f900b89ce7fee8d9a631f79dde7bd35ac/core/renderers/common/info.ts#L219
    return (
        block.outputConnection === null &&
        block.previousConnection === null &&
        block.nextConnection !== null
    );
}

export class BehaviorJavascriptGenerator extends javascript.JavascriptGenerator {
    constructor() {
        super();
        this.addReservedWords(
            [
                PARAMETER_SELF_ID,
                PARAMETER_SIGNAL,
                PARAMETER_BEHAVIOR_IMPL,
                PARAMETER_ITEM_PROXY,
                CONSTANT_BEHAVIOR_DEFINITION,
                VAR_LOOP_CHECK,
            ].join(","),
        );

        Object.entries(javascript.javascriptGenerator.forBlock).forEach(
            ([blockType, generator]) => {
                this.forBlock[blockType] = generator;
            },
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
     * Mostly copied from https://github.com/google/blockly/blob/3ccfba9c4b7d3953caec14a3cfc347c0205c9c06/core/generator.ts#L147
     * @returns Code for hat blocks only
     */
    override workspaceToCode = (workspace?: Workspace): string => {
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
}
