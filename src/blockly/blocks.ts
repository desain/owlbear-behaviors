import { Mode } from "@blockly/field-angle";

import repeat from "../../assets/repeat.svg";
import rotateLeft from "../../assets/rotate-left.svg";
import rotateRight from "../../assets/rotate-right.svg";

import {
    EXTENSION_BROADCAST,
    EXTENSION_SOUND,
    EXTENSION_STOP,
    EXTENSION_TAG,
    EXTENSION_URL,
    FIELD_ARGUMENT_EDITOR_TEXT,
    INPUT_BROADCAST,
    INPUT_SOUND,
    INPUT_TAG,
    MIXIN_DRAG_TO_DUPE,
    MUTATOR_MATCH,
    VARIABLE_TYPE_LIST,
} from "../constants";
import type { BLOCK_TYPE_ARGUMENT_REPORTER } from "./procedures/blockArgumentReporter";
import type { BLOCK_TYPE_CALL } from "./procedures/blockCall";
import type { BLOCK_TYPE_DEFINE } from "./procedures/blockDefine";

// Motion
export const BLOCK_GLIDE = {
    style: "motion_blocks",
    type: "motion_glidesecstoxy",
    tooltip: "Smoothly move",
    message0: "glide %1 secs to x: %2 y: %3",
    args0: [
        {
            type: "input_value",
            name: "DURATION",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "X",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "Y",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GLIDE_ROTATE_LEFT = {
    style: "motion_blocks",
    type: "motion_glide_turnleft",
    tooltip: "Smoothly turn this token to the left",
    message0: "glide %1 secs %2 %3 degrees",
    args0: [
        {
            type: "input_value",
            name: "DURATION",
            check: ["Number", "String"],
        },
        {
            type: "field_image",
            src: window.location.origin + rotateLeft,
            width: 24,
            height: 24,
        },
        {
            type: "input_value",
            name: "DEGREES",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GLIDE_ROTATE_RIGHT = {
    style: "motion_blocks",
    type: "motion_glide_turnright",
    tooltip: "Smoothly turn this token to the right",
    message0: "glide %1 secs %2 %3 degrees",
    args0: [
        {
            type: "input_value",
            name: "DURATION",
            check: ["Number", "String"],
        },
        {
            type: "field_image",
            src: window.location.origin + rotateRight,
            width: 24,
            height: 24,
        },
        {
            type: "input_value",
            name: "DEGREES",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GOTO = {
    style: "motion_blocks",
    type: "motion_gotoxy",
    tooltip: "Jump immediately to a position",
    message0: "go to x: %1 y: %2",
    args0: [
        {
            type: "input_value",
            name: "X",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "Y",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_MOVE_DIRECTION = {
    style: "motion_blocks",
    type: "motion_move_direction",
    tooltip: "Move in a specified direction",
    message0: "go %1 %2 %3",
    args0: [
        {
            type: "field_grid_dropdown",
            name: "DIRECTION",
            options: [
                ["↖️", "NORTHWEST"],
                ["⬆️", "NORTH"],
                ["↗️", "NORTHEAST"],
                ["⬅️", "WEST"],
                ["⏩", "FORWARD"],
                ["➡️", "EAST"],
                ["↙️", "SOUTHWEST"],
                ["⬇️", "SOUTH"],
                ["↘️", "SOUTHEAST"],
            ],
        },
        {
            type: "input_value",
            name: "AMOUNT",
            check: ["Number", "String"],
        },
        {
            type: "field_dropdown",
            name: "UNITS",
            options: [
                ["%{BKY_OBR_GRID_UNIT}", "UNITS"],
                ["cells", "CELLS"],
                ["px", "PIXELS"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_X_POSITION = {
    style: "motion_blocks",
    type: "motion_xposition",
    tooltip: "X position of the current token",
    message0: "x position",
    output: "Number",
} as const;

export const BLOCK_Y_POSITION = {
    style: "motion_blocks",
    type: "motion_yposition",
    tooltip: "Y position of the current token",
    message0: "y position",
    output: "Number",
} as const;

export const BLOCK_ATTACH = {
    style: "motion_blocks",
    type: "motion_attach",
    tooltip: "Attach this token to another item",
    message0: "attach to %1",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: "ItemId",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_DETACH = {
    style: "motion_blocks",
    type: "motion_detach",
    tooltip: "Detach this token from its parent",
    message0: "detach",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_MY_PARENT = {
    style: "motion_blocks",
    type: "motion_my_parent",
    tooltip: "The parent item that this token is attached to",
    message0: "my parent",
    output: "ItemId",
} as const;

export const BLOCK_ATTACHED = {
    style: "motion_blocks",
    type: "motion_attached",
    tooltip: "Whether this token is attached to a parent token",
    message0: "attached?",
    output: "Boolean",
} as const;

export const BLOCK_LOCK = {
    style: "motion_blocks",
    type: "looks_lock",
    tooltip: "Lock this token in place",
    message0: "lock",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_UNLOCK = {
    style: "motion_blocks",
    type: "looks_unlock",
    tooltip: "Unlock this token so it can be moved",
    message0: "unlock",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_LOCKED = {
    style: "motion_blocks",
    type: "looks_locked",
    tooltip: "Whether this token is locked",
    message0: "locked?",
    output: "Boolean",
} as const;

export const BLOCK_ROTATE_LEFT = {
    style: "motion_blocks",
    type: "motion_turnleft",
    tooltip: "Rotate this token to the left",
    message0: "turn %1 %2 degrees",
    args0: [
        {
            type: "field_image",
            src: window.location.origin + rotateLeft,
            width: 24,
            height: 24,
        },
        {
            type: "input_value",
            name: "DEGREES",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_ROTATE_RIGHT = {
    style: "motion_blocks",
    type: "motion_turnright",
    tooltip: "Rotate this token to the right",
    message0: "turn %1 %2 degrees",
    args0: [
        {
            type: "field_image",
            src: window.location.origin + rotateRight,
            width: 24,
            height: 24,
        },
        {
            type: "input_value",
            name: "DEGREES",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_ROTATION = {
    style: "motion_blocks",
    type: "motion_direction",
    tooltip: "Rotation of the current token",
    message0: "rotation",
    output: "Number",
} as const;

export const BLOCK_POINT_IN_DIRECTION = {
    style: "motion_blocks",
    type: "motion_pointindirection",
    tooltip: "Set the rotation of the current direction",
    message0: "point in direction %1",
    args0: [
        {
            type: "input_value",
            name: "DIRECTION",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_FACE = {
    style: "motion_blocks",
    type: "motion_pointtowards",
    tooltip: "Turn to face another token",
    message0: "point towards %1",
    args0: [
        {
            type: "input_value",
            name: "TARGET",
            check: "ItemId",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_ANGLE = {
    style: "motion_blocks",
    type: "math_angle",
    message0: "%1",
    args0: [
        {
            type: "field_angle",
            name: "NUM",
            mode: Mode.COMPASS,
        },
    ],
    output: "Number",
} as const;

export const BLOCK_SNAP_TO_GRID = {
    style: "motion_blocks",
    type: "motion_snap",
    tooltip: "Snap this token's position to the grid",
    message0: "snap to grid",
    previousStatement: null,
    nextStatement: null,
} as const;

// Looks
export const BLOCK_SHOW = {
    style: "looks_blocks",
    type: "looks_show",
    tooltip: "Make this token visible",
    message0: "show",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_HIDE = {
    style: "looks_blocks",
    type: "looks_hide",
    tooltip: "Make this token invisible",
    message0: "hide",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_SAY = {
    style: "looks_blocks",
    type: "looks_sayforsecs",
    tooltip: "Display a message above the token",
    message0: "say %1 for %2 seconds",
    args0: [
        {
            type: "input_value",
            name: "MESSAGE",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "SECS",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SET_SIZE = {
    style: "looks_blocks",
    type: "looks_setsizeto",
    tooltip: "Set the size of this token as a percentage of its original size",
    message0: "set size to %1 %%",
    args0: [
        {
            type: "input_value",
            name: "SIZE",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_CHANGE_SIZE = {
    style: "looks_blocks",
    type: "looks_changesizeby",
    tooltip:
        "Change the size of this token by a percentage of its original size",
    message0: "change size by %1 %%",
    args0: [
        {
            type: "input_value",
            name: "CHANGE",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GET_SIZE = {
    style: "looks_blocks",
    type: "looks_size",
    tooltip:
        "Get the current size of this token as a percentage of its original size",
    message0: "size",
    output: "Number",
} as const;

export const BLOCK_VISIBLE = {
    style: "looks_blocks",
    type: "looks_visible",
    tooltip: "Check if this token is visible",
    message0: "visible?",
    output: "Boolean",
} as const;

export const BLOCK_REPLACE_IMAGE = {
    style: "looks_blocks",
    type: "looks_replace_image",
    tooltip: "Change the token image",
    message0: "replace image with %1",
    args0: [
        {
            type: "field_token_image",
            name: "IMAGE",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GET_TEXT = {
    style: "looks_blocks",
    type: "looks_get_label",
    tooltip: "Get the text of this token (or name if it's not an image)",
    message0: "text",
    output: "String",
} as const;

export const BLOCK_SET_TEXT = {
    style: "looks_blocks",
    type: "looks_set_label",
    tooltip: "Set the text of this token (or name if it's not an image)",
    message0: "set text to %1",
    args0: [
        {
            type: "input_value",
            name: "LABEL",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GET_LAYER = {
    style: "looks_blocks",
    type: "looks_get_layer",
    tooltip: "Get the current layer of this token",
    message0: "layer",
    output: "String",
} as const;

export const BLOCK_SET_LAYER = {
    style: "looks_blocks",
    type: "looks_set_layer",
    tooltip: "Set the layer of this token",
    message0: "go to %1 layer",
    args0: [
        {
            type: "input_value",
            name: "LAYER",
            check: "String",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SET_STROKE_COLOR = {
    style: "looks_blocks",
    type: "looks_set_stroke_color",
    tooltip: "Set the stroke color of a line or shape",
    message0: "set stroke color to %1",
    args0: [
        {
            type: "input_value",
            name: "COLOR",
            check: "String",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SET_STROKE_OPACITY = {
    style: "looks_blocks",
    type: "looks_set_stroke_opacity",
    tooltip: "Set the stroke opacity of a line or shape",
    message0: "set stroke opacity to %1%%",
    args0: [
        {
            type: "input_value",
            name: "OPACITY",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SET_FILL_COLOR = {
    style: "looks_blocks",
    type: "looks_set_fill_color",
    tooltip: "Set the fill color of a shape",
    message0: "set fill color to %1",
    args0: [
        {
            type: "input_value",
            name: "COLOUR",
            check: "String",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SET_FILL_OPACITY = {
    style: "looks_blocks",
    type: "looks_set_fill_opacity",
    tooltip: "Set the fill opacity of a shape",
    message0: "set fill opacity to %1%%",
    args0: [
        {
            type: "input_value",
            name: "OPACITY",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_GET_STROKE_COLOR = {
    style: "looks_blocks",
    type: "looks_get_stroke_color",
    tooltip: "Current stroke color of a line or shape",
    message0: "stroke color",
    output: "String",
} as const;

export const BLOCK_GET_STROKE_OPACITY = {
    style: "looks_blocks",
    type: "looks_get_stroke_opacity",
    tooltip: "Current stroke opacity of a line or shape",
    message0: "stroke opacity",
    output: "Number",
} as const;

export const BLOCK_GET_FILL_COLOR = {
    style: "looks_blocks",
    type: "looks_get_fill_color",
    tooltip: "Current fill color of a shape",
    message0: "fill color",
    output: "String",
} as const;

export const BLOCK_GET_FILL_OPACITY = {
    style: "looks_blocks",
    type: "looks_get_fill_opacity",
    tooltip: "Current fill opacity of a shape",
    message0: "fill opacity",
    output: "Number",
} as const;

export const BLOCK_SET_VIEWPORT = {
    style: "looks_blocks",
    type: "looks_set_viewport",
    tooltip: "Center the viewport on specified coordinates",
    message0: "center %1 view on x: %2 y: %3",
    args0: [
        {
            type: "field_dropdown",
            name: "TARGET",
            options: [
                ["my", "MY"],
                ["everyone's", "EVERYONE"],
            ],
        },
        {
            type: "input_value",
            name: "X",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "Y",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_CLEAR_GRAPHIC_EFFECTS = {
    style: "looks_blocks",
    type: "looks_cleargraphiceffects",
    tooltip: "Remove all graphic effects from this token",
    message0: "clear graphic effects",
    previousStatement: null,
    nextStatement: null,
} as const;

export const EFFECT_OPTIONS = [
    ["monochrome", "monochrome"],
    ["invert", "invert"],
] as const;

export const BLOCK_SET_EFFECT_TO = {
    style: "looks_blocks",
    type: "looks_seteffectto",
    tooltip: "Set a visual effect to a specific intensity (0-100%)",
    message0: "set %1 effect to %2",
    args0: [
        {
            type: "field_dropdown",
            name: "EFFECT",
            options: EFFECT_OPTIONS,
        },
        {
            type: "input_value",
            name: "VALUE",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_CHANGE_EFFECT_BY = {
    style: "looks_blocks",
    type: "looks_changeeffectby",
    tooltip: "Change a visual effect intensity by a value (percentage)",
    message0: "change %1 effect by %2",
    args0: [
        {
            type: "field_dropdown",
            name: "EFFECT",
            options: EFFECT_OPTIONS,
        },
        {
            type: "input_value",
            name: "VALUE",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

// Events
export const BLOCK_IMMEDIATELY = {
    style: "event_blocks",
    type: "event_immediately",
    tooltip: "Behavior to execute as soon as this script is saved",
    message0: "immediately",
    nextStatement: null,
} as const;

export const BLOCK_RECEIVE_BROADCAST = {
    style: "event_blocks",
    extensions: [EXTENSION_BROADCAST],
    type: "event_whenbroadcastreceived",
    tooltip: "Runs the blocks below when the specified broadcast fires",
    message0: "when I receive %1",
    args0: [
        {
            type: "input_dummy",
            name: INPUT_BROADCAST,
        },
    ],
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_BROADCAST = {
    style: "event_blocks",
    // extensions: [EXTENSION_BROADCAST],
    type: "event_broadcast",
    tooltip: "Broadcast a message to all tokens",
    message0: "broadcast %1",
    args0: [
        {
            type: "input_value",
            name: INPUT_BROADCAST,
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_WHEN_I = {
    style: "event_blocks",
    type: "event_on_property_change",
    tooltip: "Define what to do whenever this token's properties change",
    message0: "when I %1",
    args0: [
        {
            type: "field_dropdown",
            name: "NEW_VALUE",
            options: [
                ["move", "position"],
                ["rotate", "rotation"],
                ["move between layers", "layer"],
                ["lock", "locked:true"],
                ["unlock", "locked:false"],
                ["show", "visible:true"],
                ["hide", "visible:false"],
                ["attach", "attachedTo:defined"],
                ["detach", "attachedTo:undefined"],
                ["am selected", "SELECTED:true"],
                ["am deselected", "SELECTED:false"],
            ],
        },
    ],
    nextStatement: null,
} as const;

export const BLOCK_TOUCH = {
    style: "event_blocks",
    type: "event_whentouchingobject",
    tooltip: "Define what to do when this token touches another",
    message0: "when I %1 %2",
    args0: [
        {
            type: "field_dropdown",
            name: "TOUCH_STATE",
            options: [
                ["touch", "true"],
                ["stop touching", "false"],
            ],
        },
        {
            type: "input_value",
            name: "OTHER",
            check: "ItemId",
        },
    ],
    nextStatement: null,
} as const;

// Sensing
export const BLOCK_TAG = {
    style: "sensing_blocks",
    type: "sensing_tag",
    tooltip: "Tag a token",
    message0: "tag %1 as %2",
    args0: [
        {
            type: "input_value",
            name: "TARGET",
            check: "ItemId",
        },
        {
            type: "input_value",
            name: INPUT_TAG,
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_REMOVE_TAG = {
    style: "sensing_blocks",
    type: "sensing_remove_tag",
    tooltip: "Remove a tag from a token",
    message0: "untag %1 as %2",
    args0: [
        {
            type: "input_value",
            name: "TARGET",
            check: "ItemId",
        },
        {
            type: "input_value",
            name: INPUT_TAG,
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_HAS_TAG_SELF = {
    style: "sensing_blocks",
    type: "sensing_has_tag_self",
    tooltip: "Whether this token has a tag",
    message0: "I have tag %1 ?",
    args0: [
        {
            type: "input_value",
            name: INPUT_TAG,
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_HAS_TAG_OTHER = {
    style: "sensing_blocks",
    type: "sensing_has_tag_other",
    tooltip: "Whether another token has a tag",
    message0: "%1 has tag %2 ?",
    args0: [
        {
            type: "input_value",
            name: "TARGET",
            check: "ItemId",
        },
        {
            type: "input_value",
            name: INPUT_TAG,
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_CLOSEST_TAGGED = {
    style: "sensing_blocks",
    type: "sensing_closest_tagged",
    tooltip: "Find the closest token with a tag",
    message0: "closest token tagged %1",
    args0: [
        {
            type: "input_value",
            name: INPUT_TAG,
            check: ["String", "Number"],
        },
    ],
    output: "ItemId",
    inputsInline: true,
} as const;

export const BLOCK_DESELECT = {
    style: "sensing_blocks",
    type: "sensing_deselect",
    tooltip: "Deselect this or all tokens",
    message0: "deselect %1",
    args0: [
        {
            type: "field_dropdown",
            name: "TARGET",
            options: [
                ["myself", "THIS"],
                ["everything", "ALL"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_OTHER_SRC = {
    style: "sensing_blocks",
    extensions: [MIXIN_DRAG_TO_DUPE],
    type: "sensing_other_src",
    tooltip: "The token this token is touching (drag to use variable)",
    message0: "other",
    output: "ItemId",
} as const;

export const BLOCK_OTHER = {
    style: "sensing_blocks",
    extensions: [MIXIN_DRAG_TO_DUPE],
    type: "sensing_other_val",
    tooltip: "The token this token is touching",
    message0: "other",
    output: "ItemId",
} as const;

export const BLOCK_SENSING_OF = {
    style: "sensing_blocks",
    type: "sensing_of",
    tooltip: "Get a property value of another item",
    message0: "%1 of %2",
    args0: [
        {
            type: "field_dropdown",
            name: "PROPERTY",
            options: [
                ["x position", "X_POSITION"],
                ["y position", "Y_POSITION"],
                ["rotation", "ROTATION"],
            ],
        },
        {
            type: "input_value",
            name: "ITEM",
            check: "ItemId",
        },
    ],
    output: "Number",
    inputsInline: true,
} as const;

export const BLOCK_DISTANCE_TO = {
    style: "sensing_blocks",
    type: "sensing_distanceto",
    tooltip:
        "Distance to token, in grid units using current measurement system",
    message0: "distance to %1",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: "ItemId",
        },
    ],
    output: "Number",
    inputsInline: true,
} as const;

export const BLOCK_TOUCHING = {
    style: "sensing_blocks",
    type: "sensing_touchingobject",
    tooltip: "Whether this token is touching another token",
    message0: "touching %1 ?",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: "ItemId",
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_CURRENT_TIME = {
    style: "sensing_blocks",
    type: "sensing_current_time",
    tooltip: "Get the current time",
    message0: "current %1",
    args0: [
        {
            type: "field_dropdown",
            name: "UNIT",
            options: [
                ["year", "YEAR"],
                ["month", "MONTH"],
                ["date", "DATE"],
                ["day of week", "DAY_OF_WEEK"],
                ["hour", "HOUR"],
                ["minute", "MINUTE"],
                ["second", "SECOND"],
            ],
        },
    ],
    output: "Number",
    inputsInline: true,
} as const;

// Control
export const BLOCK_WAIT = {
    style: "control_blocks",
    type: "control_wait",
    tooltip: "Pause for the specified duration",
    message0: "wait %1 seconds",
    args0: [
        {
            type: "input_value",
            name: "DURATION",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_STOP = {
    style: "control_blocks",
    type: "control_behavior_stop",
    extensions: [EXTENSION_STOP],
    tooltip: "Stop execution of scripts",
    message0: "stop %1",
    args0: [
        {
            type: "field_dropdown",
            name: "STOP_TARGET",
            options: [
                ["all", "ALL"],
                ["this script", "THIS_SCRIPT"],
                ["other scripts in token", "OTHER_SCRIPTS"],
            ],
        },
    ],
    previousStatement: null,
} as const;

export const BLOCK_IF = {
    style: "control_blocks",
    type: "control_behavior_if",
    tooltip: "%{BKY_CONTROLS_IF_TOOLTIP_1}",
    message0: "if %1 then %2 %3",
    args0: [
        {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
        },
        {
            type: "input_dummy",
        },
        {
            type: "input_statement",
            name: "SUBSTACK",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_IF_ELSE = {
    style: "control_blocks",
    type: "control_behavior_if_else",
    tooltip: "%{BKY_CONTROLS_IF_TOOLTIP_2}",
    helpUrl: "%{BKY_CONTROLS_IF_HELPURL}",
    message0: "%{BKY_CONTROLS_IF_MSG_IF} %1 then",
    message1: "%1",
    message2: "%{BKY_CONTROLS_IF_MSG_ELSE}",
    message3: "%1",
    args0: [
        {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
        },
    ],
    args1: [
        {
            type: "input_statement",
            name: "SUBSTACK",
        },
    ],
    args3: [
        {
            type: "input_statement",
            name: "SUBSTACK2",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_FOREVER = {
    style: "control_blocks",
    type: "control_forever",
    tooltip: "Run statements over and over",
    message0: "forever",
    message1: "%1", // Statement
    message2: "%1", // Icon
    lastDummyAlign2: "RIGHT",
    args1: [
        {
            type: "input_statement",
            name: "SUBSTACK",
        },
    ],
    args2: [
        {
            type: "field_image",
            src: window.location.origin + repeat,
            width: 24,
            height: 24,
            alt: "*",
            flip_rtl: true,
        },
    ],
    previousStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_REPEAT = {
    style: "control_blocks",
    type: "control_repeat",
    tooltip: "%{BKY_CONTROLS_REPEAT_TOOLTIP}",
    helpUrl: "%{BKY_CONTROLS_REPEAT_HELPURL}",
    message0: "%{BKY_CONTROLS_REPEAT_TITLE}",
    message1: "%1", // Statement
    message2: "%1", // Icon
    lastDummyAlign2: "RIGHT",
    args0: [
        {
            type: "input_value",
            name: "TIMES",
            check: ["Number", "String"],
        },
    ],
    args1: [
        {
            type: "input_statement",
            name: "SUBSTACK",
        },
    ],
    args2: [
        {
            type: "field_image",
            src: window.location.origin + repeat,
            width: 24,
            height: 24,
            alt: "*",
            flip_rtl: true,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_WAIT_UNTIL = {
    style: "control_blocks",
    type: "control_wait_until",
    tooltip:
        "Pause this script until the condition is true (checks every second)",
    message0: "wait until %1",
    args0: [
        {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_REPEAT_UNTIL = {
    style: "control_blocks",
    type: "control_repeat_until",
    tooltip: "%{BKY_CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL}",
    helpUrl: "%{BKY_CONTROLS_WHILEUNTIL_HELPURL}",
    message0: "%{BKY_CONTROLS_WHILEUNTIL_OPERATOR_UNTIL} %1",
    message1: "%1", // Statement
    message2: "%1", // Icon
    lastDummyAlign2: "RIGHT",
    args0: [
        {
            type: "input_value",
            name: "CONDITION",
            check: "Boolean",
        },
    ],
    args1: [
        {
            type: "input_statement",
            name: "SUBSTACK",
        },
    ],
    args2: [
        {
            type: "field_image",
            src: window.location.origin + repeat,
            width: 24,
            height: 24,
            alt: "*",
            flip_rtl: true,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_WHEN_I_START_AS_CLONE = {
    style: "control_blocks",
    type: "control_start_as_clone",
    tooltip: "Behavior to execute when this token starts as a clone",
    message0: "when I start as a clone",
    nextStatement: null,
} as const;

export const BLOCK_CREATE_CLONE_OF = {
    style: "control_blocks",
    type: "control_create_clone_of",
    tooltip: "Create a clone of the selected token",
    message0: "create clone of %1",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: "ItemId",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_DELETE_THIS = {
    style: "control_blocks",
    type: "control_delete_this",
    tooltip: "Delete this token",
    message0: "delete this token",
    previousStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_MATCH = {
    style: "control_blocks",
    type: "control_match",
    mutator: MUTATOR_MATCH,
    tooltip:
        "Match a value with various options and execute the blocks under the matching one",
    helpUrl: "https://en.wikipedia.org/wiki/Switch_statement",
    message0: "match %1 with %2",
    args0: [
        {
            type: "input_value",
            name: "VAL",
            check: ["String", "Number"],
        },
        {
            type: "input_end_row",
            name: "WITH",
        },
    ],
    message1: "apple %1",
    args1: [
        {
            type: "input_dummy",
            name: "CASELABEL_0",
        },
    ],
    message2: "%1",
    args2: [
        {
            type: "input_statement",
            name: "CASE_0",
        },
    ],
    message3: "default %1",
    args3: [
        {
            type: "input_dummy",
            name: "DEFAULTNAME",
        },
    ],
    message4: "%1",
    args4: [
        {
            type: "input_statement",
            name: "DEFAULT",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

// Operators
export const BLOCK_JOIN = {
    style: "operators_blocks",
    type: "operator_join",
    tooltip: "Join two values into a text string",
    helpUrl: "%{BKY_TEXT_JOIN_HELPURL}",
    message0: "%{BKY_TEXT_CREATE_JOIN_TITLE_JOIN} %1 %2",
    args0: [
        {
            type: "input_value",
            name: "STRING1",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "STRING2",
            check: ["Number", "String"],
        },
    ],
    output: "String",
    inputsInline: true,
} as const;

/**
 * Block with free input that evaluates to string or
 * number depending on contents.
 */
export const BLOCK_DYNAMIC_VAL = {
    type: "behavior_dynamic_val",
    tooltip: "Text string",
    message0: "%1",
    args0: [
        {
            type: "field_input",
            name: "TEXT",
        },
    ],
    output: ["String", "Number"],
    inputsInline: true,
} as const;

export const BLOCK_URL = {
    type: "behavior_url",
    extensions: [EXTENSION_URL],
    tooltip: "Enter URL",
    message0: "%1",
    args0: [
        {
            type: "field_input",
            name: "URL",
        },
    ],
    output: ["String"],
    inputsInline: true,
} as const;

export const BLOCK_COLOR_PICKER = {
    style: "looks_blocks",
    type: "color_hsv_sliders",
    tooltip: "%{BKY_COLOUR_PICKER_TOOLTIP}",
    helpUrl: "%{BKY_COLOUR_PICKER_HELPURL}",
    message0: "%1",
    args0: [
        {
            type: "field_colour_hsv_sliders",
            name: "COLOR",
        },
    ],
    output: "String",
} as const;

export const BLOCK_OPACITY_SLIDER = {
    style: "looks_blocks",
    type: "looks_opacity_slider",
    tooltip: "Set opacity (0-100%)",
    message0: "%1",
    args0: [
        {
            type: "field_slider",
            name: "OPACITY",
            min: 0,
            max: 100,
            precision: 1,
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EQUALS = {
    style: "operators_blocks",
    type: "operator_equals",
    tooltip: "%{BKY_LOGIC_COMPARE_TOOLTIP_EQ}",
    helpUrl: "%{BKY_LOGIC_COMPARE_HELPURL}",
    message0: "%1 = %2",
    args0: [
        {
            type: "input_value",
            name: "OPERAND1",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "OPERAND2",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_LESS_THAN = {
    style: "operators_blocks",
    type: "operator_lt",
    tooltip: "%{BKY_LOGIC_COMPARE_TOOLTIP_LT}",
    helpUrl: "%{BKY_LOGIC_COMPARE_HELPURL}",
    message0: "%1 < %2",
    args0: [
        {
            type: "input_value",
            name: "OPERAND1",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "OPERAND2",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_GREATER_THAN = {
    style: "operators_blocks",
    type: "operator_gt",
    tooltip: "%{BKY_LOGIC_COMPARE_TOOLTIP_GT}",
    message0: "%1 > %2",
    helpUrl: "%{BKY_LOGIC_COMPARE_HELPURL}",
    args0: [
        {
            type: "input_value",
            name: "OPERAND1",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "OPERAND2",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_LETTER_OF = {
    style: "operators_blocks",
    type: "operator_letter_of",
    tooltip: "Get the letter at a given position in a string (1-based)",
    message0: "letter %1 of %2",
    args0: [
        {
            type: "input_value",
            name: "LETTER",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "STRING",
            check: ["String", "Number"],
        },
    ],
    output: "String",
    inputsInline: true,
} as const;

export const BLOCK_CONTAINS = {
    style: "operators_blocks",
    type: "operator_contains",
    tooltip: "Check if one string of text contains another",
    message0: "%1 contains %2 ?",
    args0: [
        {
            type: "input_value",
            name: "STRING1",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "STRING2",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_SOUND_PLAY = {
    style: "sound_blocks",
    type: "sound_play",
    tooltip:
        "Start playing a sound, and continue immediately to the next block.",
    message0: "start sound %1",
    args0: [
        {
            type: "input_value",
            name: "SOUND",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_SOUND_PLAY_UNTIL_DONE = {
    style: "sound_blocks",
    type: "sound_playuntildone",
    tooltip:
        "Play a sound, and continue to the next block once it's done playing.",
    message0: "play sound %1 until done",
    args0: [
        {
            type: "input_value",
            name: "SOUND",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

// Data
export const BLOCK_VARIABLE_REPORTER = {
    style: "variable_blocks",
    type: "data_variable",
    tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
    message0: "%1",
    args0: [
        {
            type: "field_behavior_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [""],
            defaultType: "",
        },
    ],
    output: ["String", "Number", "ItemId"],
    helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
} as const;

export const BLOCK_VARIABLE_SETTER = {
    style: "variable_blocks",
    type: "data_setvariableto",
    tooltip: "%{BKY_VARIABLES_SET_TOOLTIP}",
    helpUrl: "%{BKY_VARIABLES_SET_HELPURL}",
    message0: "%{BKY_VARIABLES_SET}",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [""],
            defaultType: "",
        },
        {
            type: "input_value",
            name: "VALUE",
            check: ["String", "Number", "ItemId"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_VARIABLE_CHANGE = {
    style: "variable_blocks",
    type: "data_changevariableby",
    tooltip: "Change a variable by a set amount",
    helpUrl: "%{BKY_MATH_CHANGE_HELPURL}",
    message0: "%{BKY_MATH_CHANGE_TITLE}",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [""],
            defaultType: "",
        },
        {
            type: "input_value",
            name: "DELTA",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_REPORTER = {
    style: "list_blocks",
    type: "data_listcontents",
    tooltip: "%{BKY_VARIABLES_GET_TOOLTIP}",
    message0: "%1",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    output: "String",
    helpUrl: "%{BKY_VARIABLES_GET_HELPURL}",
} as const;

export const BLOCK_LIST_ADD = {
    style: "list_blocks",
    type: "data_addtolist",
    tooltip: "%{BKY_LISTS_SET_INDEX_TOOLTIP_INSERT_LAST}",
    message0: "add %1 to %2",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: ["String", "Number"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_DELETE = {
    type: "data_deleteoflist",
    style: "list_blocks",
    tooltip: "%{BKY_LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM}",
    message0: "delete %1 of %2",
    args0: [
        {
            type: "input_value",
            name: "INDEX",
            check: ["Number", "String"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_CLEAR = {
    style: "list_blocks",
    type: "data_deletealloflist",
    tooltip: "Delete all items from a list",
    message0: "delete all of %1",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_INSERT = {
    style: "list_blocks",
    type: "data_insertatlist",
    tooltip: "%{BKY_LISTS_SET_INDEX_TOOLTIP_INSERT_FROM}",
    message0: "insert %1 at %2 of %3",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "INDEX",
            check: ["Number", "String"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_REPLACE = {
    style: "list_blocks",
    type: "data_replaceitemoflist",
    tooltip: "%{BKY_LISTS_SET_INDEX_TOOLTIP_SET_FROM}",
    helpUrl: "%{BKY_LISTS_SET_INDEX_HELPURL}",
    message0: "replace item %1 of %2 with %3",
    args0: [
        {
            type: "input_value",
            name: "INDEX",
            check: ["Number", "String"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
        {
            type: "input_value",
            name: "ITEM",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_LIST_INDEX = {
    style: "list_blocks",
    type: "data_itemoflist",
    tooltip: "Get item at index from list (one-based)",
    message0: "item %1 of %2",
    args0: [
        {
            type: "input_value",
            name: "INDEX",
            check: ["Number", "String"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    output: ["String", "Number"],
    inputsInline: true,
} as const;

export const BLOCK_LIST_INDEX_OF = {
    type: "data_itemnumoflist",
    tooltip:
        "Get index of item in list (one-based). Outputs 0 if item not found",
    message0: "item # of %1 in %2",
    args0: [
        {
            type: "input_value",
            name: "ITEM",
            check: ["String", "Number"],
        },
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    output: "Number",
    style: "list_blocks",
    inputsInline: true,
} as const;

export const BLOCK_LIST_LENGTH = {
    style: "list_blocks",
    type: "data_lengthoflist",
    tooltip: "%{BKY_LISTS_LENGTH_TOOLTIP}",
    helpUrl: "%{BKY_LISTS_LENGTH_HELPURL}",
    message0: "%{BKY_LISTS_LENGTH_TITLE}",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
    ],
    output: "Number",
    inputsInline: true,
} as const;

export const BLOCK_LIST_CONTAINS = {
    type: "data_listcontainsitem",
    tooltip: "Whether list contains item",
    message0: "%1 contains %2 ?",
    args0: [
        {
            type: "field_variable",
            name: "VAR",
            variable: "%{BKY_VARIABLES_DEFAULT_NAME}",
            variableTypes: [VARIABLE_TYPE_LIST],
            defaultType: VARIABLE_TYPE_LIST,
        },
        {
            type: "input_value",
            name: "ITEM",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    style: "list_blocks",
    inputsInline: true,
} as const;

// My Blocks
export const BLOCK_PROCEDURE_PREVIEW = {
    style: "my_blocks",
    type: "procedures_declaration",
    tooltip: "Define your custom block",
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

/**
 * See:
 * https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/blocks_vertical/procedures.js#L954
 */
export const BLOCK_ARGUMENT_EDITOR_STRNUM = {
    style: "my_blocks",
    type: "argument_editor_string_number",
    message0: "%1",
    args0: [
        {
            type: "field_input_removable",
            name: FIELD_ARGUMENT_EDITOR_TEXT,
            text: "foo",
        },
    ],
    output: ["String", "Number"],
    inputsInline: true,
} as const;

export const BLOCK_ARGUMENT_EDITOR_BOOLEAN = {
    style: "my_blocks",
    type: "argument_editor_boolean",
    message0: "%1",
    args0: [
        {
            type: "field_input_removable",
            name: FIELD_ARGUMENT_EDITOR_TEXT,
            text: "bar",
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

// Extensions
export const BLOCK_ANNOUNCEMENT = {
    style: "extension_blocks",
    type: "extension_announcement",
    tooltip: "Show an announcement using the Announcement extension",
    message0: "%1 announce %2 for %3 secs",
    args0: [
        {
            type: "field_image",
            src: "https://announcement.sharkbrain.dev/icons/announcement.svg",
            width: 24,
            height: 24,
            alt: "Announcement extension icon",
        },
        {
            type: "input_value",
            name: "CONTENT",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "DURATION",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_HOOT = {
    style: "extension_blocks",
    type: "extension_hoot_play",
    tooltip: "Play a sound using the Hoot extension",
    message0: "%1 play track %2 from playlist %3",
    args0: [
        {
            type: "field_image",
            src: "https://hoot.armindo.eu/icon.svg",
            width: 24,
            height: 24,
            alt: "Hoot extension icon",
        },
        {
            type: "input_value",
            name: "TRACK",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "PLAYLIST",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_ADD_AURA = {
    style: "extension_blocks",
    type: "extension_auras_add",
    tooltip: "Add an aura using the Auras & Emanations extension",
    message0: "%1 add %2 %{BKY_OBR_GRID_UNIT} %3 %4 aura",
    args0: [
        {
            type: "field_image",
            src: "https://owlbear-emanation.pages.dev/logo.png",
            width: 24,
            height: 24,
            alt: "Auras extension icon",
        },
        {
            type: "input_value",
            name: "RADIUS",
            check: ["Number", "String"],
        },
        {
            type: "input_value",
            name: "COLOR",
            check: "String",
        },
        {
            type: "field_dropdown",
            name: "STYLE",
            options: [
                ["bubble", "Bubble"],
                ["glow", "Glow"],
                ["spirits", "Spirits"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_REMOVE_AURAS = {
    style: "extension_blocks",
    type: "extension_auras_remove",
    tooltip: "Remove all auras from the Auras & Emanations extension",
    message0: "%1 remove auras",
    args0: [
        {
            type: "field_image",
            src: "https://owlbear-emanation.pages.dev/logo.png",
            width: 24,
            height: 24,
            alt: "Auras extension icon",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_FOG_LIT = {
    style: "extension_blocks",
    type: "extension_fog_lit",
    tooltip: "Whether this token has a light from the Dynamic Fog extension",
    message0: "%1 I have a light?",
    args0: [
        {
            type: "field_image",
            src: "https://dynamic-fog.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Dynamic Fog extension icon",
        },
    ],
    output: "Boolean",
} as const;

export const BLOCK_EXTENSION_FOG_ADD = {
    style: "extension_blocks",
    type: "extension_fog_add",
    tooltip: "Add a light using the Dynamic Fog extension",
    message0: "%1 add %2 %{BKY_OBR_GRID_UNIT} %3 light",
    args0: [
        {
            type: "field_image",
            src: "https://dynamic-fog.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Dynamic Fog extension icon",
        },
        {
            type: "input_value",
            name: "RADIUS",
            check: ["Number", "String"],
        },
        {
            type: "field_dropdown",
            name: "SHAPE",
            options: [
                ["circle", "circle"],
                ["cone", "cone"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_FOG_REMOVE = {
    style: "extension_blocks",
    type: "extension_fog_remove",
    tooltip: "Remove Dynamic Fog light from this token",
    message0: "%1 remove light",
    args0: [
        {
            type: "field_image",
            src: "https://dynamic-fog.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Dynamic Fog extension icon",
        },
    ],
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_EXTENSION_SMOKE_VISION = {
    style: "extension_blocks",
    type: "extension_smoke_vision",
    tooltip:
        "Whether this token has vision from the Smoke and Spectre extension",
    message0: "%1 I have vision?",
    args0: [
        {
            type: "field_image",
            src: "https://smoke.battle-system.com/icon.svg",
            width: 24,
            height: 24,
            alt: "Smoke and Spectre extension icon",
        },
    ],
    output: "Boolean",
} as const;

export const BLOCK_EXTENSION_SMOKE_ADD = {
    style: "extension_blocks",
    type: "extension_smoke_add",
    tooltip: "Add vision using the Smoke and Spectre extension",
    message0: "%1 add %2 %{BKY_OBR_GRID_UNIT} %3 vision",
    args0: [
        {
            type: "field_image",
            src: "https://smoke.battle-system.com/icon.svg",
            width: 24,
            height: 24,
            alt: "Smoke and Spectre extension icon",
        },
        {
            type: "input_value",
            name: "RADIUS",
            check: ["Number", "String"],
        },
        {
            type: "field_dropdown",
            name: "SHAPE",
            options: [
                ["circle", "circle"],
                ["cone", "cone"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_SMOKE_REMOVE = {
    style: "extension_blocks",
    type: "extension_smoke_remove",
    tooltip: "Disable Smoke and Spectre vision from this token",
    message0: "%1 disable vision",
    args0: [
        {
            type: "field_image",
            src: "https://smoke.battle-system.com/icon.svg",
            width: 24,
            height: 24,
            alt: "Smoke and Spectre extension icon",
        },
    ],
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_EXTENSION_GRIMOIRE_HP = {
    style: "extension_blocks",
    type: "extension_grimoire_hp",
    tooltip: "Get current HP from Game Master's Grimoire extension",
    message0: "%1 my HP",
    args0: [
        {
            type: "field_image",
            src: "https://hp-tracker.bitperfect-software.com/GMG.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Grimoire extension icon",
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_GRIMOIRE_MAX_HP = {
    style: "extension_blocks",
    type: "extension_grimoire_max_hp",
    tooltip: "Get maximum HP from Game Master's Grimoire extension",
    message0: "%1 my max HP",
    args0: [
        {
            type: "field_image",
            src: "https://hp-tracker.bitperfect-software.com/GMG.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Grimoire extension icon",
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_GRIMOIRE_TEMP_HP = {
    style: "extension_blocks",
    type: "extension_grimoire_temp_hp",
    tooltip: "Get temporary HP from Game Master's Grimoire extension",
    message0: "%1 my temp HP",
    args0: [
        {
            type: "field_image",
            src: "https://hp-tracker.bitperfect-software.com/GMG.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Grimoire extension icon",
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_GRIMOIRE_AC = {
    style: "extension_blocks",
    type: "extension_grimoire_ac",
    tooltip: "Get armor class from Game Master's Grimoire extension",
    message0: "%1 my AC",
    args0: [
        {
            type: "field_image",
            src: "https://hp-tracker.bitperfect-software.com/GMG.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Grimoire extension icon",
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE = {
    style: "extension_blocks",
    type: "extension_grimoire_hp_change",
    tooltip:
        "Runs the blocks below when this token's HP changes in the Game Master's Grimoire extension",
    message0: "%1 when my HP changes",
    args0: [
        {
            type: "field_image",
            src: "https://hp-tracker.bitperfect-software.com/GMG.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Grimoire extension icon",
        },
    ],
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_RUMBLE_SAY = {
    style: "extension_blocks",
    type: "extension_rumble_say",
    tooltip: "Send a chat message using the Rumble! extension",
    message0: "%1 say %2 %3",
    args0: [
        {
            type: "field_image",
            src: "https://rumble.battle-system.com/logo.png",
            width: 24,
            height: 24,
            alt: "Rumble! extension icon",
        },
        {
            type: "input_value",
            name: "MESSAGE",
            check: ["String", "Number"],
        },
        {
            type: "field_dropdown",
            name: "TARGET",
            options: [
                ["to party", "false"],
                ["to GM", "true"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_RUMBLE_ROLL = {
    style: "extension_blocks",
    type: "extension_rumble_roll",
    tooltip: "Roll dice using the Rumble! extension",
    message0: "%1 roll %2",
    args0: [
        {
            type: "field_image",
            src: "https://rumble.battle-system.com/logo.png",
            width: 24,
            height: 24,
            alt: "Rumble! extension icon",
        },
        {
            type: "input_value",
            name: "NOTATION",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_DAGGERHEART_STAT = {
    style: "extension_blocks",
    type: "extension_daggerheart_stat",
    tooltip:
        "Get a Daggerheart stat from the Game Master's Daggerheart extension",
    message0: "%1 my %2",
    args0: [
        {
            type: "field_image",
            src: "https://gmd.tabletop-almanac.com/GMD_color.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Daggerheart extension icon",
        },
        {
            type: "field_dropdown",
            name: "STAT",
            options: [
                ["HP", "hp_current"],
                ["Max HP", "hp_max"],
                "separator",
                ["Stress", "stress_current"],
                ["Max Stress", "stress_max"],
                "separator",
                ["Armor", "armor_current"],
                ["Max Armor", "armor_max"],
                "separator",
                ["Hope", "hope"],
                "separator",
                ["Evasion", "evasion"],
                ["Major Damage Threshold", "threshold_major"],
                ["Severe Damage Threshold", "threshold_severe"],
                "separator",
                ["Agility", "agility"],
                ["Strength", "strength"],
                ["Finesse", "finesse"],
                ["Instinct", "instinct"],
                ["Presence", "presence"],
                ["Knowledge", "knowledge"],
                // ["Spotlight", "spotlight"],
            ],
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_DAGGERHEART_FEAR = {
    style: "extension_blocks",
    type: "extension_daggerheart_fear",
    tooltip:
        "Get the current Fear value from the Game Master's Daggerheart extension",
    message0: "%1 fear",
    args0: [
        {
            type: "field_image",
            src: "https://gmd.tabletop-almanac.com/GMD_color.svg",
            width: 24,
            height: 24,
            alt: "Game Master's Daggerheart extension icon",
        },
    ],
    output: "Number",
} as const;

export const BLOCK_EXTENSION_OWL_TRACKERS_FIELD = {
    style: "extension_blocks",
    type: "extension_owl_trackers_field",
    tooltip: "Get the value of a field from the Owl Trackers extension",
    message0: "%1 field %2",
    args0: [
        {
            type: "field_image",
            src: "https://owl-trackers.onrender.com/owl-trackers-logo.svg",
            width: 24,
            height: 24,
            alt: "Owl Trackers extension icon",
        },
        {
            type: "input_value",
            name: "FIELD_NAME",
            check: ["String", "Number"],
        },
    ],
    output: "Number",
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX = {
    style: "extension_blocks",
    type: "extension_owl_trackers_checkbox",
    tooltip:
        "Check if a checkbox field is checked in the Owl Trackers extension",
    message0: "%1 field %2 checked?",
    args0: [
        {
            type: "field_image",
            src: "https://owl-trackers.onrender.com/owl-trackers-logo.svg",
            width: 24,
            height: 24,
            alt: "Owl Trackers extension icon",
        },
        {
            type: "input_value",
            name: "FIELD_NAME",
            check: ["String", "Number"],
        },
    ],
    output: "Boolean",
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD = {
    style: "extension_blocks",
    type: "extension_owl_trackers_set_field",
    tooltip: "Set the value of a field in the Owl Trackers extension",
    message0: "%1 set field %2 to %3",
    args0: [
        {
            type: "field_image",
            src: "https://owl-trackers.onrender.com/owl-trackers-logo.svg",
            width: 24,
            height: 24,
            alt: "Owl Trackers extension icon",
        },
        {
            type: "input_value",
            name: "FIELD",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "VALUE",
            check: ["Number", "String"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX = {
    style: "extension_blocks",
    type: "extension_owl_trackers_set_checkbox",
    tooltip:
        "Set the checked state of a checkbox in the Owl Trackers extension",
    message0: "%1 set checkbox %2 to %3",
    args0: [
        {
            type: "field_image",
            src: "https://owl-trackers.onrender.com/owl-trackers-logo.svg",
            width: 24,
            height: 24,
            alt: "Owl Trackers extension icon",
        },
        {
            type: "input_value",
            name: "FIELD",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "CHECKED",
            check: ["Boolean"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_CODEO_RUN_SCRIPT = {
    style: "extension_blocks",
    type: "extension_codeo_run",
    tooltip: "Run a script using the Codeo extension",
    message0: "%1 run script %2",
    args0: [
        {
            type: "field_image",
            src: "https://owlbear-codeo.pages.dev/logo-bg.svg",
            width: 24,
            height: 24,
            alt: "Codeo extension icon",
        },
        {
            type: "input_value",
            name: "SCRIPT_NAME",
            check: ["String", "Number"],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_SHEETS_GET = {
    style: "extension_blocks",
    type: "extension_sheets_get",
    tooltip: "Get a cell from Google Sheets",
    message0: "%1 cell %2 of %3 in %4",
    args0: [
        {
            type: "field_image",
            src: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Google_Sheets_2020_Logo.svg",
            width: 24,
            height: 24,
            alt: "Google Sheets icon",
        },
        {
            type: "input_value",
            name: "CELL",
            check: ["String"],
        },
        {
            type: "input_value",
            name: "SHEET",
            check: ["String", "Number"],
        },
        {
            type: "input_value",
            name: "ID",
            check: ["String"],
        },
    ],
    output: "String",
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_WEATHER_ADD = {
    style: "extension_blocks",
    type: "extension_weather_add",
    tooltip: "Add weather effect to the current scene",
    message0: "%1 add %2 %3 %4 %5",
    args0: [
        {
            type: "field_image",
            src: "https://weather.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Weather extension icon",
        },
        {
            type: "field_grid_dropdown",
            name: "DIRECTION",
            options: [
                ["↖️", "NORTHWEST"],
                ["⬆️", "NORTH"],
                ["↗️", "NORTHEAST"],
                ["⬅️", "WEST"],
                ["⏹️", "NONE"],
                ["➡️", "EAST"],
                ["↙️", "SOUTHWEST"],
                ["⬇️", "SOUTH"],
                ["↘️", "SOUTHEAST"],
            ],
        },
        {
            type: "field_dropdown",
            name: "SPEED",
            options: [
                ["slow", "1"],
                ["medium", "2"],
                ["fast", "3"],
                ["super fast", "4"],
            ],
        },
        {
            type: "field_dropdown",
            name: "DENSITY",
            options: [
                ["light", "1"],
                ["medium", "2"],
                ["heavy", "3"],
                ["super heavy", "4"],
            ],
        },
        {
            type: "field_dropdown",
            name: "TYPE",
            options: [
                ["snow", "SNOW"],
                ["rain", "RAIN"],
                ["sand", "SAND"],
                ["fire", "FIRE"],
                ["cloud", "CLOUD"],
                ["bloom", "BLOOM"],
            ],
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_WEATHER_REMOVE = {
    style: "extension_blocks",
    type: "extension_weather_remove",
    tooltip: "Remove weather effect from the current scene",
    message0: "%1 remove weather",
    args0: [
        {
            type: "field_image",
            src: "https://weather.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Weather extension icon",
        },
    ],
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_EXTENSION_WEATHER_HAS = {
    style: "extension_blocks",
    type: "extension_weather_has",
    tooltip: "Whether this token has weather from the Weather extension",
    message0: "%1 I have weather?",
    args0: [
        {
            type: "field_image",
            src: "https://weather.owlbear.rodeo/logo.png",
            width: 24,
            height: 24,
            alt: "Weather extension icon",
        },
    ],
    output: "Boolean",
} as const;

export const BLOCK_EXTENSION_BONES_ROLL = {
    style: "extension_blocks",
    type: "extension_bones_roll",
    tooltip:
        "Runs the blocks below when you roll a specific value on a die using the Bones extension",
    message0: "%1 when %3 rolls %2",
    args0: [
        {
            type: "field_image",
            src: "https://bones.battle-system.com/logo.png",
            width: 24,
            height: 24,
            alt: "Bones! extension icon",
        },
        {
            type: "field_number",
            name: "VALUE",
            value: "20",
        },
        {
            type: "field_dropdown",
            name: "DIE",
            options: [
                ["a d20", "20"],
                ["a d4", "4"],
                ["a d6", "6"],
                ["a d8", "8"],
                ["a d10", "10"],
                ["a d12", "12"],
                ["a d100", "100"],
                ["any die", "ANY"],
            ],
        },
    ],
    nextStatement: null,
    inputsInline: true,
} as const;

export const BLOCK_EXTENSION_PHASE_CHANGE = {
    style: "extension_blocks",
    type: "extension_phases_change",
    tooltip: "Runs the blocks below when a phase in Phases Automated changes",
    message0: "%1 when %2 enters phase %3",
    args0: [
        {
            type: "field_image",
            src: "https://phases-automated.onrender.com/icon.svg",
            width: 24,
            height: 24,
            alt: "Phases extension icon",
        },
        {
            type: "field_input",
            name: "NAME",
            text: "Automation 1",
        },
        {
            type: "field_number",
            name: "PHASE",
            value: "1",
        },
    ],
    nextStatement: null,
    inputsInline: true,
} as const;

// Menus
export const BLOCK_LAYER_MENU = {
    style: "looks_blocks",
    type: "menu_layer",
    tooltip: "Select a layer",
    message0: "%1",
    args0: [
        {
            type: "field_dropdown",
            name: "LAYER",
            options: [
                ["Map", "MAP"],
                // ["Grid", "GRID"],
                ["Drawing", "DRAWING"],
                ["Prop", "PROP"],
                ["Mount", "MOUNT"],
                ["Character", "CHARACTER"],
                ["Attachment", "ATTACHMENT"],
                ["Note", "NOTE"],
                ["Text", "TEXT"],
                // ["Ruler", "RULER"],
                // ["Fog", "FOG"],
                // ["Pointer", "POINTER"],
                // ["Post Process", "POST_PROCESS"],
                // ["Control", "CONTROL"],
                // ["Popover", "POPOVER"],
                ["front of current", "FRONT OF CURRENT"],
                ["back of current", "BACK OF CURRENT"],
            ],
        },
    ],
    output: "String",
} as const;

export const BLOCK_BROADCAST_MENU = {
    style: "event_blocks",
    extensions: [EXTENSION_BROADCAST],
    type: "event_broadcast_menu",
    tooltip: "Select a broadcast to send",
    message0: "%1",
    args0: [
        {
            type: "input_dummy", // field_variable
            name: INPUT_BROADCAST,
            // variableTypes: ["broadcast_msg"],
            // defaultType: "broadcast_msg",
            // variable: "message1",
        },
    ],
    output: "String",
} as const;

export const BLOCK_TAG_MENU = {
    style: "sensing_blocks",
    extensions: [EXTENSION_TAG],
    type: "menu_tag",
    tooltip: "Select a tag to apply",
    message0: "%1",
    args0: [
        {
            type: "input_dummy",
            name: INPUT_TAG,
        },
    ],
    output: "String",
} as const;

export const BLOCK_SOUND_MENU = {
    style: "sound_blocks",
    extensions: [EXTENSION_SOUND],
    type: "menu_sound",
    tooltip: "Select a sound to play",
    message0: "%1",
    args0: [
        {
            type: "input_dummy",
            name: INPUT_SOUND,
        },
    ],
    output: "String",
} as const;

export const BLOCK_SOUND_STOP_ALL = {
    style: "sound_blocks",
    type: "sound_stopallsounds",
    tooltip: "Stop all currently playing sounds",
    message0: "stop all sounds",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_SENSING_ITEM_MENU = {
    style: "sensing_blocks",
    type: "menu_item",
    tooltip: "Choose a token",
    message0: "%1",
    args0: [
        {
            type: "field_dropdown",
            name: "ITEM",
            options: [["myself", "MYSELF"]],
        },
    ],
    output: "ItemId",
} as const;

export const BLOCK_CONTROL_ITEM_MENU = {
    style: "control_blocks",
    type: "control_menu_item",
    tooltip: "Choose a token",
    message0: "%1",
    args0: [
        {
            type: "field_dropdown",
            name: "ITEM",
            options: [["myself", "MYSELF"]],
        },
    ],
    output: "ItemId",
} as const;

// Mutator blocks
export const BLOCK_MATCH_MATCH = {
    style: "control_blocks",
    type: "controls_match_match",
    message0: "match",
    message1: "%1",
    args1: [
        {
            type: "input_statement",
            name: "CASES",
        },
    ],
    message2: "default? %1",
    args2: [
        {
            type: "field_checkbox",
            name: "DEFAULT",
        },
    ],
} as const;

export const BLOCK_MATCH_CASE = {
    style: "control_blocks",
    type: "controls_match_case",
    message0: "case %1",
    args0: [
        {
            type: "field_input",
            name: "TEXT",
            text: "value",
        },
    ],
    previousStatement: null,
    nextStatement: null,
    inputsInline: true,
} as const;

/**
 * Custom blocks.
 * Make blocks with https://google.github.io/blockly-samples/examples/developer-tools/index.html
 * Reference Scratch blocks: https://en.scratch-wiki.info/wiki/Blocks
 * Scratch definitions: https://github.com/scratchfoundation/scratch-blocks/tree/develop/blocks_vertical
 */
export const CUSTOM_JSON_BLOCKS = [
    // Motion blocks
    BLOCK_GOTO,
    BLOCK_MOVE_DIRECTION,
    BLOCK_GLIDE,
    BLOCK_X_POSITION,
    BLOCK_Y_POSITION,
    BLOCK_ATTACH,
    BLOCK_DETACH,
    BLOCK_MY_PARENT,
    BLOCK_ATTACHED,
    BLOCK_ROTATE_LEFT,
    BLOCK_ROTATE_RIGHT,
    BLOCK_GLIDE_ROTATE_LEFT,
    BLOCK_GLIDE_ROTATE_RIGHT,
    BLOCK_ROTATION,
    BLOCK_POINT_IN_DIRECTION,
    BLOCK_FACE,
    BLOCK_SNAP_TO_GRID,

    // Looks blocks
    BLOCK_SHOW,
    BLOCK_HIDE,
    BLOCK_VISIBLE,
    BLOCK_LOCK,
    BLOCK_UNLOCK,
    BLOCK_LOCKED,
    BLOCK_SAY,
    BLOCK_SET_SIZE,
    BLOCK_CHANGE_SIZE,
    BLOCK_GET_SIZE,
    BLOCK_REPLACE_IMAGE,
    BLOCK_GET_TEXT,
    BLOCK_SET_TEXT,
    BLOCK_GET_LAYER,
    BLOCK_SET_LAYER,
    BLOCK_SET_STROKE_COLOR,
    BLOCK_OPACITY_SLIDER,
    BLOCK_SET_STROKE_OPACITY,
    BLOCK_SET_FILL_COLOR,
    BLOCK_SET_FILL_OPACITY,
    BLOCK_GET_STROKE_COLOR,
    BLOCK_GET_STROKE_OPACITY,
    BLOCK_GET_FILL_COLOR,
    BLOCK_GET_FILL_OPACITY,
    BLOCK_SET_VIEWPORT,
    BLOCK_CLEAR_GRAPHIC_EFFECTS,
    BLOCK_SET_EFFECT_TO,
    BLOCK_CHANGE_EFFECT_BY,

    // Sound blocks
    BLOCK_SOUND_PLAY,
    BLOCK_SOUND_PLAY_UNTIL_DONE,
    BLOCK_SOUND_STOP_ALL,

    // Event blocks
    BLOCK_IMMEDIATELY,
    BLOCK_RECEIVE_BROADCAST,
    BLOCK_BROADCAST,
    BLOCK_BROADCAST_MENU,
    BLOCK_WHEN_I,
    BLOCK_TOUCH,

    // Control blocks
    BLOCK_WAIT,
    BLOCK_STOP,
    BLOCK_IF,
    BLOCK_IF_ELSE,
    BLOCK_FOREVER,
    BLOCK_REPEAT,
    BLOCK_WAIT_UNTIL,
    BLOCK_REPEAT_UNTIL,
    BLOCK_WHEN_I_START_AS_CLONE,
    BLOCK_CREATE_CLONE_OF,
    BLOCK_DELETE_THIS,
    BLOCK_MATCH,

    // Sensing blocks
    BLOCK_TAG,
    BLOCK_REMOVE_TAG,
    BLOCK_HAS_TAG_SELF,
    BLOCK_HAS_TAG_OTHER,
    BLOCK_CLOSEST_TAGGED,
    BLOCK_DESELECT,
    BLOCK_OTHER_SRC,
    BLOCK_OTHER,
    BLOCK_SENSING_OF,
    BLOCK_DISTANCE_TO,
    BLOCK_TOUCHING,
    BLOCK_CURRENT_TIME,

    // Operator blocks
    BLOCK_JOIN,
    BLOCK_LESS_THAN,
    BLOCK_EQUALS,
    BLOCK_GREATER_THAN,
    BLOCK_LETTER_OF,
    BLOCK_CONTAINS,

    // Variable blocks
    BLOCK_VARIABLE_REPORTER,
    BLOCK_VARIABLE_SETTER,
    BLOCK_VARIABLE_CHANGE,
    BLOCK_LIST_REPORTER,
    BLOCK_LIST_ADD,
    BLOCK_LIST_DELETE,
    BLOCK_LIST_CLEAR,
    BLOCK_LIST_INSERT,
    BLOCK_LIST_REPLACE,
    BLOCK_LIST_INDEX,
    BLOCK_LIST_INDEX_OF,
    BLOCK_LIST_LENGTH,
    BLOCK_LIST_CONTAINS,

    // My Blocks
    BLOCK_PROCEDURE_PREVIEW,
    BLOCK_ARGUMENT_EDITOR_STRNUM,
    BLOCK_ARGUMENT_EDITOR_BOOLEAN,

    // Extension blocks
    BLOCK_ANNOUNCEMENT,
    BLOCK_HOOT,
    BLOCK_ADD_AURA,
    BLOCK_REMOVE_AURAS,
    BLOCK_EXTENSION_FOG_LIT,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_FOG_REMOVE,
    BLOCK_EXTENSION_SMOKE_VISION,
    BLOCK_EXTENSION_SMOKE_ADD,
    BLOCK_EXTENSION_SMOKE_REMOVE,
    BLOCK_EXTENSION_GRIMOIRE_HP,
    BLOCK_EXTENSION_GRIMOIRE_MAX_HP,
    BLOCK_EXTENSION_GRIMOIRE_TEMP_HP,
    BLOCK_EXTENSION_GRIMOIRE_AC,
    BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_DAGGERHEART_FEAR,
    BLOCK_EXTENSION_OWL_TRACKERS_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_CHECKBOX,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_FIELD,
    BLOCK_EXTENSION_OWL_TRACKERS_SET_CHECKBOX,
    BLOCK_EXTENSION_CODEO_RUN_SCRIPT,
    BLOCK_EXTENSION_SHEETS_GET,
    BLOCK_EXTENSION_WEATHER_ADD,
    BLOCK_EXTENSION_WEATHER_REMOVE,
    BLOCK_EXTENSION_WEATHER_HAS,
    BLOCK_EXTENSION_BONES_ROLL,
    BLOCK_EXTENSION_PHASE_CHANGE,

    // Value utility blocks
    BLOCK_DYNAMIC_VAL,
    BLOCK_URL,
    BLOCK_COLOR_PICKER,
    BLOCK_ANGLE,
    BLOCK_LAYER_MENU,
    BLOCK_TAG_MENU,
    BLOCK_SOUND_MENU,
    BLOCK_SENSING_ITEM_MENU,
    BLOCK_CONTROL_ITEM_MENU,

    // Mutator blocks
    BLOCK_MATCH_MATCH,
    BLOCK_MATCH_CASE,
];

export type CustomBlockType =
    | (typeof CUSTOM_JSON_BLOCKS)[number]["type"]
    | typeof BLOCK_TYPE_CALL
    | typeof BLOCK_TYPE_DEFINE
    | typeof BLOCK_TYPE_ARGUMENT_REPORTER;

// Todo: better way to do this?
// This is intended to fail compilation if I forget to put 'as const'
// after the block definition, ie if CustomBlockType is string.
type NOT_BLOCK_TYPE<T> = T extends CustomBlockType ? never : boolean;
const assertCustomBlockTypeIsNotString: NOT_BLOCK_TYPE<"not a block type"> =
    true;
void assertCustomBlockTypeIsNotString;
