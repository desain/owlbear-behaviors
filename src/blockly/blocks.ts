import { Mode } from "@blockly/field-angle";

import repeat from "../../assets/repeat.svg";
import rotateLeft from "../../assets/rotate-left.svg";
import rotateRight from "../../assets/rotate-right.svg";

import {
    EXTENSION_BROADCAST,
    EXTENSION_DRAG_TO_DUPE,
    EXTENSION_SOUND,
    EXTENSION_TAG,
    INPUT_BROADCAST,
    INPUT_SOUND,
    INPUT_TAG,
} from "../constants";

// Motion
export const BLOCK_GLIDE = {
    style: "motion_blocks",
    type: "motion_glidesecstoxy",
    tooltip: "Smoothly move",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "x position",
    output: "Number",
} as const;

export const BLOCK_Y_POSITION = {
    style: "motion_blocks",
    type: "motion_yposition",
    tooltip: "Y position of the current token",
    helpUrl: "",
    message0: "y position",
    output: "Number",
} as const;

export const BLOCK_ATTACH = {
    style: "motion_blocks",
    type: "motion_attach",
    tooltip: "Attach this token to another item",
    helpUrl: "",
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
    helpUrl: "",
    message0: "detach",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_MY_PARENT = {
    style: "motion_blocks",
    type: "motion_my_parent",
    tooltip: "The parent item that this token is attached to",
    helpUrl: "",
    message0: "my parent",
    output: "ItemId",
} as const;

export const BLOCK_ATTACHED = {
    style: "motion_blocks",
    type: "motion_attached",
    tooltip: "Whether this token is attached to a parent token",
    helpUrl: "",
    message0: "attached?",
    output: "Boolean",
} as const;

export const BLOCK_LOCK = {
    style: "motion_blocks",
    type: "looks_lock",
    tooltip: "Lock this token in place",
    helpUrl: "",
    message0: "lock",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_UNLOCK = {
    style: "motion_blocks",
    type: "looks_unlock",
    tooltip: "Unlock this token so it can be moved",
    helpUrl: "",
    message0: "unlock",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_LOCKED = {
    style: "motion_blocks",
    type: "looks_locked",
    tooltip: "Whether this token is locked",
    helpUrl: "",
    message0: "locked?",
    output: "Boolean",
} as const;

export const BLOCK_ROTATE_LEFT = {
    style: "motion_blocks",
    type: "motion_turnleft",
    tooltip: "Rotate this token to the left",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "rotation",
    output: "Number",
} as const;

export const BLOCK_POINT_IN_DIRECTION = {
    style: "motion_blocks",
    type: "motion_pointindirection",
    tooltip: "Set the rotation of the current direction",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "snap to grid",
    previousStatement: null,
    nextStatement: null,
} as const;

// Looks
export const BLOCK_SHOW = {
    style: "looks_blocks",
    type: "looks_show",
    tooltip: "Make this token visible",
    helpUrl: "",
    message0: "show",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_HIDE = {
    style: "looks_blocks",
    type: "looks_hide",
    tooltip: "Make this token invisible",
    helpUrl: "",
    message0: "hide",
    previousStatement: null,
    nextStatement: null,
} as const;

export const BLOCK_SAY = {
    style: "looks_blocks",
    type: "looks_sayforsecs",
    tooltip: "Display a message above the token",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "size",
    output: "Number",
} as const;

export const BLOCK_VISIBLE = {
    style: "looks_blocks",
    type: "looks_visible",
    tooltip: "Check if this token is visible",
    helpUrl: "",
    message0: "visible?",
    output: "Boolean",
} as const;

export const BLOCK_REPLACE_IMAGE = {
    style: "looks_blocks",
    type: "looks_replace_image",
    tooltip: "Change the token image",
    helpUrl: "",
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

export const BLOCK_GET_LABEL = {
    style: "looks_blocks",
    type: "looks_get_label",
    tooltip: "Get the label of this token (or name if it's not an image)",
    helpUrl: "",
    message0: "label",
    output: "String",
} as const;

export const BLOCK_SET_LABEL = {
    style: "looks_blocks",
    type: "looks_set_label",
    tooltip: "Set the label of this token (or name if it's not an image)",
    helpUrl: "",
    message0: "set label to %1",
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
    helpUrl: "",
    message0: "layer",
    output: "String",
} as const;

export const BLOCK_SET_LAYER = {
    style: "looks_blocks",
    type: "looks_set_layer",
    tooltip: "Set the layer of this token",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "stroke color",
    output: "String",
} as const;

export const BLOCK_GET_STROKE_OPACITY = {
    style: "looks_blocks",
    type: "looks_get_stroke_opacity",
    tooltip: "Current stroke opacity of a line or shape",
    helpUrl: "",
    message0: "stroke opacity",
    output: "Number",
} as const;

export const BLOCK_GET_FILL_COLOR = {
    style: "looks_blocks",
    type: "looks_get_fill_color",
    tooltip: "Current fill color of a shape",
    helpUrl: "",
    message0: "fill color",
    output: "String",
} as const;

export const BLOCK_GET_FILL_OPACITY = {
    style: "looks_blocks",
    type: "looks_get_fill_opacity",
    tooltip: "Current fill opacity of a shape",
    helpUrl: "",
    message0: "fill opacity",
    output: "Number",
} as const;

export const BLOCK_SET_VIEWPORT = {
    style: "looks_blocks",
    type: "looks_set_viewport",
    tooltip: "Center the viewport on specified coordinates",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "immediately",
    nextStatement: null,
} as const;

export const BLOCK_RECEIVE_BROADCAST = {
    style: "event_blocks",
    extensions: [EXTENSION_BROADCAST],
    type: "event_whenbroadcastreceived",
    tooltip: "Runs the blocks below when the specified broadcast fires",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    extensions: [EXTENSION_DRAG_TO_DUPE],
    type: "sensing_other_src",
    tooltip: "The token this token is touching (drag to use variable)",
    helpUrl: "",
    message0: "other",
    output: "ItemId",
} as const;

export const BLOCK_OTHER_VAL = {
    style: "sensing_blocks",
    type: "sensing_other_val",
    tooltip: "The token this token is touching",
    helpUrl: "",
    message0: "other",
    output: "ItemId",
} as const;

export const BLOCK_SENSING_OF = {
    style: "sensing_blocks",
    type: "sensing_of",
    tooltip: "Get a property value of another item",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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

// Control
export const BLOCK_WAIT = {
    style: "control_blocks",
    type: "control_wait",
    tooltip: "Pause for the specified duration",
    helpUrl: "",
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
    tooltip: "Stop execution of scripts",
    helpUrl: "",
    message0: "stop %1",
    args0: [
        {
            type: "field_dropdown",
            name: "STOP_TARGET",
            options: [["this script", "THIS_SCRIPT"]],
        },
    ],
    previousStatement: null,
} as const;

export const BLOCK_IF = {
    style: "control_blocks",
    type: "control_behavior_if",
    tooltip: "%{BKY_CONTROLS_IF_TOOLTIP_1}",
    helpUrl: "",
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
    helpUrl: "",
    message0: "if %1 then",
    message1: "%1",
    message2: "else",
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
    helpUrl: "",
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
    tooltip: "Run the statements inside a certain number of times",
    message0: "repeat %1 times",
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
    tooltip: "Repeat the statements inside until the condition is true",
    message0: "repeat until %1",
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

// Operators
export const BLOCK_JOIN = {
    style: "operators_blocks",
    type: "operator_join",
    tooltip: "Join two values into a text string",
    helpUrl: "",
    message0: "join %1 %2",
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
    helpUrl: "",
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

export const BLOCK_COLOR_PICKER = {
    style: "looks_blocks",
    type: "color_hsv_sliders",
    tooltip: "Pick a color using HSV sliders",
    helpUrl: "",
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
    helpUrl: "",
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
    tooltip: "True if both sides are equal",
    helpUrl: "",
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
    tooltip: "True if left side is less than right side",
    helpUrl: "",
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
    tooltip: "True if left side is greater than right side",
    helpUrl: "",
    message0: "%1 > %2",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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

// Extensions
export const BLOCK_ANNOUNCEMENT = {
    style: "extension_blocks",
    type: "extension_announcement",
    tooltip: "Show an announcement using the Announcement extension",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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

export const BLOCK_EXTENSION_GRIMOIRE_HP = {
    style: "extension_blocks",
    type: "extension_grimoire_hp",
    tooltip: "Get current HP from Game Master's Grimoire extension",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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

// Menus
export const BLOCK_LAYER_MENU = {
    style: "looks_blocks",
    type: "menu_layer",
    tooltip: "Select a layer",
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
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
    helpUrl: "",
    message0: "%1",
    args0: [
        {
            type: "input_dummy",
            name: INPUT_SOUND,
        },
    ],
    output: "String",
} as const;

export const BLOCK_ITEM_MENU = {
    style: "sensing_blocks",
    type: "menu_item",
    tooltip: "Choose a token",
    helpUrl: "",
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
    BLOCK_GET_LABEL,
    BLOCK_SET_LABEL,
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

    // Sensing blocks
    BLOCK_TAG,
    BLOCK_REMOVE_TAG,
    BLOCK_HAS_TAG_SELF,
    BLOCK_HAS_TAG_OTHER,
    BLOCK_CLOSEST_TAGGED,
    BLOCK_DESELECT,
    BLOCK_OTHER_SRC,
    BLOCK_OTHER_VAL,
    BLOCK_SENSING_OF,
    BLOCK_DISTANCE_TO,
    BLOCK_TOUCHING,

    // Operator blocks
    BLOCK_JOIN,
    BLOCK_LESS_THAN,
    BLOCK_EQUALS,
    BLOCK_GREATER_THAN,
    BLOCK_LETTER_OF,
    BLOCK_CONTAINS,

    // Extension blocks
    BLOCK_ANNOUNCEMENT,
    BLOCK_HOOT,
    BLOCK_ADD_AURA,
    BLOCK_REMOVE_AURAS,
    BLOCK_EXTENSION_FOG_LIT,
    BLOCK_EXTENSION_FOG_ADD,
    BLOCK_EXTENSION_FOG_REMOVE,
    BLOCK_EXTENSION_GRIMOIRE_HP,
    BLOCK_EXTENSION_GRIMOIRE_MAX_HP,
    BLOCK_EXTENSION_GRIMOIRE_TEMP_HP,
    BLOCK_EXTENSION_GRIMOIRE_AC,
    BLOCK_EXTENSION_GRIMOIRE_HP_CHANGE,
    BLOCK_EXTENSION_RUMBLE_SAY,
    BLOCK_EXTENSION_RUMBLE_ROLL,
    BLOCK_EXTENSION_DAGGERHEART_STAT,
    BLOCK_EXTENSION_DAGGERHEART_FEAR,

    // Value utility blocks
    BLOCK_DYNAMIC_VAL,
    BLOCK_COLOR_PICKER,
    BLOCK_ANGLE,
    BLOCK_LAYER_MENU,
    BLOCK_TAG_MENU,
    BLOCK_SOUND_MENU,
    BLOCK_ITEM_MENU,
];

export type CustomBlockType = (typeof CUSTOM_JSON_BLOCKS)[number]["type"];

// Todo: better way to do this?
// This is intended to fail compilation if I forget to put 'as const'
// after the block definition, ie if CustomBlockType is string.
type NOT_BLOCK_TYPE<T> = T extends CustomBlockType ? never : boolean;
const assertCustomBlockTypeIsNotString: NOT_BLOCK_TYPE<"not a block type"> =
    true;
void assertCustomBlockTypeIsNotString;
