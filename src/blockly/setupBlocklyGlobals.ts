import { registerContinuousToolbox } from "@blockly/continuous-toolbox";
import { registerFieldAngle } from "@blockly/field-angle";
import "@blockly/field-colour-hsv-sliders";
// import "@blockly/field-grid-dropdown"; // where else is this imported?
import "@blockly/field-slider";
import * as Blockly from "blockly";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { Renderer } from "./blockRendering/Renderer";
import { CUSTOM_JSON_BLOCKS } from "./blocks";
import { CategoryMyBlocks } from "./CategoryMyBlocks";
import { CategoryVariables } from "./CategoryVariables";
import { registerContextMenuEdit } from "./contextMenuEdit";
import { registerBroadcastExtension } from "./extensionBroadcast";
import { registerSoundExtension } from "./extensionSound";
import { registerStopExtension } from "./extensionStop";
import { registerTagExtension } from "./extensionTags";
import { registerExtensionLimitIdLength } from "./extensionUrl";
import { registerFieldTextInputRemovable } from "./FieldTextInputRemovable";
import { registerFieldTokenImage } from "./FieldTokenImage";
import { registerMixinDragToDupe } from "./mixinDragToDupe";
import { registerMutatorMatch } from "./mutatorMatch";
import { BehaviorParameterModel } from "./procedures/BehaviorParameterModel";
import { BehaviorProcedureModel } from "./procedures/BehaviorProcedureModel";
import { registerBlockArgumentReporter } from "./procedures/blockArgumentReporter";
import { registerBlockCall } from "./procedures/blockCall";
import { registerBlockDefine } from "./procedures/blockDefine";
import { BlockSerializer } from "./serialization/BlockSerializer";
import { VariableSerializer } from "./serialization/VariableSerializer";
import { VariableMap } from "./variables/VariableMap";
import { VariableModel } from "./variables/VariableModel";

let blocklySetup = false;

class FieldBehaviorVariable extends Blockly.FieldVariable {}

export function setupBlocklyGlobals() {
    // Idempotency
    if (blocklySetup) {
        return; // no need to re-init
    }

    Blockly.registry.register(
        Blockly.registry.Type.FIELD,
        "field_behavior_variable",
        FieldBehaviorVariable,
    );

    // Blocks
    Blockly.common.defineBlocksWithJsonArray(CUSTOM_JSON_BLOCKS);
    registerBlockCall();
    registerBlockDefine();
    registerBlockArgumentReporter();

    // Context menu.
    registerContextMenuEdit();
    Blockly.ContextMenuItems.registerCommentOptions();
    Blockly.ContextMenuRegistry.registry.unregister("blockInline");
    // Blockly.ContextMenuRegistry.registry.unregister("blockDisable");
    Blockly.ContextMenuRegistry.registry.unregister("collapseWorkspace");
    Blockly.ContextMenuRegistry.registry.unregister("blockCollapseExpand");

    // Custom classes
    Renderer.register();

    CategoryVariables.register();
    CategoryMyBlocks.register();

    BlockSerializer.register();
    VariableSerializer.register();

    VariableMap.register();
    VariableModel.register();
    Blockly.serialization.registry.register(
        "procedures",
        new Blockly.serialization.procedures.ProcedureSerializer(
            BehaviorProcedureModel,
            BehaviorParameterModel,
        ),
    );

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

    registerTagExtension();
    registerStopExtension();
    registerSoundExtension();
    registerBroadcastExtension();
    registerExtensionLimitIdLength();
    registerMixinDragToDupe();
    registerMutatorMatch();

    blocklySetup = true;
}
