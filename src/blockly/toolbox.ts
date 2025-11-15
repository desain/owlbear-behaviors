import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    isText,
} from "@owlbear-rodeo/sdk";
import type * as Blockly from "blockly";
import { assumeHexColor, type GridParsed } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import { getText } from "../behaviors/impl/looks";
import {
    CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
    CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
    INPUT_TAG,
} from "../constants";
import { CharacterDistances } from "../extensions/CharacterDistances";
import { usePlayerStorage } from "../state/usePlayerStorage";
import {
    BLOCK_ADD_ATTACHMENT,
    BLOCK_ADD_AURA,
    BLOCK_ADD_AURA_PRESET,
    BLOCK_ANGLE,
    BLOCK_ANNOUNCEMENT,
    BLOCK_ATTACH,
    BLOCK_ATTACHED,
    BLOCK_BROADCAST,
    BLOCK_BROADCAST_TO,
    BLOCK_BROADCAST_TO_TAGGED,
    BLOCK_CENTER_VIEW,
    BLOCK_CENTER_ZOOM,
    BLOCK_CHANGE_EFFECT_BY,
    BLOCK_CHANGE_SIZE,
    BLOCK_CHANGE_SIZE_XY,
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
    BLOCK_EVENT_WHEN_CONTEXT_MENU_CLICKED,
    BLOCK_EXTENSION_BONES_ON_ROLL,
    BLOCK_EXTENSION_BONES_ROLL_DICE,
    BLOCK_EXTENSION_CHARACTER_DISTANCES_GET_HEIGHT,
    BLOCK_EXTENSION_CHARACTER_DISTANCES_SET_HEIGHT,
    BLOCK_EXTENSION_CLASH_HP_CHANGE,
    BLOCK_EXTENSION_CLASH_PROPERTY,
    BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
    BLOCK_EXTENSION_DAGGERHEART_FEAR,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_DICE_PLUS_ROLL,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_FOG_LIT,
    BLOCK_EXTENSION_FOG_REMOVE,
    BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE,
    BLOCK_EXTENSION_GRIMOIRE_ROLL,
    BLOCK_EXTENSION_GRIMOIRE_SET_STAT,
    BLOCK_EXTENSION_GRIMOIRE_STAT,
    BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_SHOW_ON_MAP,
    BLOCK_EXTENSION_PEEKABOO_GET_SOLIDITY,
    BLOCK_EXTENSION_PEEKABOO_SET_SOLIDITY,
    BLOCK_EXTENSION_PHASE_CHANGE_TO,
    BLOCK_EXTENSION_PHASE_CHANGES,
    BLOCK_EXTENSION_PHASE_OF,
    BLOCK_EXTENSION_PRETTY_MY_INITIATIVE,
    BLOCK_EXTENSION_PRETTY_MY_TURN,
    BLOCK_EXTENSION_PRETTY_SET_INITIATIVE,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_SHEETS_GET,
    BLOCK_EXTENSION_SMOKE_ADD,
    BLOCK_EXTENSION_SMOKE_BLIND,
    BLOCK_EXTENSION_SMOKE_DOOR,
    BLOCK_EXTENSION_SMOKE_REMOVE,
    BLOCK_EXTENSION_SMOKE_SWAP,
    BLOCK_EXTENSION_SMOKE_VISION,
    BLOCK_EXTENSION_SMOKE_VISION_LINE,
    BLOCK_EXTENSION_SMOKE_WHEN_DOOR,
    BLOCK_EXTENSION_SMOKE_WINDOW,
    BLOCK_EXTENSION_WEATHER_ADD,
    BLOCK_EXTENSION_WEATHER_HAS,
    BLOCK_EXTENSION_WEATHER_REMOVE,
    BLOCK_FACE,
    BLOCK_FOREVER,
    BLOCK_GET_ACCESSIBILITY_DESCRIPTION,
    BLOCK_GET_ACCESSIBILITY_NAME,
    BLOCK_GET_FILL_COLOR,
    BLOCK_GET_FILL_OPACITY,
    BLOCK_GET_LAYER,
    BLOCK_GET_SIZE,
    BLOCK_GET_SIZE_XY,
    BLOCK_GET_STROKE_COLOR,
    BLOCK_GET_STROKE_OPACITY,
    BLOCK_GET_TEXT,
    BLOCK_GLIDE,
    BLOCK_GLIDE_ROTATE_LEFT,
    BLOCK_GLIDE_ROTATE_RIGHT,
    BLOCK_GOTO,
    BLOCK_GREATER_THAN,
    BLOCK_HAS_ATTACHMENT,
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
    BLOCK_LOOKS_TAKE_IMAGE_FROM,
    BLOCK_MATCH,
    BLOCK_MIN_MAX,
    BLOCK_MOTION_CONSTRAINT,
    BLOCK_MOVE_DIRECTION,
    BLOCK_MULTI_JOIN,
    BLOCK_MY_PARENT,
    BLOCK_PATHFIND,
    BLOCK_POINT_IN_DIRECTION,
    BLOCK_RECEIVE_BROADCAST,
    BLOCK_REMOVE_ATTACHMENT,
    BLOCK_REMOVE_AURAS,
    BLOCK_REMOVE_TAG,
    BLOCK_REPEAT,
    BLOCK_REPEAT_UNTIL,
    BLOCK_REPLACE_IMAGE,
    BLOCK_ROTATE_LEFT,
    BLOCK_ROTATE_RIGHT,
    BLOCK_ROTATION,
    BLOCK_SAY,
    BLOCK_SENSING_ADD_TAGGED_TO_LIST,
    BLOCK_SENSING_OF,
    BLOCK_SENSING_TAG_MENU,
    BLOCK_SET_ACCESSIBILITY_DESCRIPTION,
    BLOCK_SET_ACCESSIBILITY_NAME,
    BLOCK_SET_EFFECT_TO,
    BLOCK_SET_FILL_COLOR,
    BLOCK_SET_FILL_OPACITY,
    BLOCK_SET_FONT_FAMILY,
    BLOCK_SET_FONT_SIZE,
    BLOCK_SET_LAYER,
    BLOCK_SET_SIZE,
    BLOCK_SET_SIZE_XY,
    BLOCK_SET_STROKE_COLOR,
    BLOCK_SET_STROKE_OPACITY,
    BLOCK_SET_TEXT,
    BLOCK_SET_TEXT_COLOR,
    BLOCK_SHOW,
    BLOCK_SNAP_TO_GRID,
    BLOCK_SOUND_CHANGE_VOLUME_BY,
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_SOUND_SET_VOLUME_TO,
    BLOCK_SOUND_STOP_ALL,
    BLOCK_SOUND_VOLUME,
    BLOCK_STOP,
    BLOCK_TAG,
    BLOCK_TOKEN_NAMED,
    BLOCK_TOUCH,
    BLOCK_TOUCHING,
    BLOCK_UNLOCK,
    BLOCK_VISIBLE,
    BLOCK_WAIT,
    BLOCK_WAIT_UNTIL,
    BLOCK_WHEN_I,
    BLOCK_WHEN_I_START_AS_CLONE,
    BLOCK_WHEN_PRETTY_TURN_CHANGE,
    BLOCK_X_POSITION,
    BLOCK_Y_POSITION,
    BLOCK_ZOOM,
} from "./blocks";
import { FieldTokenImage } from "./FieldTokenImage";
import { extensionHeader } from "./getExtensionButton";
import type { MatchBlockExtraState } from "./mutatorMatch";
import {
    shadowBroadcastMenu,
    shadowBroadcastTargetMenu,
    shadowColor,
    shadowDynamic,
    shadowItemMenu,
    shadowNumber,
    shadowOpacitySlider,
    shadowOther,
    shadowSoundMenu,
    shadowTagMenu,
    shadowUrl,
} from "./shadows";

function devOnly<T>(...ts: T[]): T[] {
    return import.meta.env.DEV ? ts : [];
}

function advanced<T>(advanced: T[], basic?: T[]): T[] {
    return usePlayerStorage.getState().useAdvancedBlocks
        ? advanced
        : basic ?? [];
}

function blockInfo(
    block: Pick<Blockly.utils.toolbox.BlockInfo, "type"> & {
        readonly args0?: readonly {
            readonly type: string;
            readonly name?: string;
        }[];
    },
    ...inputShadows: object[]
): Blockly.utils.toolbox.BlockInfo {
    if (inputShadows.length > (block.args0?.length ?? 0)) {
        throw Error("more shadows than args0 inputs");
    }
    const valueInputs = (block.args0 ?? []).filter(
        (input) => input.type === "input_value",
    );
    const inputs =
        inputShadows.length === 0
            ? undefined
            : Object.fromEntries(
                  inputShadows.map((shadow, i) => {
                      const name = valueInputs[i]?.name;
                      if (!name) {
                          throw Error("missing input name");
                      }
                      return [name, shadow];
                  }),
              );
    return {
        kind: "block",
        type: block.type,
        inputs,
    };
}

export const GAP50 = { kind: "sep", gap: 50 } as const;

const SHADOW_TAG_MENU = {
    [INPUT_TAG]: {
        shadow: {
            type: BLOCK_SENSING_TAG_MENU.type,
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
                    blockInfo(BLOCK_ROTATE_RIGHT, shadowNumber(15)),
                    blockInfo(
                        BLOCK_GLIDE_ROTATE_RIGHT,
                        shadowNumber(1),
                        shadowNumber(90),
                    ),
                    blockInfo(BLOCK_ROTATE_LEFT, shadowNumber(15)),
                    blockInfo(
                        BLOCK_GLIDE_ROTATE_LEFT,
                        shadowNumber(1),
                        shadowNumber(90),
                    ),
                    GAP50,
                    {
                        ...blockInfo(
                            BLOCK_MOVE_DIRECTION,
                            shadowNumber(grid.parsedScale.multiplier),
                        ),
                        fields: {
                            [BLOCK_MOVE_DIRECTION.args0[0].name]: "FORWARD",
                            [BLOCK_MOVE_DIRECTION.args0[2].name]: "UNITS",
                        },
                    },
                    blockInfo(
                        BLOCK_GOTO,
                        shadowNumber(Math.round(target.position.x)),
                        shadowNumber(Math.round(target.position.y)),
                    ),
                    blockInfo(
                        BLOCK_GLIDE,
                        shadowNumber(1),
                        shadowNumber(Math.round(target.position.x)),
                        shadowNumber(Math.round(target.position.y)),
                    ),
                    ...devOnly(
                        blockInfo(
                            BLOCK_PATHFIND,
                            shadowNumber(grid.parsedScale.multiplier),
                        ),
                    ),
                    blockInfo(BLOCK_SNAP_TO_GRID),
                    GAP50,
                    blockInfo(BLOCK_POINT_IN_DIRECTION, {
                        shadow: {
                            type: BLOCK_ANGLE.type,
                            fields: {
                                [BLOCK_ANGLE.args0[0].name]:
                                    ((target.rotation % 360) + 360) % 360, // ensure 0-359
                            },
                        },
                    }),
                    blockInfo(BLOCK_FACE),
                    GAP50,
                    blockInfo(BLOCK_ATTACH),
                    blockInfo(BLOCK_DETACH),
                    ...advanced([blockInfo(BLOCK_MOTION_CONSTRAINT)]),
                    GAP50,
                    blockInfo(BLOCK_LOCK),
                    blockInfo(BLOCK_UNLOCK),
                    GAP50,
                    blockInfo(BLOCK_X_POSITION),
                    blockInfo(BLOCK_Y_POSITION),
                    blockInfo(BLOCK_ROTATION),
                    blockInfo(BLOCK_MY_PARENT),
                    blockInfo(BLOCK_LOCKED),
                    blockInfo(BLOCK_ATTACHED),
                ],
            },
            /* looks */ {
                kind: "category",
                name: "Looks",
                categorystyle: "style_category_looks",
                contents: [
                    blockInfo(
                        BLOCK_SAY,
                        shadowDynamic("Hello!"),
                        shadowNumber(2),
                    ),
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
                              ...advanced([
                                  blockInfo(BLOCK_LOOKS_TAKE_IMAGE_FROM),
                              ]),
                              GAP50,
                              blockInfo(BLOCK_ADD_ATTACHMENT),
                              blockInfo(BLOCK_REMOVE_ATTACHMENT),
                          ]
                        : []),
                    GAP50,
                    blockInfo(BLOCK_SET_SIZE, shadowNumber(100)),
                    ...advanced([
                        blockInfo(BLOCK_SET_SIZE_XY, shadowNumber(100)),
                    ]),
                    blockInfo(BLOCK_CHANGE_SIZE, shadowNumber(10)),
                    ...advanced([
                        blockInfo(BLOCK_CHANGE_SIZE_XY, shadowNumber(10)),
                    ]),
                    GAP50,
                    // Only show effects-based blocks for shapes, curves, and paths
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              blockInfo(
                                  BLOCK_CHANGE_EFFECT_BY,
                                  shadowNumber(25),
                              ),
                              blockInfo(BLOCK_SET_EFFECT_TO, shadowNumber(100)),
                              blockInfo(BLOCK_CLEAR_GRAPHIC_EFFECTS),
                              GAP50,
                          ]
                        : []),
                    blockInfo(BLOCK_SHOW),
                    blockInfo(BLOCK_HIDE),
                    GAP50,
                    blockInfo(BLOCK_SET_LAYER, {
                        shadow: {
                            type: BLOCK_LAYER_MENU.type,
                            fields: {
                                [BLOCK_LAYER_MENU.args0[0].name]: target.layer,
                            },
                        },
                    }),
                    GAP50,
                    ...(isImage(target) || isText(target)
                        ? [
                              blockInfo(
                                  BLOCK_SET_TEXT,
                                  shadowDynamic(getText(target)),
                              ),
                              ...advanced([
                                  blockInfo(
                                      BLOCK_SET_FONT_SIZE,
                                      shadowNumber(target.text.style.fontSize),
                                  ),
                                  blockInfo(
                                      BLOCK_SET_TEXT_COLOR,
                                      shadowColor(
                                          assumeHexColor(
                                              target.text.style.fillColor,
                                          ),
                                      ),
                                  ),
                                  {
                                      ...blockInfo(BLOCK_SET_FONT_FAMILY),
                                      fields: {
                                          [BLOCK_SET_FONT_FAMILY.args0[0].name]:
                                              target.text.style.fontFamily,
                                      },
                                  },
                              ]),
                          ]
                        : []),
                    blockInfo(
                        BLOCK_SET_ACCESSIBILITY_NAME,
                        shadowDynamic(target.name),
                    ),
                    blockInfo(
                        BLOCK_SET_ACCESSIBILITY_DESCRIPTION,
                        shadowDynamic(target.description),
                    ),
                    GAP50,
                    // Only show set fill color and fill opacity for shapes, curves, and paths (not lines)
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              blockInfo(
                                  BLOCK_SET_FILL_COLOR,
                                  shadowColor(
                                      assumeHexColor(target.style.fillColor),
                                  ),
                              ),
                              blockInfo(
                                  BLOCK_SET_FILL_OPACITY,
                                  shadowOpacitySlider(
                                      target.style.fillOpacity * 100,
                                  ),
                              ),
                          ]
                        : []),
                    // Only show set stroke color for supported types using OBR type guards
                    ...(isLine(target) ||
                    isShape(target) ||
                    isCurve(target) ||
                    isPath(target)
                        ? [
                              blockInfo(
                                  BLOCK_SET_STROKE_COLOR,
                                  shadowColor(
                                      assumeHexColor(target.style.strokeColor),
                                  ),
                              ),
                              blockInfo(
                                  BLOCK_SET_STROKE_OPACITY,
                                  shadowOpacitySlider(
                                      target.style.strokeOpacity * 100,
                                  ),
                              ),
                              GAP50,
                          ]
                        : []),
                    blockInfo(
                        BLOCK_CENTER_VIEW,
                        shadowNumber(Math.round(target.position.x)),
                        shadowNumber(Math.round(target.position.y)),
                    ),
                    blockInfo(BLOCK_ZOOM, shadowNumber(100)),
                    blockInfo(
                        BLOCK_CENTER_ZOOM,
                        shadowNumber(100),
                        shadowNumber(Math.round(target.position.x)),
                        shadowNumber(Math.round(target.position.y)),
                    ),
                    GAP50,
                    // Only show fill getters for items that support fill setters
                    ...(isShape(target) || isCurve(target) || isPath(target)
                        ? [
                              blockInfo(BLOCK_GET_FILL_COLOR),
                              blockInfo(BLOCK_GET_FILL_OPACITY),
                          ]
                        : []),
                    // Only show stroke getters for items that support stroke setters
                    ...(isLine(target) ||
                    isShape(target) ||
                    isCurve(target) ||
                    isPath(target)
                        ? [
                              blockInfo(BLOCK_GET_STROKE_COLOR),
                              blockInfo(BLOCK_GET_STROKE_OPACITY),
                          ]
                        : []),
                    blockInfo(BLOCK_GET_SIZE),
                    ...advanced([blockInfo(BLOCK_GET_SIZE_XY)]),
                    blockInfo(BLOCK_GET_LAYER),
                    ...(isImage(target) || isText(target)
                        ? [blockInfo(BLOCK_GET_TEXT)]
                        : []),
                    blockInfo(BLOCK_GET_ACCESSIBILITY_NAME),
                    blockInfo(BLOCK_GET_ACCESSIBILITY_DESCRIPTION),
                    blockInfo(BLOCK_HAS_ATTACHMENT),
                    blockInfo(BLOCK_VISIBLE),
                ],
            },
            /* sound */ {
                kind: "category",
                name: "Sound",
                categorystyle: "style_category_sound",
                contents: [
                    blockInfo(BLOCK_SOUND_PLAY, shadowSoundMenu()),
                    blockInfo(BLOCK_SOUND_PLAY_UNTIL_DONE, shadowSoundMenu()),
                    blockInfo(BLOCK_SOUND_STOP_ALL),
                    GAP50,
                    blockInfo(BLOCK_SOUND_CHANGE_VOLUME_BY, shadowNumber(-10)),
                    blockInfo(BLOCK_SOUND_SET_VOLUME_TO, shadowNumber(100)),
                    blockInfo(BLOCK_SOUND_VOLUME),
                ],
            },
            /* events */ {
                kind: "category",
                name: "Events",
                categorystyle: "style_category_events",
                contents: [
                    blockInfo(BLOCK_IMMEDIATELY),
                    blockInfo(BLOCK_WHEN_I),
                    blockInfo(BLOCK_RECEIVE_BROADCAST),
                    ...advanced(
                        [
                            blockInfo(
                                BLOCK_BROADCAST_TO,
                                shadowBroadcastMenu(),
                                shadowBroadcastTargetMenu(),
                            ),
                            blockInfo(
                                BLOCK_BROADCAST_TO_TAGGED,
                                shadowBroadcastMenu(),
                                shadowTagMenu("events"),
                            ),
                        ],
                        [blockInfo(BLOCK_BROADCAST, shadowBroadcastMenu())],
                    ),
                    blockInfo(BLOCK_TOUCH, shadowOther()),
                    blockInfo(BLOCK_EVENT_WHEN_CONTEXT_MENU_CLICKED),
                ],
            },
            /* control */ {
                kind: "category",
                name: "Control",
                categorystyle: "style_category_control",
                contents: [
                    blockInfo(BLOCK_WAIT, shadowNumber(1)),
                    GAP50,
                    blockInfo(BLOCK_REPEAT, shadowNumber(5)),
                    blockInfo(BLOCK_FOREVER),
                    GAP50,
                    ...advanced<Blockly.utils.toolbox.BlockInfo>(
                        [
                            // {
                            //     kind: "block",
                            //     type: "controls_if",
                            // },
                            {
                                ...blockInfo(
                                    BLOCK_MATCH,
                                    shadowDynamic("apple"),
                                ),
                                extraState: {
                                    cases: [
                                        {
                                            exact: "apple",
                                        },
                                    ],
                                    default: false,
                                } satisfies MatchBlockExtraState,
                            },
                        ],
                        [blockInfo(BLOCK_IF), blockInfo(BLOCK_IF_ELSE)],
                    ),

                    blockInfo(BLOCK_WAIT_UNTIL),
                    blockInfo(BLOCK_REPEAT_UNTIL),
                    GAP50,
                    blockInfo(BLOCK_STOP),
                    GAP50,
                    blockInfo(BLOCK_WHEN_I_START_AS_CLONE),
                    blockInfo(BLOCK_CREATE_CLONE_OF, shadowItemMenu("control")),
                    blockInfo(BLOCK_DELETE_THIS),
                ],
            },
            /* events */ {
                kind: "category",
                name: "Sensing",
                categorystyle: "style_category_sensing",
                contents: [
                    blockInfo(BLOCK_TOUCHING),
                    blockInfo(BLOCK_DISTANCE_TO),
                    GAP50,
                    {
                        ...blockInfo(BLOCK_TAG),
                        inputs: {
                            [BLOCK_TAG.args0[0].name]:
                                shadowItemMenu("sensing"),
                            ...SHADOW_TAG_MENU,
                        },
                    },
                    {
                        ...blockInfo(BLOCK_REMOVE_TAG),
                        inputs: {
                            [BLOCK_REMOVE_TAG.args0[0].name]:
                                shadowItemMenu("sensing"),
                            ...SHADOW_TAG_MENU,
                        },
                    },
                    {
                        ...blockInfo(BLOCK_SENSING_ADD_TAGGED_TO_LIST),
                        inputs: SHADOW_TAG_MENU,
                    },
                    {
                        ...blockInfo(BLOCK_HAS_TAG_SELF),
                        inputs: SHADOW_TAG_MENU,
                    },
                    {
                        ...blockInfo(BLOCK_HAS_TAG_OTHER),
                        inputs: SHADOW_TAG_MENU,
                    },
                    {
                        ...blockInfo(BLOCK_CLOSEST_TAGGED),
                        inputs: SHADOW_TAG_MENU,
                    },
                    blockInfo(BLOCK_TOKEN_NAMED, shadowDynamic("Token Name")),
                    GAP50,
                    blockInfo(BLOCK_DESELECT),
                    GAP50,
                    blockInfo(BLOCK_SENSING_OF, shadowItemMenu("sensing")),
                    GAP50,
                    blockInfo(BLOCK_CURRENT_TIME),
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
                    blockInfo(
                        BLOCK_GREATER_THAN,
                        shadowDynamic(),
                        shadowDynamic(),
                    ),
                    blockInfo(
                        BLOCK_LESS_THAN,
                        shadowDynamic(),
                        shadowDynamic(),
                    ),
                    blockInfo(BLOCK_EQUALS, shadowDynamic(), shadowDynamic()),
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
                    ...advanced(devOnly(blockInfo(BLOCK_MULTI_JOIN))),
                    blockInfo(
                        BLOCK_LETTER_OF,
                        shadowNumber(1),
                        shadowDynamic("apple"),
                    ),
                    {
                        kind: "block",
                        type: "text_length",
                        inputs: {
                            VALUE: shadowDynamic("apple"),
                        },
                    },
                    blockInfo(
                        BLOCK_CONTAINS,
                        shadowDynamic("apple"),
                        shadowDynamic("a"),
                    ),
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
                    blockInfo(BLOCK_MIN_MAX, shadowNumber(1), shadowNumber(10)),
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
                    { kind: "block", type: "logic_boolean" },
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
                    blockInfo(
                        BLOCK_ANNOUNCEMENT,
                        shadowDynamic("# *Hello*"),
                        shadowNumber(3),
                    ),
                    ...extensionHeader("Auras and Emanations"),
                    blockInfo(
                        BLOCK_ADD_AURA,
                        shadowNumber(1),
                        shadowColor(assumeHexColor("#facade")),
                    ),
                    blockInfo(
                        BLOCK_ADD_AURA_PRESET,
                        shadowDynamic("Faerie Fire"),
                    ),
                    blockInfo(BLOCK_REMOVE_AURAS),

                    ...extensionHeader("Bones!"),
                    blockInfo(BLOCK_EXTENSION_BONES_ON_ROLL),
                    blockInfo(
                        BLOCK_EXTENSION_BONES_ROLL_DICE,
                        shadowDynamic("1d20"),
                    ),

                    ...(isImage(target)
                        ? [
                              ...extensionHeader("Character Distances"),
                              blockInfo(
                                  BLOCK_EXTENSION_CHARACTER_DISTANCES_SET_HEIGHT,
                                  shadowNumber(
                                      CharacterDistances.getHeight(target),
                                  ),
                              ),
                              blockInfo(
                                  BLOCK_EXTENSION_CHARACTER_DISTANCES_GET_HEIGHT,
                              ),
                          ]
                        : []),

                    ...extensionHeader("Clash!"),
                    blockInfo(BLOCK_EXTENSION_CLASH_HP_CHANGE),
                    blockInfo(BLOCK_EXTENSION_CLASH_PROPERTY),

                    ...extensionHeader("Dice+"),
                    blockInfo(
                        BLOCK_EXTENSION_DICE_PLUS_ROLL,
                        shadowDynamic("1d20"),
                    ),

                    ...extensionHeader("Dynamic Fog"),
                    blockInfo(
                        BLOCK_EXTENSION_FOG_ADD,
                        shadowNumber(grid.parsedScale.multiplier),
                    ),
                    blockInfo(BLOCK_EXTENSION_FOG_REMOVE),
                    blockInfo(BLOCK_EXTENSION_FOG_LIT),

                    ...extensionHeader("Game Master's Daggerheart"),
                    blockInfo(BLOCK_EXTENSION_DAGGERHEART_STAT),
                    blockInfo(BLOCK_EXTENSION_DAGGERHEART_FEAR),

                    ...extensionHeader("Game Master's Grimoire"),
                    blockInfo(BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE),
                    blockInfo(
                        BLOCK_EXTENSION_GRIMOIRE_SET_STAT,
                        shadowNumber(10),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_GRIMOIRE_ROLL,
                        shadowDynamic("1d20"),
                    ),
                    blockInfo(BLOCK_EXTENSION_GRIMOIRE_STAT),

                    {
                        kind: "label",
                        text: "Google Sheets",
                    },
                    blockInfo(
                        BLOCK_EXTENSION_SHEETS_GET,
                        shadowDynamic("A1"),
                        shadowDynamic("Sheet1"),
                        shadowUrl(
                            "https://docs.google.com/spreadsheets/d/1ZVKsRBdWjpWXt9c7cJSI2-EEiUOvBFDbNjmpa8m-9Gw",
                        ),
                    ),

                    ...extensionHeader("Hoot"),
                    blockInfo(BLOCK_HOOT, shadowDynamic(), shadowDynamic()),

                    ...extensionHeader("Owlbear Codeo"),
                    blockInfo(
                        BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
                        shadowDynamic("My New Script"),
                    ),

                    ...extensionHeader("Owl Trackers"),
                    blockInfo(
                        BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
                        shadowDynamic("HP"),
                        shadowNumber(10),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
                        shadowDynamic("checkbox"),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_OWL_TRACKERS_SET_SHOW_ON_MAP,
                        shadowDynamic("HP"),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
                        shadowDynamic("HP"),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
                        shadowDynamic("checkbox"),
                    ),

                    ...(isCurve(target) ||
                    isShape(target) ||
                    isLine(target) ||
                    isPath(target)
                        ? [
                              ...extensionHeader("Peekaboo"),
                              blockInfo(
                                  BLOCK_EXTENSION_PEEKABOO_SET_SOLIDITY,
                                  shadowNumber(50),
                              ),
                              blockInfo(BLOCK_EXTENSION_PEEKABOO_GET_SOLIDITY),
                          ]
                        : []),

                    ...extensionHeader("Phases Automated"),
                    blockInfo(BLOCK_EXTENSION_PHASE_CHANGE_TO),
                    blockInfo(BLOCK_EXTENSION_PHASE_CHANGES),
                    blockInfo(
                        BLOCK_EXTENSION_PHASE_OF,
                        shadowDynamic("Automation 1"),
                    ),

                    ...extensionHeader("Pretty Sordid"),
                    blockInfo(BLOCK_WHEN_PRETTY_TURN_CHANGE),
                    blockInfo(
                        BLOCK_EXTENSION_PRETTY_SET_INITIATIVE,
                        shadowNumber(10),
                    ),
                    blockInfo(BLOCK_EXTENSION_PRETTY_MY_INITIATIVE),
                    blockInfo(BLOCK_EXTENSION_PRETTY_MY_TURN),

                    ...extensionHeader("Smoke & Spectre!"),
                    ...(isImage(target)
                        ? [
                              blockInfo(
                                  BLOCK_EXTENSION_SMOKE_ADD,
                                  shadowNumber(grid.parsedScale.multiplier),
                              ),
                              blockInfo(BLOCK_EXTENSION_SMOKE_REMOVE),
                              blockInfo(BLOCK_EXTENSION_SMOKE_BLIND),
                              blockInfo(BLOCK_EXTENSION_SMOKE_VISION),
                          ]
                        : []),

                    ...(isCurve(target)
                        ? [
                              blockInfo(BLOCK_EXTENSION_SMOKE_WHEN_DOOR),
                              blockInfo(BLOCK_EXTENSION_SMOKE_VISION_LINE),
                              blockInfo(BLOCK_EXTENSION_SMOKE_SWAP),
                              blockInfo(BLOCK_EXTENSION_SMOKE_WINDOW),
                              blockInfo(BLOCK_EXTENSION_SMOKE_DOOR),
                          ]
                        : []),

                    ...extensionHeader("Rumble!"),
                    blockInfo(
                        BLOCK_EXTENSION_RUMBLE_SAY,
                        shadowDynamic("Hello!"),
                    ),
                    blockInfo(
                        BLOCK_EXTENSION_RUMBLE_ROLL,
                        shadowDynamic("1d20"),
                    ),

                    ...extensionHeader("Weather"),
                    blockInfo(BLOCK_EXTENSION_WEATHER_ADD),
                    blockInfo(BLOCK_EXTENSION_WEATHER_REMOVE),
                    blockInfo(BLOCK_EXTENSION_WEATHER_HAS),
                ],
            },
        ],
    };
}
