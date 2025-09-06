import type { Block } from "blockly";
import * as javascript from "blockly/javascript";
import { isHexColor } from "owlbear-utils";
import type { BEHAVIORS_IMPL } from "../../behaviors/BehaviorImpl";
import type { BehaviorRegistry } from "../../behaviors/BehaviorRegistry";
import {
    FIELD_BROADCAST,
    FIELD_SOUND,
    FIELD_TAG,
    INPUT_TAG,
    METADATA_KEY_EFFECT,
    PARAMETER_BEHAVIOR_REGISTRY,
    PARAMETER_HAT_ID,
    PARAMETER_ITEM_PROXY,
    PARAMETER_OTHER_ID,
    PARAMETER_SELF_ID,
    PARAMETER_SIGNAL,
    VAR_LOOP_CHECK,
    VAR_VOLUME,
} from "../../constants";
import {
    BLOCK_ADD_AURA,
    BLOCK_ADD_AURA_PRESET,
    BLOCK_ANGLE,
    BLOCK_ANNOUNCEMENT,
    BLOCK_ATTACH,
    BLOCK_BROADCAST,
    BLOCK_CENTER_VIEW,
    BLOCK_CENTER_ZOOM,
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
    BLOCK_EXTENSION_BONES_ON_ROLL,
    BLOCK_EXTENSION_BONES_ROLL_DICE,
    BLOCK_EXTENSION_CHARACTER_DISTANCES_SET_HEIGHT,
    BLOCK_EXTENSION_CLASH_PROPERTY,
    BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_SHOW_ON_MAP,
    BLOCK_EXTENSION_PEEKABOO_SET_SOLIDITY,
    BLOCK_EXTENSION_PHASE_CHANGE,
    BLOCK_EXTENSION_PRETTY_SET_INITIATIVE,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_SHEETS_GET,
    BLOCK_EXTENSION_SMOKE_ADD,
    BLOCK_EXTENSION_SMOKE_BLIND,
    BLOCK_EXTENSION_SMOKE_DOOR,
    BLOCK_EXTENSION_SMOKE_SWAP,
    BLOCK_EXTENSION_SMOKE_VISION_LINE,
    BLOCK_EXTENSION_SMOKE_WHEN_DOOR,
    BLOCK_EXTENSION_SMOKE_WINDOW,
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
    BLOCK_MATCH,
    BLOCK_MOVE_DIRECTION,
    BLOCK_OPACITY_SLIDER,
    BLOCK_PATHFIND,
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
    BLOCK_SET_ACCESSIBILITY_DESCRIPTION,
    BLOCK_SET_ACCESSIBILITY_NAME,
    BLOCK_SET_EFFECT_TO,
    BLOCK_SET_FILL_COLOR,
    BLOCK_SET_FILL_OPACITY,
    BLOCK_SET_LAYER,
    BLOCK_SET_SIZE,
    BLOCK_SET_STROKE_COLOR,
    BLOCK_SET_STROKE_OPACITY,
    BLOCK_SET_TEXT,
    BLOCK_SOUND_CHANGE_VOLUME_BY,
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_SOUND_SET_VOLUME_TO,
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
    BLOCK_WHEN_PRETTY_TURN_CHANGE,
    BLOCK_ZOOM,
    type CustomBlockType,
} from "../blocks";
import { getCaseInputs, getCaseName } from "../mutatorMatch";
import type { ArgumentReporterBlock } from "../procedures/blockArgumentReporter";
import type { CallBlock } from "../procedures/blockCall";
import { type DefineBlock, isDefineBlock } from "../procedures/blockDefine";
import type { BehaviorJavascriptGenerator } from "./BehaviorJavascriptGenerator";
import {
    awaitBehaveStatement,
    awaitBehaveValue,
    behave,
    generateAddTriggerHandler,
    generateBlock,
    generateSelfUpdate,
    generateVariable,
    getDropdownFieldValue,
    getNumberFieldValue,
    getStringFieldValue,
    noCodegen,
    provideComparison,
    provideNum,
} from "./codegenUtils";

const THROW_ON_ABORT = `${PARAMETER_SIGNAL}.throwIfAborted();\n`;

export type CodeGenerator = (
    block: Block,
    generator: BehaviorJavascriptGenerator,
) => [code: string, precedence: number] | string | null;

/**
 * Access self, only awaiting if necessary.
 */
const SELF = `(await ${PARAMETER_ITEM_PROXY}.get(${PARAMETER_SELF_ID}))`;

const variableBlock: CodeGenerator = (
    block: Block,
    generator: BehaviorJavascriptGenerator,
) => {
    const varId = getStringFieldValue(
        block,
        BLOCK_VARIABLE_REPORTER.args0[0].name,
    );
    // MEMBER since it could be a globals[id] access
    return [generator.getVariableReference(varId), javascript.Order.MEMBER];
};

const variableSetBlock: CodeGenerator = (
    block: Block,
    generator: BehaviorJavascriptGenerator,
) => {
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
};

const variableChangeBlock: CodeGenerator = (
    block: Block,
    generator: BehaviorJavascriptGenerator,
) => {
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
};

type OverriddenBlockType =
    | "math_arithmetic"
    | "variables_get_dynamic"
    | "variables_set_dynamic"
    | "math_change";

export const GENERATORS: Record<
    CustomBlockType | OverriddenBlockType,
    CodeGenerator
> = {
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
        return awaitBehaveStatement(
            "goto",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            x,
            y,
        );
    },

    motion_snap: () =>
        awaitBehaveStatement("snapToGrid", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    motion_path: (block, generator) => {
        const dist = generator.valueToCode(
            block,
            BLOCK_PATHFIND.args0[0].name,
            javascript.Order.NONE,
        );
        const target = generator.valueToCode(
            block,
            BLOCK_PATHFIND.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "pathfind",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            dist,
            target,
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
        return `${VAR_LOOP_CHECK} = ${awaitBehaveStatement(
            "glide",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            x,
            y,
        )}`;
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
        return `${VAR_LOOP_CHECK} = ${awaitBehaveStatement(
            "glideRotate",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            "-" + degrees,
        )}`;
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
        return `${VAR_LOOP_CHECK} = ${awaitBehaveStatement(
            "glideRotate",
            PARAMETER_SIGNAL,
            VAR_LOOP_CHECK,
            PARAMETER_SELF_ID,
            duration,
            degrees,
        )}`;
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
        const item = generator.valueToCode(
            block,
            BLOCK_ATTACH.args0[0].name,
            javascript.Order.MEMBER,
        );
        const [newParent, initNewParent] = generateVariable(
            generator,
            "newParent",
            item,
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
            javascript.Order.ASSIGNMENT,
        );
        const [degreesVar, initDegreesVar] = generateVariable(
            generator,
            "degrees",
            degrees,
        );
        return [
            initDegreesVar,
            generateSelfUpdate(
                generator,
                `self.rotation -= ${provideNum(generator)}(${degreesVar});`,
            ),
        ].join("\n");
    },
    motion_turnright: (block, generator) => {
        const degrees = generator.valueToCode(
            block,
            BLOCK_ROTATE_RIGHT.args0[1].name,
            javascript.Order.ASSIGNMENT,
        );
        const [degreesVar, initDegreesVar] = generateVariable(
            generator,
            "degrees",
            degrees,
        );
        return [
            initDegreesVar,
            generateSelfUpdate(
                generator,
                `self.rotation += ${provideNum(generator)}(${degreesVar});`,
            ),
        ].join("\n");
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
        const target = generator.valueToCode(
            block,
            BLOCK_FACE.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "face",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            target,
        );
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

        return awaitBehaveStatement(
            "say",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            message,
            secs,
        );
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
        return awaitBehaveStatement(
            "setSize",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            size,
        );
    },

    looks_changesizeby: (block, generator) => {
        const delta = generator.valueToCode(
            block,
            BLOCK_CHANGE_SIZE.args0[0].name,
            javascript.Order.ATOMIC,
        );

        return awaitBehaveStatement(
            "changeSize",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            delta,
        );
    },

    looks_size: () => [
        `100 * Math.max(${SELF}.scale.x, ${SELF}.scale.y)`,
        javascript.Order.MULTIPLICATION,
    ],

    looks_replace_image: (block) => {
        const data = JSON.stringify(
            block.getFieldValue(BLOCK_REPLACE_IMAGE.args0[0].name),
        );
        return awaitBehaveStatement(
            "replaceImage",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            data,
        );
    },

    looks_get_label: () =>
        awaitBehaveValue("getText", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    looks_set_label: (block, generator) => {
        const text = generator.valueToCode(
            block,
            BLOCK_SET_TEXT.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setText",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            text,
        );
    },

    looks_get_name: () =>
        awaitBehaveValue(
            "getAccessibilityName",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),

    looks_set_name: (block, generator) => {
        const name = generator.valueToCode(
            block,
            BLOCK_SET_ACCESSIBILITY_NAME.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setAccessibilityName",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            name,
        );
    },

    looks_get_description: () =>
        awaitBehaveValue(
            "getAccessibilityDescription",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),

    looks_set_description: (block, generator) => {
        const description = generator.valueToCode(
            block,
            BLOCK_SET_ACCESSIBILITY_DESCRIPTION.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setAccessibilityDescription",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            description,
        );
    },

    looks_get_layer: () => [`${SELF}.layer`, javascript.Order.MEMBER],
    looks_set_layer: (block, generator) => {
        const layer = generator.valueToCode(
            block,
            BLOCK_SET_LAYER.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setLayer",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            layer,
        );
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
        return [
            initColor,
            generateSelfUpdate(
                generator,
                generateBlock(
                    generator,
                    `if (${behave(
                        "isHexColor",
                        colorVar,
                    )} && self?.style?.strokeColor)`,
                    `self.style.strokeColor = ${colorVar};`,
                ),
            ),
        ].join("\n");
    },

    looks_set_stroke_opacity: (block, generator) => {
        const opacity = generator.valueToCode(
            block,
            BLOCK_SET_STROKE_OPACITY.args0[0].name,
            javascript.Order.ASSIGNMENT,
        );
        const [opacityVar, initOpacityVar] = generateVariable(
            generator,
            "opacity",
            opacity,
        );
        return [
            initOpacityVar,
            generateSelfUpdate(
                generator,
                generateBlock(
                    generator,
                    "if (self?.style && 'strokeOpacity' in self.style)",
                    `self.style.strokeOpacity = Math.max(0, Math.min(100, ${provideNum(
                        generator,
                    )}(${opacityVar}))) / 100`,
                ),
            ),
        ].join("\n");
    },

    looks_set_fill_color: (block, generator) => {
        const color = generator.valueToCode(
            block,
            BLOCK_SET_FILL_COLOR.args0[0].name,
            javascript.Order.ASSIGNMENT,
        );
        const [colorVar, initColorVar] = generateVariable(
            generator,
            "fillColor",
            `String(${color})`,
        );
        return [
            initColorVar,
            generateSelfUpdate(
                generator,
                generateBlock(
                    generator,
                    `if (${behave(
                        "isHexColor",
                        colorVar,
                    )} && self?.style?.fillColor)`,
                    `self.style.fillColor = ${colorVar};`,
                ),
            ),
        ].join("\n");
    },

    looks_set_fill_opacity: (block, generator) => {
        const opacity = generator.valueToCode(
            block,
            BLOCK_SET_FILL_OPACITY.args0[0].name,
            javascript.Order.ATOMIC,
        );
        const [opacityVar, initOpacityVar] = generateVariable(
            generator,
            "opacity",
            opacity,
        );
        return [
            initOpacityVar,
            generateSelfUpdate(
                generator,
                generateBlock(
                    generator,
                    "if (self?.style && 'fillOpacity' in self.style)",
                    `self.style.fillOpacity = Math.max(0, Math.min(100, ${provideNum(
                        generator,
                    )}(${opacityVar}))) / 100`,
                ),
            ),
        ].join("\n");
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

        return awaitBehaveStatement(
            "setEffect",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(effect),
            intensity,
            "false",
        );
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

        return awaitBehaveStatement(
            "setEffect",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(effect),
            intensity,
            "true",
        );
    },

    looks_cleargraphiceffects: (_block, generator) =>
        generateSelfUpdate(
            generator,
            `delete self.metadata["${METADATA_KEY_EFFECT}"];`,
        ),

    looks_set_viewport: (block, generator) => {
        const target = getDropdownFieldValue(block, BLOCK_CENTER_VIEW, 0);
        const x = generator.valueToCode(
            block,
            BLOCK_CENTER_VIEW.args0[1].name,
            javascript.Order.NONE,
        );
        const y = generator.valueToCode(
            block,
            BLOCK_CENTER_VIEW.args0[2].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setViewport",
            PARAMETER_SIGNAL,
            generator.quote_(target),
            "undefined",
            x,
            y,
        );
    },

    looks_set_zoom: (block, generator) => {
        const target = getDropdownFieldValue(block, BLOCK_ZOOM, 0);
        const zoom = generator.valueToCode(
            block,
            BLOCK_ZOOM.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setViewport",
            PARAMETER_SIGNAL,
            generator.quote_(target),
            zoom,
            "undefined",
            "undefined",
        );
    },

    looks_zoom_center: (block, generator) => {
        const target = getDropdownFieldValue(block, BLOCK_CENTER_ZOOM, 0);
        const zoom = generator.valueToCode(
            block,
            BLOCK_CENTER_ZOOM.args0[1].name,
            javascript.Order.NONE,
        );
        const x = generator.valueToCode(
            block,
            BLOCK_CENTER_ZOOM.args0[3].name,
            javascript.Order.NONE,
        );
        const y = generator.valueToCode(
            block,
            BLOCK_CENTER_ZOOM.args0[4].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setViewport",
            PARAMETER_SIGNAL,
            generator.quote_(target),
            zoom,
            x,
            y,
        );
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
            generator.getDeveloperVariableName(VAR_VOLUME),
        )};\n`;
    },

    sound_playuntildone: (block, generator) => {
        const sound = generator.valueToCode(
            block,
            BLOCK_SOUND_PLAY_UNTIL_DONE.args0[0].name,
            javascript.Order.NONE,
        );
        return (
            awaitBehaveStatement(
                "playSoundUntilDone",
                PARAMETER_SIGNAL,
                sound,
                generator.getDeveloperVariableName(VAR_VOLUME),
            ) + `${PARAMETER_ITEM_PROXY}.invalidate();\n`
        );
    },

    sound_stopallsounds: () =>
        behave("stopAllSounds", PARAMETER_SIGNAL) + ";\n",

    sound_setvolumeto: (block, generator) => {
        const value = generator.valueToCode(
            block,
            BLOCK_SOUND_SET_VOLUME_TO.args0[0].name,
            javascript.Order.ASSIGNMENT,
        );
        return `${generator.getDeveloperVariableName(
            VAR_VOLUME,
        )} = ${value};\n`;
    },

    sound_changevolumeby: (block, generator) => {
        const value = generator.valueToCode(
            block,
            BLOCK_SOUND_CHANGE_VOLUME_BY.args0[0].name,
            javascript.Order.NONE,
        );
        const num = provideNum(generator);
        const volumeVar = generator.getDeveloperVariableName(VAR_VOLUME);
        return `${volumeVar} = ${num}(${volumeVar}) + ${num}(${value});\n`;
    },

    sound_volume: (_block, generator) => [
        `${generator.getDeveloperVariableName(VAR_VOLUME)} ?? 100`,
        javascript.Order.LOGICAL_OR,
    ],

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
        generateAddTriggerHandler(block, generator, {
            type: "immediately",
            hatBlockId: block.id,
        }),

    control_start_as_clone: (block, generator) =>
        generateAddTriggerHandler(block, generator, {
            type: "startAsClone",
            hatBlockId: block.id,
        }),

    event_whenbroadcastreceived: (block, generator) => {
        const broadcastId = getStringFieldValue(block, FIELD_BROADCAST);
        return generateAddTriggerHandler(block, generator, {
            type: "broadcast",
            hatBlockId: block.id,
            broadcast: broadcastId,
        });
    },

    event_on_property_change: (block, generator) => {
        const spec = getDropdownFieldValue(block, BLOCK_WHEN_I, 0);
        switch (spec) {
            case "position":
                return generateAddTriggerHandler(block, generator, {
                    type: "position",
                    hatBlockId: block.id,
                    newValue: "ANY",
                });
            case "rotation":
                return generateAddTriggerHandler(block, generator, {
                    type: "rotation",
                    hatBlockId: block.id,
                    newValue: "ANY",
                });
            case "layer":
                return generateAddTriggerHandler(block, generator, {
                    type: "layer",
                    hatBlockId: block.id,
                    newValue: "ANY",
                });
            case "locked:true":
                return generateAddTriggerHandler(block, generator, {
                    type: "locked",
                    hatBlockId: block.id,
                    newValue: { exactly: true },
                });
            case "locked:false":
                return generateAddTriggerHandler(block, generator, {
                    type: "locked",
                    hatBlockId: block.id,
                    newValue: { exactly: false },
                });
            case "visible:true": {
                return generateAddTriggerHandler(block, generator, {
                    type: "visible",
                    hatBlockId: block.id,
                    newValue: { exactly: true },
                });
            }
            case "visible:false": {
                return generateAddTriggerHandler(block, generator, {
                    type: "visible",
                    hatBlockId: block.id,
                    newValue: { exactly: false },
                });
            }
            case "attachedTo:defined": {
                return generateAddTriggerHandler(block, generator, {
                    type: "attachedTo",
                    hatBlockId: block.id,
                    newValue: "DEFINED",
                });
            }
            case "attachedTo:undefined": {
                return generateAddTriggerHandler(block, generator, {
                    type: "attachedTo",
                    hatBlockId: block.id,
                    newValue: { exactly: undefined },
                });
            }
            case "SELECTED:true":
                return generateAddTriggerHandler(block, generator, {
                    type: "selected",
                    hatBlockId: block.id,
                    selectedState: true,
                });
            case "SELECTED:false":
                return generateAddTriggerHandler(block, generator, {
                    type: "selected",
                    hatBlockId: block.id,
                    selectedState: false,
                });
        }
    },

    event_whentouchingobject: (block, generator) => {
        const touchState = getStringFieldValue(
            block,
            BLOCK_TOUCH.args0[0].name,
        );

        return generateAddTriggerHandler(block, generator, {
            type: "collision",
            hatBlockId: block.id,
            start: touchState === "true",
        });
    },

    extension_smoke_when_door: (block, generator) => {
        const doorState = getStringFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_WHEN_DOOR.args0[1].name,
        );

        return generateAddTriggerHandler(block, generator, {
            type: "smoke_spectre_door",
            hatBlockId: block.id,
            doorState: doorState === "true",
        });
    },

    // Control blocks
    control_wait: (block, generator) => {
        const duration = generator.valueToCode(
            block,
            BLOCK_WAIT.args0[0].name,
            javascript.Order.NONE,
        );
        const [durationVar, initDurationVar] = generateVariable(
            generator,
            "duration",
            duration,
        );
        return [
            initDurationVar,
            `await new Promise(resolve => setTimeout(resolve, 1000 * ${provideNum(
                generator,
            )}(${durationVar})));`,
            `${PARAMETER_ITEM_PROXY}.invalidate();`, // items could have changed during wait
            THROW_ON_ABORT,
        ].join("\n");
    },

    control_behavior_stop: (block) => {
        const target = getDropdownFieldValue(block, BLOCK_STOP, 0);
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
            case "OTHER_SCRIPTS":
                return `${PARAMETER_BEHAVIOR_REGISTRY}.${
                    "stopBehaviorsForItem" satisfies keyof BehaviorRegistry
                }(${PARAMETER_SELF_ID}, ${PARAMETER_HAT_ID});\n`;
        }
    },

    control_behavior_if: (block, generator) => {
        const condition = generator.valueToCode(
            block,
            BLOCK_IF.args0[0].name,
            javascript.Order.NONE,
        );
        const statements = generator.statementToCode(
            block,
            BLOCK_IF.args0[2].name,
        );
        return generateBlock(generator, `if (${condition})`, statements);
    },

    control_behavior_if_else: (block, generator) => {
        const condition = generator.valueToCode(
            block,
            BLOCK_IF_ELSE.args0[0].name,
            javascript.Order.NONE,
        );
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
        return `${prefix}for (${initCountVar} ${countVar} < ${max}; ${countVar}++) {\n${generator.addLoopTrap(
            statements,
            block,
        )}\n}\n`;
    },

    control_repeat_until: (block, generator) => {
        const condition = generator.valueToCode(
            block,
            BLOCK_REPEAT_UNTIL.args0[0].name,
            javascript.Order.EQUALITY,
        );
        const statements = generator.statementToCode(
            block,
            BLOCK_REPEAT_UNTIL.args1[0].name,
        );

        // "condition === false" rather than "!condition" because undefined
        // conditions should exit the loop
        return `while (${condition} === false) {\n${generator.addLoopTrap(
            statements,
            block,
        )}\n}\n`;
    },

    control_wait_until: (block, generator) => {
        const condition = generator.valueToCode(
            block,
            BLOCK_WAIT_UNTIL.args0[0].name,
            javascript.Order.EQUALITY,
        );
        const TIME_BETWEEN_CHECKS = 1000;

        // "condition === false" rather than "!condition" because undefined
        // conditions should exit the loop
        return `while (${condition} === false) {\n${generator.addLoopTrap(
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
        return awaitBehaveStatement("clone", PARAMETER_SIGNAL, item);
    },

    control_delete_this: () =>
        awaitBehaveStatement("delete", PARAMETER_SIGNAL, PARAMETER_SELF_ID) +
        "return;\n",

    control_match: (block, generator) => {
        const value = generator.valueToCode(
            block,
            BLOCK_MATCH.args0[0].name,
            javascript.Order.NONE,
        );
        const defaultCode = block.getInput(BLOCK_MATCH.args4[0].name)
            ? generator.statementToCode(block, BLOCK_MATCH.args4[0].name)
            : undefined;
        return generateBlock(
            generator,
            `switch (String(${value}))`,
            getCaseInputs(block)
                .map(
                    ({ caseInput, caseLabelInput }) =>
                        `case ${generator.quote_(
                            getCaseName(caseLabelInput),
                        )}:\n` +
                        generator.statementToCode(block, caseInput.name) +
                        `\n${generator.INDENT}break;`,
                )
                .join("\n") + (defaultCode ? `\ndefault:\n${defaultCode}` : ""),
        );
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
        return awaitBehaveStatement("addTag", PARAMETER_SIGNAL, target, tag);
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
        return awaitBehaveStatement("removeTag", PARAMETER_SIGNAL, target, tag);
    },

    sensing_has_tag_self: (block, generator) => {
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return awaitBehaveValue(
            "hasTag",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            tag,
        );
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
        return awaitBehaveValue("hasTag", PARAMETER_SIGNAL, target, tag);
    },

    sensing_closest_tagged: (block, generator) => {
        const tag = generator.valueToCode(
            block,
            INPUT_TAG,
            javascript.Order.NONE,
        );
        return awaitBehaveValue(
            "findClosestTagged",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            tag,
        );
    },

    sensing_deselect: (block) => {
        const target = getDropdownFieldValue(block, BLOCK_DESELECT, 0);
        const deselectArg = target === "THIS" ? `[${PARAMETER_SELF_ID}]` : "";
        return [
            awaitBehaveStatement("deselect", deselectArg),
            THROW_ON_ABORT,
        ].join("");
    },

    sensing_other_src: () => "",
    sensing_other_val: () => [PARAMETER_OTHER_ID, javascript.Order.ATOMIC],

    sensing_of: (block, generator) => {
        const property = getDropdownFieldValue(block, BLOCK_SENSING_OF, 0);
        const item = generator.valueToCode(
            block,
            BLOCK_SENSING_OF.args0[1].name,
            javascript.Order.NONE,
        );

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
            case "TEXT":
                return awaitBehaveValue("getText", PARAMETER_SIGNAL, item);
            case "NAME":
                return [
                    `(await ${PARAMETER_ITEM_PROXY}.get(${item}))?.name ?? ""`,
                    javascript.Order.LOGICAL_OR,
                ];
            case "DESCRIPTION":
                return [
                    `(await ${PARAMETER_ITEM_PROXY}.get(${item}))?.description ?? ""`,
                    javascript.Order.LOGICAL_OR,
                ];
        }
    },

    sensing_current_time: (block) => {
        const unit = getDropdownFieldValue(block, BLOCK_CURRENT_TIME, 0);
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
        const item = generator.valueToCode(
            block,
            BLOCK_DISTANCE_TO.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveValue(
            "distanceTo",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            item,
        );
    },

    sensing_touchingobject: (block, generator) => {
        const item = generator.valueToCode(
            block,
            BLOCK_TOUCHING.args0[0].name,
            javascript.Order.NONE,
        );
        return awaitBehaveValue(
            "touching",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            item,
        );
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

    /**
     * Customization of Blockly version:
     * https://github.com/google/blockly/blob/8580d763b34b10c961d43ae8a61ce76c8669548c/generators/javascript/math.ts#L27C17-L27C32
     * Altered to convert parameters to numbers
     */
    math_arithmetic: (block, generator) => {
        const num = provideNum(generator);

        // Basic arithmetic operators, and power.
        const OPERATORS = {
            ADD: [" + ", javascript.Order.ADDITION],
            MINUS: [" - ", javascript.Order.SUBTRACTION],
            MULTIPLY: [" * ", javascript.Order.MULTIPLICATION],
            DIVIDE: [" / ", javascript.Order.DIVISION],
            POWER: [null, javascript.Order.NONE], // Handle power separately.
        } as const;
        type OperatorOption = keyof typeof OPERATORS;
        const tuple = OPERATORS[block.getFieldValue("OP") as OperatorOption];
        const operator = tuple[0];
        const order = tuple[1];

        const argument0 = generator.valueToCode(
            block,
            "A",
            javascript.Order.NONE,
        );
        const argument1 = generator.valueToCode(
            block,
            "B",
            javascript.Order.NONE,
        );
        let code;
        // Power in JavaScript requires a special case since it has no operator.
        if (!operator) {
            code = `Math.pow(${num}(${argument0}), ${num}(${argument1}))`;
            return [code, javascript.Order.FUNCTION_CALL];
        }
        code = `${num}(${argument0}) ${operator} ${num}(${argument1})`;
        return [code, order];
    },

    // Variable blocks
    data_variable: variableBlock,
    variables_get_dynamic: variableBlock,

    data_setvariableto: variableSetBlock,
    variables_set_dynamic: variableSetBlock,

    data_changevariableby: variableChangeBlock,
    math_change: variableChangeBlock,

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
            `async function ${name}(${PARAMETER_SIGNAL}, ${PARAMETER_OTHER_ID}, ${VAR_LOOP_CHECK}, ${PARAMETER_HAT_ID}, ${model
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
            .map((input) =>
                generator.valueToCode(block, input.name, javascript.Order.NONE),
            );
        const model = (block as CallBlock).getProcedureModel();
        const name = generator.getProcedureName(model.getName());
        return `${VAR_LOOP_CHECK} = await ${name}(${PARAMETER_SIGNAL}, ${PARAMETER_OTHER_ID}, ${VAR_LOOP_CHECK}, ${PARAMETER_HAT_ID}, ${args.join(
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

        return (
            awaitBehaveStatement(
                "announce",
                PARAMETER_SIGNAL,
                content,
                duration,
            ) + `${PARAMETER_ITEM_PROXY}.invalidate();`
        );
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

        return (
            awaitBehaveStatement("hoot", PARAMETER_SIGNAL, track, playlist) +
            `${PARAMETER_ITEM_PROXY}.invalidate();`
        );
    },

    extension_auras_remove: () =>
        awaitBehaveStatement(
            "removeAuras",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ) + `${PARAMETER_ITEM_PROXY}.invalidate();`,

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
        return (
            awaitBehaveStatement(
                "addAura",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                generator.quote_(style),
                color,
                size,
            ) + `${PARAMETER_ITEM_PROXY}.invalidate();`
        );
    },

    extension_auras_add_preset: (block, generator) => {
        const preset = generator.valueToCode(
            block,
            BLOCK_ADD_AURA_PRESET.args0[1].name,
            javascript.Order.NONE,
        );
        return (
            awaitBehaveStatement(
                "addAuraPreset",
                PARAMETER_SIGNAL,
                PARAMETER_SELF_ID,
                preset,
            ) + `${PARAMETER_ITEM_PROXY}.invalidate();`
        );
    },

    extension_fog_lit: () =>
        awaitBehaveValue("hasLight", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

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
        return awaitBehaveStatement(
            "addLight",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            radius,
            generator.quote_(shape),
        );
    },

    extension_fog_remove: () =>
        awaitBehaveStatement(
            "removeLight",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),
    extension_smoke_vision: () =>
        awaitBehaveValue("hasVision", PARAMETER_SIGNAL, PARAMETER_SELF_ID),
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
        return awaitBehaveStatement(
            "addVision",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            radius,
            generator.quote_(shape),
        );
    },
    extension_smoke_remove: () =>
        awaitBehaveStatement(
            "disableVision",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),
    extension_smoke_vision_line: (block) => {
        const enabled = getStringFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_VISION_LINE.args0[1].name,
        );
        return awaitBehaveStatement(
            "setVisionLine",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            enabled,
        );
    },

    extension_smoke_wall: (block) => {
        const prop = getDropdownFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_SWAP,
            1,
        );
        let func: keyof typeof BEHAVIORS_IMPL;
        let arg: boolean;
        switch (prop) {
            case "passable:true":
                func = "setPassable";
                arg = true;
                break;
            case "passable:false":
                func = "setPassable";
                arg = false;
                break;
            case "doublesided:true":
                func = "setDoubleSided";
                arg = true;
                break;
            case "doublesided:false":
                func = "setDoubleSided";
                arg = false;
                break;
        }
        return awaitBehaveStatement(
            func,
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            String(arg),
        );
    },

    extension_smoke_door: (block) => {
        const prop = getDropdownFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_DOOR,
            1,
        );
        let func: keyof typeof BEHAVIORS_IMPL;
        let arg: boolean;
        switch (prop) {
            case "enabled:true":
                func = "setDoorEnabled";
                arg = true;
                break;
            case "enabled:false":
                func = "setDoorEnabled";
                arg = false;
                break;
            case "open:true":
                func = "setDoorOpen";
                arg = true;
                break;
            case "open:false":
                func = "setDoorOpen";
                arg = false;
                break;
            case "locked:true":
                func = "setDoorLocked";
                arg = true;
                break;
            case "locked:false":
                func = "setDoorLocked";
                arg = false;
                break;
        }
        return awaitBehaveStatement(
            func,
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            String(arg),
        );
    },

    extension_smoke_window: (block) => {
        const prop = getDropdownFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_WINDOW,
            1,
        );
        let func: keyof typeof BEHAVIORS_IMPL;
        let arg: boolean;
        switch (prop) {
            case "enabled:true":
                func = "setWindowEnabled";
                arg = true;
                break;
            case "enabled:false":
                func = "setWindowEnabled";
                arg = false;
                break;
        }
        return awaitBehaveStatement(
            func,
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            String(arg),
        );
    },

    extension_smoke_blind: (block) => {
        const blind = getStringFieldValue(
            block,
            BLOCK_EXTENSION_SMOKE_BLIND.args0[1].name,
        );
        return awaitBehaveStatement(
            "setVisionBlind",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            blind,
        );
    },

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

        return awaitBehaveStatement(
            "addWeather",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(type),
            generator.quote_(direction),
            speed,
            density,
        );
    },

    extension_weather_remove: () =>
        awaitBehaveStatement(
            "removeWeather",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),

    extension_weather_has: () =>
        awaitBehaveValue("hasWeather", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_grimoire_hp: () =>
        awaitBehaveValue("getHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_grimoire_max_hp: () =>
        awaitBehaveValue("getMaxHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_grimoire_temp_hp: () =>
        awaitBehaveValue("getTempHp", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_grimoire_ac: () =>
        awaitBehaveValue("getArmorClass", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_grimoire_hp_change: (block, generator) =>
        generateAddTriggerHandler(block, generator, {
            type: "grimoire_hp_change",
            hatBlockId: block.id,
        }),

    extension_bones_roll: (block, generator) => {
        const value = getNumberFieldValue(
            block,
            BLOCK_EXTENSION_BONES_ON_ROLL.args0[1].name,
        );
        const dieTypeString = getStringFieldValue(
            block,
            BLOCK_EXTENSION_BONES_ON_ROLL.args0[2].name,
        );
        const dieType = dieTypeString === "ANY" ? "ANY" : Number(dieTypeString);

        return generateAddTriggerHandler(block, generator, {
            type: "bones_roll",
            hatBlockId: block.id,
            dieType,
            value,
        });
    },

    extension_bones_dice: (block, generator) => {
        const notation = generator.valueToCode(
            block,
            BLOCK_EXTENSION_BONES_ROLL_DICE.args0[1].name,
            javascript.Order.NONE,
        );
        const viewers = getStringFieldValue(
            block,
            BLOCK_EXTENSION_BONES_ROLL_DICE.args0[2].name,
        );

        return awaitBehaveValue(
            "bonesRoll",
            PARAMETER_SIGNAL,
            notation,
            generator.quote_(viewers),
        );
    },

    extension_phases_change: (block, generator) => {
        const name = getStringFieldValue(
            block,
            BLOCK_EXTENSION_PHASE_CHANGE.args0[1].name,
        );
        const phase = getNumberFieldValue(
            block,
            BLOCK_EXTENSION_PHASE_CHANGE.args0[2].name,
        );
        return generateAddTriggerHandler(block, generator, {
            type: "phase_change",
            hatBlockId: block.id,
            name,
            phase,
        });
    },

    // Pretty Sordid Initiative
    extension_pretty_initiative: () =>
        awaitBehaveValue(
            "getMyInitiative",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
        ),

    extension_pretty_my_turn: () =>
        awaitBehaveValue("isMyTurn", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    extension_pretty_set_initiative: (block, generator) => {
        const count = generator.valueToCode(
            block,
            BLOCK_EXTENSION_PRETTY_SET_INITIATIVE.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setMyInitiative",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            count,
        );
    },

    extension_pretty_turn_change: (block, generator) => {
        const turnState = getStringFieldValue(
            block,
            BLOCK_WHEN_PRETTY_TURN_CHANGE.args0[1].name,
        );
        return generateAddTriggerHandler(block, generator, {
            type: "pretty_turn_change",
            hatBlockId: block.id,
            turnState: turnState === "true",
        });
    },

    extension_clash_property: (block) => {
        const property = getDropdownFieldValue(
            block,
            BLOCK_EXTENSION_CLASH_PROPERTY,
            1,
        );

        switch (property) {
            case "HP":
                return awaitBehaveValue(
                    "getClashHP",
                    PARAMETER_SIGNAL,
                    PARAMETER_SELF_ID,
                );
            case "MAX_HP":
                return awaitBehaveValue(
                    "getClashMaxHP",
                    PARAMETER_SIGNAL,
                    PARAMETER_SELF_ID,
                );
            case "INITIATIVE":
                return awaitBehaveValue(
                    "getClashInitiative",
                    PARAMETER_SIGNAL,
                    PARAMETER_SELF_ID,
                );
        }
    },

    extension_clash_hp_change: (block, generator) =>
        generateAddTriggerHandler(block, generator, {
            type: "clash_hp_change",
            hatBlockId: block.id,
        }),

    extension_rumble_say: (block, generator) => {
        const message = generator.valueToCode(
            block,
            BLOCK_EXTENSION_RUMBLE_SAY.args0[1].name,
            javascript.Order.NONE,
        );
        const toSelf = getStringFieldValue(
            block,
            BLOCK_EXTENSION_RUMBLE_SAY.args0[2].name,
        );
        return awaitBehaveStatement(
            "rumbleSay",
            PARAMETER_SIGNAL,
            message,
            toSelf,
        );
    },

    extension_rumble_roll: (block, generator) => {
        const notation = generator.valueToCode(
            block,
            BLOCK_EXTENSION_RUMBLE_ROLL.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement("rumbleRoll", PARAMETER_SIGNAL, notation);
    },

    extension_daggerheart_stat: (block, generator) => {
        const statName = getStringFieldValue(
            block,
            BLOCK_EXTENSION_DAGGERHEART_STAT.args0[1].name,
        );
        return awaitBehaveValue(
            "getDaggerheartStat",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            generator.quote_(statName),
        );
    },

    extension_daggerheart_fear: () =>
        awaitBehaveValue("getDaggerheartFear", PARAMETER_SIGNAL),

    extension_owl_trackers_field: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_FIELD.args0[1].name,
            javascript.Order.ATOMIC,
        );
        return awaitBehaveValue(
            "getOwlTrackersField",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            String(fieldName),
        );
    },

    extension_owl_trackers_checkbox: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX.args0[1].name,
            javascript.Order.ATOMIC,
        );
        return awaitBehaveValue(
            "isOwlTrackersFieldChecked",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            String(fieldName),
        );
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
        return awaitBehaveStatement(
            "setOwlTrackersField",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            fieldName,
            value,
        );
    },

    extension_owl_trackers_set_checkbox: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.args0[1].name,
            javascript.Order.NONE,
        );
        const checked = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.args0[2].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setOwlTrackersCheckbox",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            fieldName,
            checked,
        );
    },

    extension_owl_trackers_showmap: (block, generator) => {
        const fieldName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_SHOW_ON_MAP.args0[2].name,
            javascript.Order.NONE,
        );
        const show = getStringFieldValue(
            block,
            BLOCK_EXTENSION_OWL_TRACKERS_SET_SHOW_ON_MAP.args0[1].name,
        );
        return awaitBehaveStatement(
            "setOwlTrackerShowOnMap",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            fieldName,
            show,
        );
    },

    extension_codeo_run: (block, generator) => {
        const scriptName = generator.valueToCode(
            block,
            BLOCK_EXTENSION_CODEO_RUN_SCRIPT.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement("runScript", PARAMETER_SIGNAL, scriptName);
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
        return awaitBehaveValue(
            "getSheetsValue",
            PARAMETER_SIGNAL,
            cell,
            sheet,
            spreadsheetId,
        );
    },

    extension_peekaboo_solidity: (block, generator) => {
        const solidity = generator.valueToCode(
            block,
            BLOCK_EXTENSION_PEEKABOO_SET_SOLIDITY.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setSolidity",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            solidity,
        );
    },
    extension_peekaboo_get_solidity: () =>
        awaitBehaveValue("getSolidity", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

    // Character Distances
    extension_dist_setht: (block, generator) => {
        const height = generator.valueToCode(
            block,
            BLOCK_EXTENSION_CHARACTER_DISTANCES_SET_HEIGHT.args0[1].name,
            javascript.Order.NONE,
        );
        return awaitBehaveStatement(
            "setHeight",
            PARAMETER_SIGNAL,
            PARAMETER_SELF_ID,
            height,
        );
    },
    extension_dist_getht: () =>
        awaitBehaveValue("getHeight", PARAMETER_SIGNAL, PARAMETER_SELF_ID),

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
        const ref = getDropdownFieldValue(block, BLOCK_SENSING_ITEM_MENU, 0);
        switch (ref) {
            case "MYSELF":
                return [PARAMETER_SELF_ID, javascript.Order.ATOMIC];
        }
    },
    control_menu_item: (block) => {
        const ref = getDropdownFieldValue(block, BLOCK_CONTROL_ITEM_MENU, 0);
        switch (ref) {
            case "MYSELF":
                return [PARAMETER_SELF_ID, javascript.Order.ATOMIC];
        }
    },

    // Non-codegen blocks
    procedures_declaration: noCodegen,
    argument_editor_string_number: noCodegen,
    argument_editor_boolean: noCodegen,
    controls_match_match: noCodegen,
    controls_match_case: noCodegen,
};
