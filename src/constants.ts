const PLUGIN_ID = "com.desain.behavior";

// Broadcasts
export const CHANNEL_MESSAGE = `${PLUGIN_ID}/message`;

// Storage
export const LOCAL_STORAGE_STORE_NAME = `${PLUGIN_ID}/localStorage`;
export const METADATA_KEY_ROOM = `${PLUGIN_ID}/roomMetadata`;

// Tool
export const ID_TOOL = `${PLUGIN_ID}/tool`;
export const ID_TOOL_MODE_EDIT_BEHAVIORS = `${ID_TOOL}/modeEditBehaviors`;

// Popover
export const ID_POPOVER_SETTINGS = `${PLUGIN_ID}/popoverSettings`;
export const ID_POPOVER_HELP = `${PLUGIN_ID}/popoverHelp`;
export const ID_POPOVER_ADD_TAGS = `${PLUGIN_ID}/popoverAddTags`;

// Modal
export const MODAL_EDIT_BEHAVIOR_ID = `${PLUGIN_ID}/modalEditBehavior`;
export const URL_PARAM_ITEM_ID = "itemId";
export const URL_PARAM_CAT_BLOCKS = "catBlocks";

// Context menu
export const CONTEXT_MENU_ID = `${PLUGIN_ID}/contextMenu`;
export const CONTEXT_MENU_ADD_TAGS_ID = `${PLUGIN_ID}/contextMenuAddTags`;
export const CONTEXT_MENU_COPY_BEHAVIOR_ID = `${PLUGIN_ID}/contextMenuCopyBehavior`;
export const CONTEXT_MENU_PASTE_BEHAVIOR_ID = `${PLUGIN_ID}/contextMenuPasteBehavior`;

// Metadata
export const METADATA_KEY_TAGS = `${PLUGIN_ID}/tags`;
export const METADATA_KEY_BEHAVIORS = `${PLUGIN_ID}/behaviors`;
export const METADATA_KEY_SCENE = `${PLUGIN_ID}/sceneMetadata`;
export const METADATA_KEY_EFFECT = `${PLUGIN_ID}/effect`;
export const METADATA_KEY_CLONE = `${PLUGIN_ID}/clone`;

// Behavior scripts
export const PARAMETER_SELF_ID = "selfId";
export const PARAMETER_BEHAVIOR_IMPL = "Behaviors";
export const PARAMETER_ITEM_PROXY = "itemProxy";
export const PARAMETER_SIGNAL = "signal";
export const PARAMETER_OTHER_ID = "otherId";
export const PARAMETER_GLOBALS = "globals";
export const PARAMETER_BEHAVIOR_REGISTRY = "behaviorRegistry";
export const CONSTANT_BEHAVIOR_DEFINITION = "behaviorDefinition";
export const VAR_LOOP_CHECK = "loopCheck";

// Blockly variable category
export const CUSTOM_DYNAMIC_CATEGORY_VARIABLES = "BEHAVIOR_VARIABLES_DYNAMIC";
export const CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS = "BEHAVIOR_MY_BLOCKS_DYNAMIC";
export const VARIABLE_TYPE_LIST = "List";

// Blockly extensions
export const EXTENSION_BROADCAST = "extension_broadcast";
export const INPUT_BROADCAST = "INPUT_BROADCAST";
export const FIELD_BROADCAST = "FIELD_BROADCAST";
export const DROPDOWN_BROADCAST_DEFAULT = "message1";

export const EXTENSION_TAG = "extension_tag";
export const INPUT_TAG = "INPUT_TAG";
export const FIELD_TAG = "FIELD_TAG";
export const DROPDOWN_TAG_DEFAULT = "player";

export const EXTENSION_SOUND = "extension_sound";
export const INPUT_SOUND = "INPUT_SOUND";
export const FIELD_SOUND = "FIELD_SOUND";
export const DROPDOWN_SOUND_MEOW = "meow";

export const MIXIN_DRAG_TO_DUPE = "mixin_drag_to_dupe";
export const EXTENSION_URL = "extension_url";

export const CREATE_NEW_RESOURCE = "__create_new__";

export const FIELD_ARGUMENT_EDITOR_TEXT = "TEXT";
export const INPUT_CUSTOM_BLOCK = "custom_block";

// Blockly renderer
export const RENDERER_CAT = "cat_zelos";
