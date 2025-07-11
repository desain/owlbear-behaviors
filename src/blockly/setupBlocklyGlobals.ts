import { registerContinuousToolbox } from "@blockly/continuous-toolbox";
import { registerFieldAngle } from "@blockly/field-angle";
import "@blockly/field-colour-hsv-sliders";
// import "@blockly/field-grid-dropdown"; // where else is this imported?
import "@blockly/field-slider";
import * as Blockly from "blockly";
import { CUSTOM_DYNAMIC_CATEGORY_VARIABLES, RENDERER_CAT } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { CUSTOM_JSON_BLOCKS } from "./blocks";
import { installBroadcastExtension } from "./broadcastExtension";
import { CategoryVariables } from "./CategoryVariables";
import "./CatZelosRenderer";
import { CatRenderer } from "./CatZelosRenderer";
import { installExtensionDragToDupe } from "./extensionDragToDupe";
import { installExtensionLimitIdLength } from "./extensionUrl";
import { registerFieldTokenImage } from "./FieldTokenImage";
import { installSoundExtension } from "./soundExtension";
import { installTagExtension } from "./tagExtension";

let blocklySetup = false;

export function setupBlocklyGlobals() {
    // console.trace();
    if (blocklySetup) {
        return; // no need to re-init
    }

    Blockly.common.defineBlocksWithJsonArray(CUSTOM_JSON_BLOCKS);
    Blockly.ContextMenuItems.registerCommentOptions(); // Add workspace comment options to the context menu.
    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
        CategoryVariables,
    );
    Blockly.blockRendering.register(RENDERER_CAT, CatRenderer);
    Blockly.Msg.OBR_GRID_UNIT =
        usePlayerStorage.getState().grid.parsedScale.unit;

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
    installExtensionDragToDupe();
    installExtensionLimitIdLength();

    blocklySetup = true;
}
