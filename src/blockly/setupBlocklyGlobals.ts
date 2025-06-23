import { registerContinuousToolbox } from "@blockly/continuous-toolbox";
import { registerFieldAngle } from "@blockly/field-angle";
import "@blockly/field-colour-hsv-sliders";
import "@blockly/field-grid-dropdown";
import "@blockly/field-slider";
import * as Blockly from "blockly";
import { CUSTOM_DYNAMIC_CATEGORY_VARIABLES, RENDERER_CAT } from "../constants";
import { CUSTOM_JSON_BLOCKS } from "./blocks";
import { installBroadcastExtension } from "./broadcastExtension";
import { CategoryVariables } from "./CategoryVariables";
import "./CatZelosRenderer";
import { CatRenderer } from "./CatZelosRenderer";
import { installExtensionDragToDupe } from "./extensionDragToDupe";
import { registerFieldTokenImage } from "./FieldTokenImage";
import { installMoveGridExtension } from "./moveGridExtension";
import { installSoundExtension } from "./soundExtension";
import { installTagExtension } from "./tagExtension";

export function setupBlocklyGlobals() {
    Blockly.common.defineBlocksWithJsonArray(CUSTOM_JSON_BLOCKS);
    Blockly.ContextMenuItems.registerCommentOptions(); // Add workspace comment options to the context menu.
    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
        CategoryVariables,
    );
    Blockly.blockRendering.register(RENDERER_CAT, CatRenderer);

    // The HSV color input plugin doesn't register this CSS by default,
    // so we need to do it manually. Otherwise the text will be white.
    Blockly.Css.register(`
        .fieldColourSliderContainer {
            color: black;
        }
    `);

    registerFieldTokenImage();
    registerFieldAngle();
    registerContinuousToolbox();
    installBroadcastExtension();
    installSoundExtension();
    installTagExtension();
    installMoveGridExtension();
    installExtensionDragToDupe();
}
