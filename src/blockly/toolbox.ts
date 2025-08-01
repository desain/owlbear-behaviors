import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    isText,
} from "@owlbear-rodeo/sdk";
import type { Block } from "blockly";
import { assumeHexColor, type GridParsed } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import { getText } from "../behaviors/impl/looks";
import {
    CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
    CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
    INPUT_BROADCAST,
    INPUT_TAG,
} from "../constants";
import {
    BLOCK_ADD_AURA,
    BLOCK_ANGLE,
    BLOCK_ANNOUNCEMENT,
    BLOCK_ATTACH,
    BLOCK_ATTACHED,
    BLOCK_BROADCAST,
    BLOCK_BROADCAST_MENU,
    BLOCK_CHANGE_EFFECT_BY,
    BLOCK_CHANGE_SIZE,
    BLOCK_CLEAR_GRAPHIC_EFFECTS,
    BLOCK_CLOSEST_TAGGED,
    BLOCK_CONTAINS,
    BLOCK_CREATE_CLONE_OF,
    BLOCK_CURRENT_TIME,
    BLOCK_DELETE_THIS,
    BLOCK_DESELECT,
    BLOCK_DETACH,
    BLOCK_DISTANCE_TO,
    BLOCK_EQUALS,
    BLOCK_EXTENSION_BONES_ON_ROLL,
    BLOCK_EXTENSION_BONES_ROLL_DICE,
    BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
    BLOCK_EXTENSION_DAGGERHEART_FEAR,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_FOG_LIT,
    BLOCK_EXTENSION_FOG_REMOVE,
    BLOCK_EXTENSION_GRIMOIRE_AC,
    BLOCK_EXTENSION_GRIMOIRE_HP,
    BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE,
    BLOCK_EXTENSION_GRIMOIRE_MAX_HP,
    BLOCK_EXTENSION_GRIMOIRE_TEMP_HP,
    BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
    BLOCK_EXTENSION_PHASE_CHANGE,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_SHEETS_GET,
    BLOCK_EXTENSION_SMOKE_ADD,
    BLOCK_EXTENSION_SMOKE_DOOR,
    BLOCK_EXTENSION_SMOKE_REMOVE,
    BLOCK_EXTENSION_SMOKE_SWAP,
    BLOCK_EXTENSION_SMOKE_VISION,
    BLOCK_EXTENSION_SMOKE_VISION_LINE,
    BLOCK_EXTENSION_SMOKE_WINDOW,
    BLOCK_EXTENSION_SMOKE_BLIND,
    BLOCK_EXTENSION_WEATHER_ADD,
    BLOCK_EXTENSION_WEATHER_HAS,
    BLOCK_EXTENSION_WEATHER_REMOVE,
    BLOCK_FACE,
    BLOCK_FOREVER,
    BLOCK_GET_FILL_COLOR,
    BLOCK_GET_FILL_OPACITY,
    BLOCK_GET_LAYER,
    BLOCK_GET_SIZE,
    BLOCK_GET_STROKE_COLOR,
    BLOCK_GET_STROKE_OPACITY,
    BLOCK_GET_TEXT,
    BLOCK_GLIDE,
    BLOCK_GLIDE_ROTATE_LEFT,
    BLOCK_GLIDE_ROTATE_RIGHT,
    BLOCK_GOTO,
    BLOCK_GREATER_THAN,
    BLOCK_HAS_TAG_OTHER,
    BLOCK_HAS_TAG_SELF,
    BLOCK_HIDE,
    BLOCK_HOOT,
    BLOCK_IF,
    BLOCK_IF_ELSE,
    BLOCK_IMMEDIATELY,
    BLOCK_LAYER_MENU,
    BLOCK_LESS_THAN,
    BLOCK_LETTER_OF,
    BLOCK_LOCK,
    BLOCK_LOCKED,
    BLOCK_MATCH,
    BLOCK_MOVE_DIRECTION,
    BLOCK_MY_PARENT,
    BLOCK_OPACITY_SLIDER,
    BLOCK_OTHER,
    BLOCK_POINT_IN_DIRECTION,
    BLOCK_RECEIVE_BROADCAST,
    BLOCK_REMOVE_AURAS,
    BLOCK_REMOVE_TAG,
    BLOCK_REPEAT,
    BLOCK_REPEAT_UNTIL,
    BLOCK_REPLACE_IMAGE,
    BLOCK_ROTATE_LEFT,
    BLOCK_ROTATE_RIGHT,
    BLOCK_ROTATION,
    BLOCK_SAY,
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
    BLOCK_SHOW,
    BLOCK_SNAP_TO_GRID,
    BLOCK_SOUND_MENU,
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_SOUND_STOP_ALL,
    BLOCK_STOP,
    BLOCK_TAG,
    BLOCK_TAG_MENU,
    BLOCK_TOUCH,
    BLOCK_TOUCHING,
    BLOCK_UNLOCK,
    BLOCK_URL,
    BLOCK_VISIBLE,
    BLOCK_WAIT,
    BLOCK_WAIT_UNTIL,
    BLOCK_WHEN_DOOR,
    BLOCK_WHEN_I,
    BLOCK_WHEN_I_START_AS_CLONE,
    BLOCK_X_POSITION,
    BLOCK_Y_POSITION,
} from "./blocks";
import { FieldTokenImage } from "./FieldTokenImage";
import { extensionHeader } from "./getExtensionButton";
import {
    shadowColor,
    shadowDynamic,
    shadowItemMenu,
    shadowNumber,
} from "./shadows";

export function blockToDefinition(block: Pick<Block, "type">) {
    return {
        kind: "block",
        type: block.type,
    };
}

export const GAP50 = { kind: "sep", gap: 50 } as const;

const SHADOW_TAG_MENU = {
    [INPUT_TAG]: {
        shadow: {
            type: BLOCK_TAG_MENU.type,
        },
    },
};

/**
 * Toolbox of default and custom blocks.
 * Grab default ones from: https://blockly-demo.appspot.com/static/tests/playground.html?dir=ltr&toolbox=categories-typed-variables
 * With source: https://github.com/google/blockly/blob/master/blocks
 */
export function createToolbox(target: BehaviorItem, grid: GridParsed) {
    return {
        kind: "categoryToolbox",
        contents: [
            /* motion */ {
                kind: "category",
                name: "Motion",
                categorystyle: "style_category_motion",
                contents: [
                    {
                        kind: "block",
                        type: BLOCK_ROTATE_RIGHT.type,
                        inputs: {
                            [BLOCK_ROTATE_RIGHT.args0[1].name]:
                                shadowNumber(15),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_GLIDE_ROTATE_RIGHT.type,
                        inputs: {
                            [BLOCK_GLIDE_ROTATE_RIGHT.args0[0].name]:
                                shadowNumber(1),
                            [BLOCK_GLIDE_ROTATE_RIGHT.args0[2].name]:
                                shadowNumber(90),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_ROTATE_LEFT.type,
                        inputs: {
                            [BLOCK_ROTATE_LEFT.args0[1].name]: shadowNumber(15),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_GLIDE_ROTATE_LEFT.type,
                        inputs: {
                            [BLOCK_GLIDE_ROTATE_LEFT.args0[0].name]:
                                shadowNumber(1),
                            [BLOCK_GLIDE_ROTATE_LEFT.args0[2].name]:
                                shadowNumber(90),
                        },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_MOVE_DIRECTION.type,
                        fields: {
                            [BLOCK_MOVE_DIRECTION.args0[0].name]: "FORWARD",
                            [BLOCK_MOVE_DIRECTION.args0[2].name]: "UNITS",
                        },
                        inputs: {
                            [BLOCK_MOVE_DIRECTION.args0[1].name]: shadowNumber(
                                grid.parsedScale.multiplier,
                            ),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_GOTO.type,
                        inputs: {
                            [BLOCK_GOTO.args0[0].name]: shadowNumber(
                                Math.round(target.position.x),
                            ),
                            [BLOCK_GOTO.args0[1].name]: shadowNumber(
                                Math.round(target.position.y),
                            ),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_GLIDE.type,
                        inputs: {
                            [BLOCK_GLIDE.args0[0].name]: shadowNumber(1),
                            [BLOCK_GLIDE.args0[1].name]: shadowNumber(
                                Math.round(target.position.x),
                            ),
                            [BLOCK_GLIDE.args0[2].name]: shadowNumber(
                                Math.round(target.position.y),
                            ),
                        },
                    },
                    blockToDefinition(BLOCK_SNAP_TO_GRID),
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_POINT_IN_DIRECTION.type,
                        inputs: {
                            [BLOCK_POINT_IN_DIRECTION.args0[0].name]: {
                                shadow: {
                                    type: BLOCK_ANGLE.type,
                                    fields: {
                                        [BLOCK_ANGLE.args0[0].name]:
                                            ((target.rotation % 360) + 360) %
                                            360, // ensure 0-359
                                    },
                                },
                            },
                        },
                    },
                    blockToDefinition(BLOCK_FACE),
                    GAP50,
                    blockToDefinition(BLOCK_ATTACH),
                    blockToDefinition(BLOCK_DETACH),
                    GAP50,
                    blockToDefinition(BLOCK_LOCK),
                    blockToDefinition(BLOCK_UNLOCK),
                    GAP50,
                    blockToDefinition(BLOCK_X_POSITION),
                    blockToDefinition(BLOCK_Y_POSITION),
                    blockToDefinition(BLOCK_ROTATION),
                    blockToDefinition(BLOCK_MY_PARENT),
                    blockToDefinition(BLOCK_LOCKED),
                    blockToDefinition(BLOCK_ATTACHED),
                ],
            },
            /* looks */ {
                kind: "category",
                name: "Looks",
                categorystyle: "style_category_looks",
                contents: [
                    {
                        kind: "block",
                        type: BLOCK_SAY.type,
                        inputs: {
                            [BLOCK_SAY.args0[0].name]: shadowDynamic("Hello!"),
                            [BLOCK_SAY.args0[1].name]: shadowNumber(2),
                        },
                    },
                    ...(isImage(target)
                        ? [
                              GAP50,
                              {
                                  kind: "block",
                                  type: BLOCK_REPLACE_IMAGE.type,
                                  fields: {
                                      [BLOCK_REPLACE_IMAGE.args0[0].name]:
                                          FieldTokenImage.valueFromImage(
                                              target,
                                          ),
                                  },
                              },
                          ]
                        : []),
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_SET_SIZE.type,
                        inputs: {
                            [BLOCK_SET_SIZE.args0[0].name]: shadowNumber(100),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_CHANGE_SIZE.type,
                        inputs: {
                            [BLOCK_CHANGE_SIZE.args0[0].name]: shadowNumber(10),
                        },
                    },
                    GAP50,
                    // Only show effects-based blocks for shapes, curves, and paths
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_CHANGE_EFFECT_BY.type,
                                  inputs: {
                                      [BLOCK_CHANGE_EFFECT_BY.args0[1].name]:
                                          shadowNumber(25),
                                  },
                              },
                              {
                                  kind: "block",
                                  type: BLOCK_SET_EFFECT_TO.type,
                                  inputs: {
                                      [BLOCK_SET_EFFECT_TO.args0[1].name]:
                                          shadowNumber(100),
                                  },
                              },
                              blockToDefinition(BLOCK_CLEAR_GRAPHIC_EFFECTS),
                              GAP50,
                          ]
                        : []),
                    blockToDefinition(BLOCK_SHOW),
                    blockToDefinition(BLOCK_HIDE),
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_SET_LAYER.type,
                        inputs: {
                            [BLOCK_SET_LAYER.args0[0].name]: {
                                shadow: {
                                    type: BLOCK_LAYER_MENU.type,
                                    fields: {
                                        [BLOCK_LAYER_MENU.args0[0].name]:
                                            target.layer,
                                    },
                                },
                            },
                        },
                    },
                    GAP50,
                    ...(isImage(target) || isText(target)
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_SET_TEXT.type,
                                  inputs: {
                                      [BLOCK_SET_TEXT.args0[0].name]:
                                          shadowDynamic(getText(target)),
                                  },
                              },
                              GAP50,
                          ]
                        : []),
                    // Only show set fill color and fill opacity for shapes, curves, and paths (not lines)
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_SET_FILL_COLOR.type,
                                  inputs: {
                                      [BLOCK_SET_FILL_COLOR.args0[0].name]:
                                          shadowColor(
                                              assumeHexColor(
                                                  target.style.fillColor,
                                              ),
                                          ),
                                  },
                              },
                              {
                                  kind: "block",
                                  type: BLOCK_SET_FILL_OPACITY.type,
                                  inputs: {
                                      [BLOCK_SET_FILL_OPACITY.args0[0].name]: {
                                          shadow: {
                                              type: BLOCK_OPACITY_SLIDER.type,
                                              fields: {
                                                  [BLOCK_OPACITY_SLIDER.args0[0]
                                                      .name]:
                                                      target.style.fillOpacity *
                                                      100,
                                              },
                                          },
                                      },
                                  },
                              },
                          ]
                        : []),
                    // Only show set stroke color for supported types using OBR type guards
                    ...(isLine(target) ||
                    isShape(target) ||
                    isCurve(target) ||
                    isPath(target)
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_SET_STROKE_COLOR.type,
                                  inputs: {
                                      [BLOCK_SET_STROKE_COLOR.args0[0].name]:
                                          shadowColor(
                                              assumeHexColor(
                                                  target.style.strokeColor,
                                              ),
                                          ),
                                  },
                              },
                              {
                                  kind: "block",
                                  type: BLOCK_SET_STROKE_OPACITY.type,
                                  inputs: {
                                      [BLOCK_SET_STROKE_OPACITY.args0[0].name]:
                                          {
                                              shadow: {
                                                  type: BLOCK_OPACITY_SLIDER.type,
                                                  fields: {
                                                      [BLOCK_OPACITY_SLIDER
                                                          .args0[0].name]:
                                                          target.style
                                                              .strokeOpacity *
                                                          100,
                                                  },
                                              },
                                          },
                                  },
                              },
                              GAP50,
                          ]
                        : []),
                    {
                        kind: "block",
                        type: BLOCK_SET_VIEWPORT.type,
                        inputs: {
                            [BLOCK_SET_VIEWPORT.args0[1].name]: shadowNumber(
                                Math.round(target.position.x),
                            ),
                            [BLOCK_SET_VIEWPORT.args0[2].name]: shadowNumber(
                                Math.round(target.position.y),
                            ),
                        },
                    },
                    GAP50,
                    // Only show fill getters for items that support fill setters
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              blockToDefinition(BLOCK_GET_FILL_COLOR),
                              blockToDefinition(BLOCK_GET_FILL_OPACITY),
                          ]
                        : []),
                    // Only show stroke getters for items that support stroke setters
                    ...(isLine(target) ||
                    isShape(target) ||
                    isCurve(target) ||
                    isPath(target)
                        ? [
                              blockToDefinition(BLOCK_GET_STROKE_COLOR),
                              blockToDefinition(BLOCK_GET_STROKE_OPACITY),
                          ]
                        : []),
                    blockToDefinition(BLOCK_GET_SIZE),
                    blockToDefinition(BLOCK_GET_LAYER),
                    ...(isImage(target) || isText(target)
                        ? [blockToDefinition(BLOCK_GET_TEXT)]
                        : []),
                    blockToDefinition(BLOCK_VISIBLE),
                ],
            },
            /* sound */ {
                kind: "category",
                name: "Sound",
                categorystyle: "style_category_sound",
                contents: [
                    {
                        kind: "block",
                        type: BLOCK_SOUND_PLAY.type,
                        inputs: {
                            [BLOCK_SOUND_PLAY.args0[0].name]: {
                                shadow: {
                                    type: BLOCK_SOUND_MENU.type,
                                },
                            },
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_SOUND_PLAY_UNTIL_DONE.type,
                        inputs: {
                            [BLOCK_SOUND_PLAY_UNTIL_DONE.args0[0].name]: {
                                shadow: {
                                    type: BLOCK_SOUND_MENU.type,
                                },
                            },
                        },
                    },
                    blockToDefinition(BLOCK_SOUND_STOP_ALL),
                ],
            },
            /* events */ {
                kind: "category",
                name: "Events",
                categorystyle: "style_category_events",
                contents: [
                    blockToDefinition(BLOCK_IMMEDIATELY),
                    blockToDefinition(BLOCK_WHEN_I),
                    blockToDefinition(BLOCK_RECEIVE_BROADCAST),
                    {
                        kind: "block",
                        type: BLOCK_BROADCAST.type,
                        inputs: {
                            [INPUT_BROADCAST]: {
                                shadow: {
                                    type: BLOCK_BROADCAST_MENU.type,
                                },
                            },
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_TOUCH.type,
                        inputs: {
                            [BLOCK_TOUCH.args0[1].name]: {
                                shadow: {
                                    type: BLOCK_OTHER.type,
                                },
                            },
                        },
                    },
                ],
            },
            /* control */ {
                kind: "category",
                name: "Control",
                categorystyle: "style_category_control",
                contents: [
                    /* wait */ {
                        kind: "block",
                        type: BLOCK_WAIT.type,
                        inputs: { [BLOCK_WAIT.args0[0].name]: shadowNumber(1) },
                    },
                    GAP50,
                    /* repeat */ {
                        kind: "block",
                        type: BLOCK_REPEAT.type,
                        inputs: {
                            [BLOCK_REPEAT.args0[0].name]: shadowNumber(5),
                        },
                    },
                    blockToDefinition(BLOCK_FOREVER),
                    GAP50,
                    blockToDefinition(BLOCK_IF),
                    blockToDefinition(BLOCK_IF_ELSE),
                    ...(import.meta.env.DEV
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_MATCH.type,
                                  inputs: {
                                      [BLOCK_MATCH.args0[0].name]:
                                          shadowDynamic("apple"),
                                  },
                              },
                          ]
                        : []),
                    blockToDefinition(BLOCK_WAIT_UNTIL),
                    blockToDefinition(BLOCK_REPEAT_UNTIL),
                    GAP50,
                    blockToDefinition(BLOCK_STOP),
                    GAP50,
                    blockToDefinition(BLOCK_WHEN_I_START_AS_CLONE),
                    {
                        kind: "block",
                        type: BLOCK_CREATE_CLONE_OF.type,
                        inputs: {
                            [BLOCK_CREATE_CLONE_OF.args0[0].name]:
                                shadowItemMenu("control"),
                        },
                    },
                    blockToDefinition(BLOCK_DELETE_THIS),
                ],
            },
            /* events */ {
                kind: "category",
                name: "Sensing",
                categorystyle: "style_category_sensing",
                contents: [
                    blockToDefinition(BLOCK_TOUCHING),
                    blockToDefinition(BLOCK_DISTANCE_TO),
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_TAG.type,
                        inputs: {
                            [BLOCK_TAG.args0[0].name]:
                                shadowItemMenu("sensing"),
                            ...SHADOW_TAG_MENU,
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_REMOVE_TAG.type,
                        inputs: {
                            [BLOCK_REMOVE_TAG.args0[0].name]:
                                shadowItemMenu("sensing"),
                            ...SHADOW_TAG_MENU,
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_HAS_TAG_SELF.type,
                        inputs: SHADOW_TAG_MENU,
                    },
                    {
                        kind: "block",
                        type: BLOCK_HAS_TAG_OTHER.type,
                        inputs: SHADOW_TAG_MENU,
                    },
                    {
                        kind: "block",
                        type: BLOCK_CLOSEST_TAGGED.type,
                        inputs: SHADOW_TAG_MENU,
                    },
                    GAP50,
                    blockToDefinition(BLOCK_DESELECT),
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_SENSING_OF.type,
                        inputs: {
                            [BLOCK_SENSING_OF.args0[1].name]:
                                shadowItemMenu("sensing"),
                        },
                    },
                    GAP50,
                    blockToDefinition(BLOCK_CURRENT_TIME),
                ],
            },
            /* operators */ {
                kind: "category",
                name: "Operators",
                categorystyle: "style_category_operators",
                contents: [
                    {
                        kind: "block",
                        type: "math_arithmetic",
                        inputs: {
                            A: shadowNumber(),
                            B: shadowNumber(),
                        },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: "math_random_int",
                        inputs: {
                            FROM: shadowNumber(1),
                            TO: shadowNumber(10),
                        },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: BLOCK_GREATER_THAN.type,
                        inputs: {
                            [BLOCK_GREATER_THAN.args0[0].name]: shadowDynamic(),
                            [BLOCK_GREATER_THAN.args0[1].name]: shadowDynamic(),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_LESS_THAN.type,
                        inputs: {
                            [BLOCK_LESS_THAN.args0[0].name]: shadowDynamic(),
                            [BLOCK_LESS_THAN.args0[1].name]: shadowDynamic(),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_EQUALS.type,
                        inputs: {
                            [BLOCK_EQUALS.args0[0].name]: shadowDynamic(),
                            [BLOCK_EQUALS.args0[1].name]: shadowDynamic(),
                        },
                    },
                    GAP50,
                    { kind: "block", type: "logic_operation" },
                    { kind: "block", type: "logic_negate" },
                    GAP50,
                    {
                        kind: "block",
                        type: "operator_join",
                        inputs: {
                            STRING1: shadowDynamic("apple "),
                            STRING2: shadowDynamic("banana"),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_LETTER_OF.type,
                        inputs: {
                            [BLOCK_LETTER_OF.args0[0].name]: shadowNumber(1),
                            [BLOCK_LETTER_OF.args0[1].name]:
                                shadowDynamic("apple"),
                        },
                    },
                    {
                        kind: "block",
                        type: "text_length",
                        inputs: {
                            VALUE: shadowDynamic("apple"),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_CONTAINS.type,
                        inputs: {
                            [BLOCK_CONTAINS.args0[0].name]:
                                shadowDynamic("apple"),
                            [BLOCK_CONTAINS.args0[1].name]: shadowDynamic("a"),
                        },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: "math_modulo",
                        inputs: {
                            DIVIDEND: shadowNumber(),
                            DIVISOR: shadowNumber(10),
                        },
                    },
                    {
                        kind: "block",
                        type: "math_round",
                        inputs: { NUM: shadowNumber() },
                    },
                    {
                        kind: "block",
                        type: "math_constrain",
                        inputs: {
                            VALUE: shadowNumber(),
                            LOW: shadowNumber(0),
                            HIGH: shadowNumber(100),
                        },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: "math_single",
                        inputs: { NUM: shadowNumber() },
                    },
                    {
                        kind: "block",
                        type: "math_trig",
                        inputs: { NUM: shadowNumber() },
                    },
                    GAP50,
                    {
                        kind: "block",
                        type: "math_number_property",
                        inputs: { NUMBER_TO_CHECK: shadowNumber() },
                    },
                    GAP50,
                    // { kind: "block", type: "logic_boolean" },
                    { kind: "block", type: "math_constant" },
                    // { kind: "block", type: "math_number" },
                ],
            },
            /* variables */ {
                kind: CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
                name: "Variables",
                categorystyle: "style_category_variables",
            },
            /* my blocks */ {
                kind: CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
                name: "My Blocks",
                categorystyle: "style_category_my_blocks",
            },
            /* extensions */ {
                kind: "category",
                name: "Extensions",
                categorystyle: "style_category_extensions",
                contents: [
                    ...extensionHeader("Announcement"),
                    {
                        kind: "block",
                        type: BLOCK_ANNOUNCEMENT.type,
                        inputs: {
                            [BLOCK_ANNOUNCEMENT.args0[1].name]:
                                shadowDynamic("# *Hello*"),
                            [BLOCK_ANNOUNCEMENT.args0[2].name]: shadowNumber(3),
                        },
                    },

                    ...extensionHeader("Auras and Emanations"),
                    {
                        kind: "block",
                        type: BLOCK_ADD_AURA.type,
                        inputs: {
                            [BLOCK_ADD_AURA.args0[1].name]: shadowNumber(
                                grid.parsedScale.multiplier,
                            ),
                            [BLOCK_ADD_AURA.args0[2].name]: shadowColor(
                                assumeHexColor("#facade"),
                            ),
                        },
                    },
                    blockToDefinition(BLOCK_REMOVE_AURAS),

                    ...extensionHeader("Bones!"),
                    blockToDefinition(BLOCK_EXTENSION_BONES_ON_ROLL),
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_BONES_ROLL_DICE.type,
                        inputs: {
                            [BLOCK_EXTENSION_BONES_ROLL_DICE.args0[1].name]:
                                shadowDynamic("1d20"),
                        },
                    },

                    ...extensionHeader("Dynamic Fog"),
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_FOG_ADD.type,
                        inputs: {
                            [BLOCK_EXTENSION_FOG_ADD.args0[1].name]:
                                shadowNumber(grid.parsedScale.multiplier),
                        },
                    },
                    blockToDefinition(BLOCK_EXTENSION_FOG_REMOVE),
                    blockToDefinition(BLOCK_EXTENSION_FOG_LIT),

                    ...extensionHeader("Game Master's Daggerheart"),
                    blockToDefinition(BLOCK_EXTENSION_DAGGERHEART_STAT),
                    blockToDefinition(BLOCK_EXTENSION_DAGGERHEART_FEAR),

                    ...extensionHeader("Game Master's Grimoire"),
                    blockToDefinition(BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE),
                    blockToDefinition(BLOCK_EXTENSION_GRIMOIRE_HP),
                    blockToDefinition(BLOCK_EXTENSION_GRIMOIRE_MAX_HP),
                    blockToDefinition(BLOCK_EXTENSION_GRIMOIRE_TEMP_HP),
                    blockToDefinition(BLOCK_EXTENSION_GRIMOIRE_AC),

                    {
                        kind: "label",
                        text: "Google Sheets",
                    },
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_SHEETS_GET.type,
                        inputs: {
                            [BLOCK_EXTENSION_SHEETS_GET.args0[1].name]:
                                shadowDynamic("A1"),
                            [BLOCK_EXTENSION_SHEETS_GET.args0[2].name]:
                                shadowDynamic("Sheet1"),
                            [BLOCK_EXTENSION_SHEETS_GET.args0[3].name]: {
                                shadow: {
                                    type: BLOCK_URL.type,
                                    fields: {
                                        [BLOCK_URL.args0[0].name]:
                                            "https://docs.google.com/spreadsheets/d/1ZVKsRBdWjpWXt9c7cJSI2-EEiUOvBFDbNjmpa8m-9Gw",
                                    },
                                },
                            },
                        },
                    },

                    ...extensionHeader("Hoot"),
                    {
                        kind: "block",
                        type: BLOCK_HOOT.type,
                        inputs: {
                            [BLOCK_HOOT.args0[1].name]: shadowDynamic(),
                            [BLOCK_HOOT.args0[2].name]: shadowDynamic(),
                        },
                    },

                    ...extensionHeader("Owlbear Codeo"),
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_CODEO_RUN_SCRIPT.type,
                        inputs: {
                            [BLOCK_EXTENSION_CODEO_RUN_SCRIPT.args0[1].name]:
                                shadowDynamic("My New Script"),
                        },
                    },

                    ...extensionHeader("Owl Trackers"),
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD.type,
                        inputs: {
                            [BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD.args0[1]
                                .name]: shadowDynamic("HP"),
                            [BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD.args0[2]
                                .name]: shadowNumber(10),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.type,
                        inputs: {
                            [BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX.args0[1]
                                .name]: shadowDynamic("checkbox"),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_OWL_TRACKERS_FIELD.type,
                        inputs: {
                            [BLOCK_EXTENSION_OWL_TRACKERS_FIELD.args0[1].name]:
                                shadowDynamic("HP"),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX.type,
                        inputs: {
                            [BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX.args0[1]
                                .name]: shadowDynamic("checkbox"),
                        },
                    },

                    ...extensionHeader("Phases Automated"),
                    blockToDefinition(BLOCK_EXTENSION_PHASE_CHANGE),

                    ...extensionHeader("Smoke & Spectre!"),
                    ...(isImage(target)
                        ? [
                              {
                                  kind: "block",
                                  type: BLOCK_EXTENSION_SMOKE_ADD.type,
                                  inputs: {
                                      [BLOCK_EXTENSION_SMOKE_ADD.args0[1].name]:
                                          shadowNumber(
                                              grid.parsedScale.multiplier,
                                          ),
                                  },
                              },
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_REMOVE),
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_VISION),
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_BLIND),
                          ]
                        : []),

                    ...(isCurve(target)
                        ? [
                              blockToDefinition(
                                  BLOCK_EXTENSION_SMOKE_VISION_LINE,
                              ),
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_SWAP),
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_WINDOW),
                              blockToDefinition(BLOCK_WHEN_DOOR),
                              blockToDefinition(BLOCK_EXTENSION_SMOKE_DOOR),
                          ]
                        : []),

                    ...extensionHeader("Rumble!"),
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_RUMBLE_SAY.type,
                        inputs: {
                            [BLOCK_EXTENSION_RUMBLE_SAY.args0[1].name]:
                                shadowDynamic("Hello!"),
                        },
                    },
                    {
                        kind: "block",
                        type: BLOCK_EXTENSION_RUMBLE_ROLL.type,
                        inputs: {
                            [BLOCK_EXTENSION_RUMBLE_ROLL.args0[1].name]:
                                shadowDynamic("1d20"),
                        },
                    },

                    ...extensionHeader("Weather"),
                    blockToDefinition(BLOCK_EXTENSION_WEATHER_ADD),
                    blockToDefinition(BLOCK_EXTENSION_WEATHER_REMOVE),
                    blockToDefinition(BLOCK_EXTENSION_WEATHER_HAS),
                ],
            },
        ],
    };
}
