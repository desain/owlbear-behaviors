import { registerContinuousToolbox } from "@blockly/continuous-toolbox";
import { registerFieldAngle } from "@blockly/field-angle";
import "@blockly/field-colour-hsv-sliders";
// import "@blockly/field-grid-dropdown"; // where else is this imported?
import "@blockly/field-slider";
import * as Blockly from "blockly";
import {
    CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
    CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
} from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";
import {
    BehaviorVariableMap,
    BehaviorVariableModel,
    BehaviorVariableSerializer,
} from "./BehaviorVariableMap";
import { registerBehaviorsRenderer } from "./blockRendering/Renderer";
import { CUSTOM_JSON_BLOCKS } from "./blocks";
import { BehaviorBlockSerializer } from "./BlockSerializer";
import { installBroadcastExtension } from "./broadcastExtension";
import { CategoryMyBlocks } from "./CategoryMyBlocks";
import { CategoryVariables } from "./CategoryVariables";
import { installMixinDragToDupe } from "./extensionDragToDupe";
import { installExtensionLimitIdLength } from "./extensionUrl";
import { registerFieldTextInputRemovable } from "./FieldTextInputRemovable";
import { registerFieldTokenImage } from "./FieldTokenImage";
import { BehaviorParameterModel } from "./procedures/BehaviorParameterModel";
import { BehaviorProcedureModel } from "./procedures/BehaviorProcedureModel";
import { installBlockArgumentReporter } from "./procedures/blockArgumentReporter";
import { installBlockCall } from "./procedures/blockCall";
import { installBlockDefine } from "./procedures/blockDefine";
import { installSoundExtension } from "./soundExtension";
import { installTagExtension } from "./tagExtension";

let blocklySetup = false;

export function setupBlocklyGlobals() {
    // Idempotency
    if (blocklySetup) {
        return; // no need to re-init
    }

    // Blocks
    Blockly.common.defineBlocksWithJsonArray(CUSTOM_JSON_BLOCKS);

    // Add workspace comment options to the context menu.
    Blockly.ContextMenuItems.registerCommentOptions();

    // Custom classes
    registerBehaviorsRenderer();
    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        CUSTOM_DYNAMIC_CATEGORY_VARIABLES,
        CategoryVariables,
    );
    Blockly.registry.register(
        Blockly.registry.Type.TOOLBOX_ITEM,
        CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
        CategoryMyBlocks,
    );
    Blockly.registry.register(
        Blockly.registry.Type.VARIABLE_MODEL,
        Blockly.registry.DEFAULT,
        BehaviorVariableModel,
        true,
    );
    Blockly.registry.register(
        Blockly.registry.Type.VARIABLE_MAP,
        Blockly.registry.DEFAULT,
        BehaviorVariableMap,
        true,
    );
    Blockly.registry.register(
        Blockly.registry.Type.SERIALIZER,
        "variables",
        new BehaviorVariableSerializer(),
        true,
    );
    Blockly.serialization.registry.register(
        "procedures",
        new Blockly.serialization.procedures.ProcedureSerializer(
            BehaviorProcedureModel,
            BehaviorParameterModel,
        ),
    );
    BehaviorBlockSerializer.register();

    // Display
    Blockly.Msg.OBR_GRID_UNIT =
        usePlayerStorage.getState().grid.parsedScale.unit;

    // The HSV color input plugin doesn't register this CSS by default,
    // so we need to do it manually. Otherwise the text will be white.
    Blockly.Css.register(`
        .fieldColourSliderContainer {
            color: black;
        }
    `);

    // Fields
    registerFieldAngle();
    registerFieldTokenImage();
    registerFieldTextInputRemovable();

    // Extensions and mixins
    registerContinuousToolbox();

    installBroadcastExtension();
    installSoundExtension();
    installTagExtension();
    installMixinDragToDupe();
    installExtensionLimitIdLength();
    installBlockDefine();
    installBlockCall();
    installBlockArgumentReporter();

    blocklySetup = true;
}
