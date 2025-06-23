import type { Theme } from "@owlbear-rodeo/sdk";
import * as Blockly from "blockly";

/**
 * Scratch colors: https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/core/colours.js#L135
 */
export function createBlocklyTheme(obrTheme: Theme): Blockly.Theme {
    const operatorsBlocks = {
        colourPrimary: "#59C059",
        colourSecondary: "#46B946",
        colourTertiary: "#389438",
        // colourQuaternary: "#389438",
    };

    const controlBlocks = {
        colourPrimary: "#FFAB19",
        colourSecondary: "#EC9C13",
        colourTertiary: "#CF8B17",
        // colourQuaternary: "#CF8B17",
    };

    const variableBlocks = {
        colourPrimary: "#FF8C1A",
        colourSecondary: "#FF8000",
        colourTertiary: "#DB6E00",
        // colourQuaternary: "#DB6E00",
    };

    return Blockly.Theme.defineTheme("owlbear-rodeo", {
        name: "owlbear-rodeo",
        base: Blockly.Themes.Classic,
        blockStyles: {
            motion_blocks: {
                colourPrimary: "#4C97FF",
                colourSecondary: "#4280D7",
                colourTertiary: "#3373CC",
                // colourQuaternary: "#3373CC",
            },
            looks_blocks: {
                colourPrimary: "#9966FF",
                colourSecondary: "#855CD6",
                colourTertiary: "#774DCB",
                // colourQuaternary: "#774DCB",
            },
            sound_blocks: {
                colourPrimary: "#CF63CF",
                colourSecondary: "#C94FC9",
                colourTertiary: "#BD42BD",
                // colourQuaternary: "#BD42BD",
            },
            event_blocks: {
                colourPrimary: "#FFBF00",
                colourSecondary: "#E6AC00",
                colourTertiary: "#CC9900",
                // colourQuaternary: "#CC9900",
                // hat: "cap",
            },
            control_blocks: controlBlocks,
            loop_blocks: controlBlocks,
            sensing_blocks: {
                colourPrimary: "#5CB1D6",
                colourSecondary: "#47A8D1",
                colourTertiary: "#2E8EB8",
                // colourQuaternary: "#2E8EB8",
            },
            text_blocks: operatorsBlocks,
            operators_blocks: operatorsBlocks,
            logic_blocks: operatorsBlocks,
            math_blocks: operatorsBlocks,
            variable_blocks: variableBlocks,
            variable_dynamic_blocks: variableBlocks,
            extension_blocks: {
                colourPrimary: "#0fBD8C",
                colourSecondary: "#0DA57A",
                colourTertiary: "#0B8E69",
                // colourQuaternary: "#0B8E69",
            },
        },
        categoryStyles: {
            style_category_motion: { colour: "#4C97FF" },
            style_category_looks: { colour: "#9966FF" },
            style_category_sound: { colour: "#CF63CF" },
            style_category_events: { colour: "#FFBF00" },
            style_category_control: { colour: "#FFAB19" },
            style_category_sensing: { colour: "#5CB1D6" },
            style_category_operators: { colour: "#59C059" },
            style_category_variables: { colour: "#FF8C1A" },
            style_category_extensions: { colour: "#0fBD8C" },
        },
        componentStyles: {
            workspaceBackgroundColour: obrTheme.background.default, //"#2e3142",
            toolboxBackgroundColour: obrTheme.background.paper,
            toolboxForegroundColour: obrTheme.text.primary,
            flyoutBackgroundColour: obrTheme.background.paper,
            flyoutForegroundColour: obrTheme.text.primary,
            insertionMarkerColour: obrTheme.secondary.main,
            scrollbarOpacity: 0.2,
            selectedGlowColour: obrTheme.primary.main,
            selectedGlowOpacity: 0.4,
        },
        startHats: true,
    });
}

export const GRID_COLOR = "#3e4152";
