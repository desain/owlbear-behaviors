import type { Block, Workspace } from "blockly";
import * as Blockly from "blockly";
import * as javascript from "blockly/javascript";
import { isHexColor, type DistributiveOmit } from "owlbear-utils";
import type { BEHAVIORS_IMPL } from "../behaviors/BehaviorImpl";
import type { BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import type { TriggerHandler } from "../behaviors/TriggerHandler";
import {
    CONSTANT_BEHAVIOR_DEFINITION,
    FIELD_BROADCAST,
    FIELD_SOUND,
    FIELD_TAG,
    INPUT_TAG,
    METADATA_KEY_EFFECT,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_BEHAVIOR_REGISTRY,
    PARAMETER_GLOBALS,
    PARAMETER_ITEM_PROXY,
    PARAMETER_OTHER_ID,
    PARAMETER_SELF_ID,
    PARAMETER_SIGNAL,
    VAR_LOOP_CHECK,
} from "../constants";
import { isGlobal } from "./BehaviorVariableMap";
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
    BLOCK_CONTROL_ITEM_MENU,
    BLOCK_CREATE_CLONE_OF,
    BLOCK_CURRENT_TIME,
    BLOCK_DESELECT,
    BLOCK_DISTANCE_TO,
    BLOCK_DYNAMIC_VAL,
    BLOCK_EQUALS,
    BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_SHEETS_GET,
    BLOCK_EXTENSION_SMOKE_ADD,
    BLOCK_EXTENSION_WEATHER_ADD,
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
    BLOCK_JOIN,
    BLOCK_LAYER_MENU,
    BLOCK_LESS_THAN,
    BLOCK_LETTER_OF,
    BLOCK_LIST_ADD,
    BLOCK_LIST_CLEAR,
    BLOCK_LIST_CONTAINS,
    BLOCK_LIST_DELETE,
    BLOCK_LIST_INDEX,
    BLOCK_LIST_INDEX_OF,
    BLOCK_LIST_INSERT,
    BLOCK_LIST_LENGTH,
    BLOCK_LIST_REPLACE,
    BLOCK_LIST_REPORTER,
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
    BLOCK_SENSING_ITEM_MENU,
    BLOCK_SENSING_OF,
    BLOCK_SET_EFFECT_TO,
    BLOCK_SET_FILL_COLOR,
    BLOCK_SET_FILL_OPACITY,
    BLOCK_SET_LAYER,
    BLOCK_SET_SIZE,
    BLOCK_SET_STROKE_COLOR,
    BLOCK_SET_STROKE_OPACITY,
    BLOCK_SET_TEXT,
    BLOCK_SET_VIEWPORT,
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_STOP,
    BLOCK_TAG,
    BLOCK_TOUCH,
    BLOCK_TOUCHING,
    BLOCK_URL,
    BLOCK_VARIABLE_CHANGE,
    BLOCK_VARIABLE_REPORTER,
    BLOCK_VARIABLE_SETTER,
    BLOCK_WAIT,
    BLOCK_WAIT_UNTIL,
    BLOCK_WHEN_I,
    type CustomBlockType,
} from "./blocks";
import type { ArgumentReporterBlock } from "./procedures/blockArgumentReporter";
import type { CallBlock } from "./procedures/blockCall";
import { isDefineBlock, type DefineBlock } from "./procedures/blockDefine";

const THROW_ON_ABORT = `${PARAMETER_SIGNAL}.throwIfAborted();\n`;

type Generator = (
    block: Block,
    generator: BehaviorJavascriptGenerator,
) => [code: string, precedence: number] | string | null;

function generateBlock(
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

function provideNum(generator: BehaviorJavascriptGenerator): string {
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

function generateVariable(
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

function getStringFieldValue(block: Blockly.Block, name: string): string {
    const value: unknown = block.getFieldValue(name);
    if (typeof value !== "string") {
        throw Error(`${name} should be string`);
    }
    return value;
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
    motion_snap: () =>
        `await ${behave("snapToGrid", PARAMETER_SIGNAL, PARAMETER_SELF_ID)};\n`,
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
        const direction = getStringFieldValue(
            block,
            BLOCK_MOVE_DIRECTION.args0[0].name,
        );
        const amount = generator.valueToCode(
            block,
            BLOCK_MOVE_DIRECTION.args0[1].name,
            javascript.Order.NONE,
        );
        const units = getStringFieldValue(
            block,
            BLOCK_MOVE_DIRECTION.args0[2].name,
        );

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
        `await ${behave("getText", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    looks_set_label: (block, generator) => {
        const text = generator.valueToCode(
            block,
            BLOCK_SET_TEXT.args0[0].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "setText",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            text,
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
        const effect = getStringFieldValue(
            block,
            BLOCK_SET_EFFECT_TO.args0[0].name,
        );

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
        const effect = getStringFieldValue(
            block,
            BLOCK_CHANGE_EFFECT_BY.args0[0].name,
        );

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

    looks_set_viewport: (block, generator) => {
        const target = getStringFieldValue(
            block,
            BLOCK_SET_VIEWPORT.args0[0].name,
        );
        const x = generator.valueToCode(
            block,
            BLOCK_SET_VIEWPORT.args0[1].name,
            javascript.Order.NONE,
        );
        const y = generator.valueToCode(
            block,
            BLOCK_SET_VIEWPORT.args0[2].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "setViewport",
            PARAMETER_SIGNAL,
            generator.quote_(target),
            x,
            y,
        )};\n`;
    },

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
        const broadcastId = getStringFieldValue(block, FIELD_BROADCAST);
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

    control_start_as_clone: (block, generator) =>
        `${CONSTANT_BEHAVIOR_DEFINITION}.startAsClone.push(${getHatBlockBehaviorFunction(
            block,
            generator,
        )});\n`,

    event_whenbroadcastreceived: (block, generator) => {
        const broadcastId = getStringFieldValue(block, FIELD_BROADCAST);
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
                    newValue: "ANY",
                    behaviorFunction,
                });
            case "rotation":
                return generateAddTriggerHandler({
                    type: "rotation",
                    newValue: "ANY",
                    behaviorFunction,
                });
            case "layer":
                return generateAddTriggerHandler({
                    type: "layer",
                    newValue: "ANY",
                    behaviorFunction,
                });
            case "locked:true":
                return generateAddTriggerHandler({
                    type: "locked",
                    newValue: { exactly: true },
                    behaviorFunction,
                });
            case "locked:false":
                return generateAddTriggerHandler({
                    type: "locked",
                    newValue: { exactly: false },
                    behaviorFunction,
                });
            case "visible:true": {
                return generateAddTriggerHandler({
                    type: "visible",
                    newValue: { exactly: true },
                    behaviorFunction,
                });
            }
            case "visible:false": {
                return generateAddTriggerHandler({
                    type: "visible",
                    newValue: { exactly: false },
                    behaviorFunction,
                });
            }
            case "attachedTo:defined": {
                return generateAddTriggerHandler({
                    type: "attachedTo",
                    newValue: "DEFINED",
                    behaviorFunction,
                });
            }
            case "attachedTo:undefined": {
                return generateAddTriggerHandler({
                    type: "attachedTo",
                    newValue: { exactly: undefined },
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
        const touchState = getStringFieldValue(
            block,
            BLOCK_TOUCH.args0[0].name,
        );

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

    control_behavior_stop: (block) => {
        const target = getStringFieldValue(
            block,
            BLOCK_STOP.args0[0].name,
        ) as (typeof BLOCK_STOP)["args0"][0]["options"][number][1];
        switch (target) {
            case "THIS_SCRIPT":
                return "return;\n";
            case "ALL":
                return [
                    `${PARAMETER_BEHAVIOR_REGISTRY}.${
                        "stopAll" satisfies keyof BehaviorRegistry
                    }();`,
                    "return;\n",
                ].join("\n");
            // case "OTHER_SCRIPTS": {
            //     return `${PARAMETER_BEHAVIOR_REGISTRY}.stopBehaviorsForItem(${PARAMETER_SELF_ID}, ${PARAMETER_HAT_ID});\n`;
            // }
        }
    },

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
        const [countVar, initCountVar] = generateVariable(
            generator,
            "count",
            "0",
            true,
        );
        const times = generator.valueToCode(
            block,
            BLOCK_REPEAT.args0[0].name,
            javascript.Order.RELATIONAL,
        );
        let prefix = "";
        let max = times;
        if (!/\d+/.exec(times)) {
            const [maxVar, initMaxVar] = generateVariable(
                generator,
                "repeat_end",
                `${provideNum(generator)}(${times})`,
            );
            max = maxVar;
            prefix = initMaxVar + "\n";
        }
        const statements = generator.statementToCode(
            block,
            BLOCK_REPEAT.args1[0].name,
        );
        return `${prefix}for (${initCountVar}; ${countVar} < ${max}; ${countVar}++) {\n${generator.addLoopTrap(
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

    control_create_clone_of: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_CREATE_CLONE_OF.args0[0].name,
            javascript.Order.NONE,
        );
        return `await ${behave("clone", PARAMETER_SIGNAL, item)};\n`;
    },

    control_delete_this: () =>
        `await ${behave(
            "delete",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        )};\nreturn;\n`,

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

    sensing_of: (block, generator) => {
        const property = block.getFieldValue(
            BLOCK_SENSING_OF.args0[0].name,
        ) as (typeof BLOCK_SENSING_OF)["args0"][0]["options"][number][1];
        const item =
            generator.valueToCode(
                block,
                BLOCK_SENSING_OF.args0[1].name,
                javascript.Order.NONE,
            ) || "undefined";

        switch (property) {
            case "X_POSITION":
                return [
                    `(await ${PARAMETER_ITEM_PROXY}.get(${item}))?.position?.x ?? 0`,
                    javascript.Order.LOGICAL_OR,
                ];
            case "Y_POSITION":
                return [
                    `(await ${PARAMETER_ITEM_PROXY}.get(${item}))?.position?.y ?? 0`,
                    javascript.Order.LOGICAL_OR,
                ];
            case "ROTATION":
                return [
                    `(await ${PARAMETER_ITEM_PROXY}.get(${item}))?.rotation ?? 0`,
                    javascript.Order.LOGICAL_OR,
                ];
        }
    },

    sensing_current_time: (block) => {
        const unit = block.getFieldValue(
            BLOCK_CURRENT_TIME.args0[0].name,
        ) as (typeof BLOCK_CURRENT_TIME)["args0"][0]["options"][number][1];

        switch (unit) {
            case "YEAR":
                return ["new Date().getFullYear()", javascript.Order.MEMBER];
            case "MONTH":
                return ["new Date().getMonth() + 1", javascript.Order.ADDITION];
            case "DATE":
                return ["new Date().getDate()", javascript.Order.MEMBER];
            case "DAY_OF_WEEK":
                return ["new Date().getDay() + 1", javascript.Order.ADDITION];
            case "HOUR":
                return ["new Date().getHours()", javascript.Order.MEMBER];
            case "MINUTE":
                return ["new Date().getMinutes()", javascript.Order.MEMBER];
            case "SECOND":
                return ["new Date().getSeconds()", javascript.Order.MEMBER];
        }
    },

    sensing_distanceto: (block, generator) => {
        const item =
            generator.valueToCode(
                block,
                BLOCK_DISTANCE_TO.args0[0].name,
                javascript.Order.NONE,
            ) || "undefined";
        return [
            `await ${behave(
                "distanceTo",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                item,
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    sensing_touchingobject: (block, generator) => {
        const item =
            generator.valueToCode(
                block,
                BLOCK_TOUCHING.args0[0].name,
                javascript.Order.NONE,
            ) || "undefined";
        return [
            `await ${behave(
                "touching",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                item,
            )}`,
            javascript.Order.AWAIT,
        ];
    },

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
            `String(${string}).charAt(${provideNum(generator)}(${letter}) - 1)`,
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

    // Variable blocks
    data_variable: (block, generator) => {
        const varId = getStringFieldValue(
            block,
            BLOCK_VARIABLE_REPORTER.args0[0].name,
        );
        // MEMBER since it could be a globals[id] access
        return [generator.getVariableReference(varId), javascript.Order.MEMBER];
    },

    data_setvariableto: (block, generator) => {
        const varId = getStringFieldValue(
            block,
            BLOCK_VARIABLE_SETTER.args0[0].name,
        );
        const value = generator.valueToCode(
            block,
            BLOCK_VARIABLE_SETTER.args0[1].name,
            javascript.Order.ASSIGNMENT,
        );
        return `${generator.getVariableReference(varId)} = ${value};\n`;
    },

    data_changevariableby: (block, generator) => {
        const varRef = generator.getVariableReference(
            getStringFieldValue(block, BLOCK_VARIABLE_CHANGE.args0[0].name),
        );
        const delta = generator.valueToCode(
            block,
            BLOCK_VARIABLE_CHANGE.args0[1].name,
            javascript.Order.NONE,
        );
        const num = provideNum(generator);
        return `${varRef} = ${num}(${varRef}) + ${num}(${delta});\n`;
    },

    data_listcontents: (block, generator) => {
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_REPORTER.args0[0].name,
        );
        return [
            `${generator.getVariableReference(varId)}?.join(" ")`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    data_addtolist: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_LIST_ADD.args0[0].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(block, BLOCK_LIST_ADD.args0[1].name);
        const listRef = generator.getVariableReference(varId);
        return `(${listRef} ??= []).push(${item});\n`;
    },

    data_deleteoflist: (block, generator) => {
        const index = generator.valueToCode(
            block,
            BLOCK_LIST_DELETE.args0[0].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_DELETE.args0[1].name,
        );
        const listRef = generator.getVariableReference(varId);
        const num = provideNum(generator);
        return `${listRef}?.splice(${num}(${index}) - 1, 1);\n`;
    },

    data_deletealloflist: (block, generator) => {
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_CLEAR.args0[0].name,
        );
        const listRef = generator.getVariableReference(varId);
        return `${listRef} = [];\n`;
    },

    data_insertatlist: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_LIST_INSERT.args0[0].name,
            javascript.Order.NONE,
        );
        const index = generator.valueToCode(
            block,
            BLOCK_LIST_INSERT.args0[1].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_INSERT.args0[2].name,
        );
        const listRef = generator.getVariableReference(varId);
        const num = provideNum(generator);
        return [
            `(${listRef} ??= []).splice(${num}(${index}) - 1, 0, ${item});\n`,
        ].join("\n");
    },

    data_replaceitemoflist: (block, generator) => {
        const index = generator.valueToCode(
            block,
            BLOCK_LIST_REPLACE.args0[0].name,
            javascript.Order.NONE,
        );
        const item = generator.valueToCode(
            block,
            BLOCK_LIST_REPLACE.args0[2].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_REPLACE.args0[1].name,
        );
        const listRef = generator.getVariableReference(varId);
        const num = provideNum(generator);
        return `${listRef}?.splice(${num}(${index}) - 1, 1, ${item});\n`;
    },

    data_itemoflist: (block, generator) => {
        const index = generator.valueToCode(
            block,
            BLOCK_LIST_INDEX.args0[0].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_INDEX.args0[1].name,
        );
        const listRef = generator.getVariableReference(varId);
        const num = provideNum(generator);
        return [`${listRef}?.[${num}(${index}) - 1]`, javascript.Order.MEMBER];
    },

    data_itemnumoflist: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_LIST_INDEX_OF.args0[0].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_INDEX_OF.args0[1].name,
        );
        const listRef = generator.getVariableReference(varId);
        return [
            `(${listRef} ?? []).map(String).indexOf(String(${item})) + 1`,
            javascript.Order.ADDITION,
        ];
    },

    data_lengthoflist: (block, generator) => {
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_LENGTH.args0[0].name,
        );
        const listRef = generator.getVariableReference(varId);
        return [`(${listRef} ?? []).length`, javascript.Order.MEMBER];
    },

    data_listcontainsitem: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_LIST_CONTAINS.args0[1].name,
            javascript.Order.NONE,
        );
        const varId = getStringFieldValue(
            block,
            BLOCK_LIST_CONTAINS.args0[0].name,
        );
        const listRef = generator.getVariableReference(varId);
        return [
            `(${listRef} ?? []).map(String).includes(String(${item}))`,
            javascript.Order.FUNCTION_CALL,
        ];
    },

    // My blocks
    define: (block, generator) => {
        const model = (block as DefineBlock).getProcedureModel();
        const name = generator.getProcedureName(model.getName());

        const nextBlock = block.getNextBlock();
        const statementsResult = nextBlock
            ? generator.blockToCode(nextBlock)
            : "";
        const statementsCode =
            typeof statementsResult === "string"
                ? statementsResult
                : statementsResult[0];

        return generateBlock(
            generator,
            `async function ${name}(${PARAMETER_SIGNAL}, ${PARAMETER_OTHER_ID}, ${VAR_LOOP_CHECK}, ${model
                .getParameters()
                .filter((p) => p.getTypes().length)
                .map((p) => p.getId())
                .join(", ")})`,
            [statementsCode, `return ${VAR_LOOP_CHECK};`].join("\n"),
        );
    },

    call: (block, generator) => {
        const args = block.inputList
            .filter((input) => input.connection?.getCheck()?.length)
            .map(
                (input) =>
                    generator.valueToCode(
                        block,
                        input.name,
                        javascript.Order.NONE,
                    ) || "undefined",
            );
        const model = (block as CallBlock).getProcedureModel();
        const name = generator.getProcedureName(model.getName());
        return `${VAR_LOOP_CHECK} = await ${name}(${PARAMETER_SIGNAL}, ${PARAMETER_OTHER_ID}, ${VAR_LOOP_CHECK}, ${args.join(
            ", ",
        )});\n`;
    },

    argument_reporter: (block) => {
        const argumentReporter = block as ArgumentReporterBlock;
        const model = argumentReporter.getProcedureModel();
        const param = model
            .getParameters()
            .find((p) => p.getId() === argumentReporter.parameterId);
        if (!param) {
            throw Error("missing parameter");
        }

        // Argument reporters only have values inside the definition of their
        // procedures - if used outside this context, they'll be undefined
        const rootBlock = block.getRootBlock();
        const insideProcedureDefinition =
            isDefineBlock(rootBlock) && rootBlock.getProcedureModel() === model;

        return [
            insideProcedureDefinition ? param.getId() : "undefined",
            javascript.Order.ATOMIC,
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
        const style = getStringFieldValue(block, BLOCK_ADD_AURA.args0[3].name);
        return `await ${behave(
            "addAura",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(style),
            color,
            size,
        )}; ${PARAMETER_ITEM_PROXY}.invalidate();`;
    },

    extension_fog_lit: () => [
        `await ${behave("hasLight", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_fog_add: (block, generator) => {
        const radius = generator.valueToCode(
            block,
            BLOCK_EXTENSION_FOG_ADD.args0[1].name,
            javascript.Order.NONE,
        );
        const shape = getStringFieldValue(
            block,
            BLOCK_EXTENSION_FOG_ADD.args0[2].name,
        );
        return `await ${behave(
            "addLight",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            radius,
            generator.quote_(shape),
        )};\n`;
    },

    extension_fog_remove: () =>
        `await ${behave("removeLight", PARAMETER_SIGNAL, PARAMETER_SELF_ID)};`,
    extension_smoke_vision: () => [
        `await ${behave("hasVision", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],
    extension_smoke_add: (block, generator) => {
        const radius = generator.valueToCode(
            block,
            BLOCK_EXTENSION_SMOKE_ADD.args0[1].name,
            javascript.Order.NONE,
        );
        const shape = getStringFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_ADD.args0[2].name,
        );
        return `await ${behave(
            "addVision",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            radius,
            generator.quote_(shape),
        )};\n`;
    },
    extension_smoke_remove: () =>
        `await ${behave(
            "disableVision",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        )};`,

    extension_weather_add: (block, generator) => {
        const direction = getStringFieldValue(
            block,
            BLOCK_EXTENSION_WEATHER_ADD.args0[1].name,
        );
        const speed = getStringFieldValue(
            block,
            BLOCK_EXTENSION_WEATHER_ADD.args0[2].name,
        );
        const density = getStringFieldValue(
            block,
            BLOCK_EXTENSION_WEATHER_ADD.args0[3].name,
        );
        const type = getStringFieldValue(
            block,
            BLOCK_EXTENSION_WEATHER_ADD.args0[4].name,
        );

        return `await ${behave(
            "addWeather",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(type),
            generator.quote_(direction),
            speed,
            density,
        )};\n`;
    },

    extension_weather_remove: () =>
        `await ${behave(
            "removeWeather",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        )};\n`,

    extension_weather_has: () => [
        `await ${behave("hasWeather", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_grimoire_hp: () => [
        `await ${behave("getHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_grimoire_max_hp: () => [
        `await ${behave("getMaxHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_grimoire_temp_hp: () => [
        `await ${behave("getTempHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_grimoire_ac: () => [
        `await ${behave("getArmorClass", PARAMETER_SIGNAL, PARAMETER_SELF_ID)}`,
        javascript.Order.AWAIT,
    ],

    extension_grimoire_hp_change: (block, generator) => {
        const behaviorFunction = getHatBlockBehaviorFunction(block, generator);
        return generateAddTriggerHandler({
            type: "grimoire_hp_change",
            behaviorFunction,
        });
    },

    extension_rumble_say: (block, generator) => {
        const message = generator.valueToCode(
            block,
            BLOCK_EXTENSION_RUMBLE_SAY.args0[1].name,
            javascript.Order.NONE,
        );
        const toSelf: unknown = block.getFieldValue(
            BLOCK_EXTENSION_RUMBLE_SAY.args0[2].name,
        );
        return `await ${behave(
            "rumbleSay",
            PARAMETER_SIGNAL,
            message,
            String(toSelf === "true"),
        )};\n`;
    },

    extension_rumble_roll: (block, generator) => {
        const notation = generator.valueToCode(
            block,
            BLOCK_EXTENSION_RUMBLE_ROLL.args0[1].name,
            javascript.Order.NONE,
        );
        return `await ${behave("rumbleRoll", PARAMETER_SIGNAL, notation)};\n`;
    },

    extension_daggerheart_stat: (block, generator) => {
        const statName = getStringFieldValue(
            block,
            BLOCK_EXTENSION_DAGGERHEART_STAT.args0[1].name,
        );
        return [
            `await ${behave(
                "getDaggerheartStat",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                generator.quote_(statName),
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    extension_daggerheart_fear: () => [
        `await ${behave("getDaggerheartFear", PARAMETER_SIGNAL)}`,
        javascript.Order.AWAIT,
    ],

    extension_owl_trackers_field: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_FIELD.args0[1].name,
            javascript.Order.ATOMIC,
        );
        return [
            `await ${behave(
                "getOwlTrackersField",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                String(fieldName),
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    extension_owl_trackers_checkbox: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX.args0[1].name,
            javascript.Order.ATOMIC,
        );
        return [
            `await ${behave(
                "isOwlTrackersFieldChecked",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                String(fieldName),
            )}`,
            javascript.Order.AWAIT,
        ];
    },

    extension_owl_trackers_set_field: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD.args0[1].name,
            javascript.Order.NONE,
        );
        const value = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD.args0[2].name,
            javascript.Order.NONE,
        );
        return `await ${behave(
            "setOwlTrackersField",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            fieldName,
            value,
        )};\n`;
    },

    extension_owl_trackers_set_checkbox: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.args0[1].name,
            javascript.Order.NONE,
        );
        const checked =
            generator.valueToCode(
                block,
                BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.args0[2].name,
                javascript.Order.NONE,
            ) || "false";
        return `await ${behave(
            "setOwlTrackersCheckbox",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            fieldName,
            checked,
        )};\n`;
    },

    extension_codeo_run: (block, generator) => {
        const scriptName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_CODEO_RUN_SCRIPT.args0[1].name,
            javascript.Order.NONE,
        );
        return `await ${behave("runScript", PARAMETER_SIGNAL, scriptName)};\n`;
    },

    extension_sheets_get: (block, generator) => {
        const cell = generator.valueToCode(
            block,
            BLOCK_EXTENSION_SHEETS_GET.args0[1].name,
            javascript.Order.NONE,
        );
        const sheet = generator.valueToCode(
            block,
            BLOCK_EXTENSION_SHEETS_GET.args0[2].name,
            javascript.Order.NONE,
        );
        const spreadsheetId = generator.valueToCode(
            block,
            BLOCK_EXTENSION_SHEETS_GET.args0[3].name,
            javascript.Order.NONE,
        );
        return [
            `await ${behave(
                "getSheetsValue",
                PARAMETER_SIGNAL,
                cell,
                sheet,
                spreadsheetId,
            )}`,
            javascript.Order.AWAIT,
        ];
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
        const text = getStringFieldValue(
            block,
            BLOCK_DYNAMIC_VAL.args0[0].name,
        );

        // Check if the raw input is a number
        const code =
            text !== "" && /^-?\d*(\.\d+)?$/.exec(text)
                ? text
                : generator.multiline_quote_(text);
        return [code, javascript.Order.ATOMIC];
    },

    behavior_url: (block, generator) => {
        const url = getStringFieldValue(block, BLOCK_URL.args0[0].name);
        return [generator.quote_(url), javascript.Order.ATOMIC];
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
        const color = getStringFieldValue(
            block,
            BLOCK_COLOR_PICKER.args0[0].name,
        );
        if (!isHexColor(color)) {
            throw Error("Color should be hex color");
        }
        return [generator.quote_(color), javascript.Order.ATOMIC];
    },

    menu_tag: (block, generator) => {
        const tagId = getStringFieldValue(block, FIELD_TAG);
        return [generator.quote_(tagId), javascript.Order.ATOMIC];
    },

    menu_sound: (block, generator) => {
        const soundId = getStringFieldValue(block, FIELD_SOUND);
        return [generator.quote_(soundId), javascript.Order.ATOMIC];
    },

    menu_layer: (block, generator) => {
        const layer = getStringFieldValue(
            block,
            BLOCK_LAYER_MENU.args0[0].name,
        );
        return [generator.quote_(layer), javascript.Order.ATOMIC];
    },

    menu_item: (block) => {
        const ref = block.getFieldValue(
            BLOCK_SENSING_ITEM_MENU.args0[0].name,
        ) as (typeof BLOCK_SENSING_ITEM_MENU)["args0"][0]["options"][number][1];
        switch (ref) {
            case "MYSELF":
                return [PARAMETER_SELF_ID, javascript.Order.ATOMIC];
        }
    },
    control_menu_item: (block) => {
        const ref = block.getFieldValue(
            BLOCK_CONTROL_ITEM_MENU.args0[0].name,
        ) as (typeof BLOCK_CONTROL_ITEM_MENU)["args0"][0]["options"][number][1];
        switch (ref) {
            case "MYSELF":
                return [PARAMETER_SELF_ID, javascript.Order.ATOMIC];
        }
    },

    // Non-codegen blocks
    procedures_declaration: (block) => {
        throw Error(`${block.type} should not be used for codegen`);
    },
    argument_editor_string_number: (block) => {
        throw Error(`${block.type} should not be used for codegen`);
    },
    argument_editor_boolean: (block) => {
        throw Error(`${block.type} should not be used for codegen`);
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
                CONSTANT_BEHAVIOR_DEFINITION,
                VAR_LOOP_CHECK,
            ].join(","),
        );

        Object.entries(javascript.javascriptGenerator.forBlock).forEach(
            ([blockType, generator]) =>
                (this.forBlock[blockType] = generator as unknown as Generator),
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
}
