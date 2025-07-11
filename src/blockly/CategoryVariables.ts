import { ContinuousCategory } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";
import { shadowDynamic, shadowNumber } from "./shadows";
import { VARIABLE_TYPE_LIST } from "../constants";
import {
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
    BLOCK_VARIABLE_REPORTER,
    BLOCK_VARIABLE_SETTER,
    BLOCK_VARIABLE_CHANGE,
} from "./blocks";
import { GAP50 } from "./toolbox";

/**
 * Returns the JSON definition for a variable field.
 * Copied from https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables.ts#L163
 * since Blockly doesn't export it.
 *
 * @param variable The variable the field should reference.
 * @returns JSON for a variable field.
 */
function generateVariableFieldJson(
    variable: Blockly.IVariableModel<Blockly.IVariableState>,
) {
    return {
        VAR: {
            name: variable.getName(),
            type: variable.getType(),
        },
    };
}

const CREATE_VARIABLE = "CREATE_VARIABLE";
const CREATE_LIST = "CREATE_LIST";

export class CategoryVariables extends ContinuousCategory {
    override getContents(): Blockly.utils.toolbox.FlyoutItemInfoArray {
        // Adapted from https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables.ts
        this.workspace_.registerButtonCallback(CREATE_VARIABLE, (button) => {
            Blockly.Variables.createVariableButtonHandler(
                button.getTargetWorkspace(),
            );
        });
        this.workspace_.registerButtonCallback(CREATE_LIST, (button) => {
            Blockly.Variables.createVariableButtonHandler(
                button.getTargetWorkspace(),
                undefined,
                VARIABLE_TYPE_LIST,
            );
        });

        const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [
            {
                kind: "button",
                text: "Make a Variable",
                callbackkey: CREATE_VARIABLE,
            },
        ];

        // Adapted from https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables.ts#L183
        const variables = this.workspace_.getVariableMap().getAllVariables();

        const regularVariables = variables.filter((v) => v.getType() === "");

        items.push(
            ...[...regularVariables]
                .sort(Blockly.Variables.compareByName)
                .map((variable) => ({
                    kind: "block",
                    type: BLOCK_VARIABLE_REPORTER.type,
                    gap: 8,
                    fields: generateVariableFieldJson(variable),
                })),
            { kind: "sep", gap: 24 },
        );

        const mostRecentVariable = regularVariables.slice(-1)[0];
        if (mostRecentVariable) {
            items.push({
                kind: "block",
                type: BLOCK_VARIABLE_SETTER.type,
                fields: generateVariableFieldJson(mostRecentVariable),
                inputs: {
                    [BLOCK_VARIABLE_SETTER.args0[1].name]: shadowDynamic("0"),
                },
            });

            items.push({
                kind: "block",
                type: BLOCK_VARIABLE_CHANGE.type,
                fields: generateVariableFieldJson(mostRecentVariable),
                inputs: {
                    [BLOCK_VARIABLE_CHANGE.args0[1].name]: shadowNumber(1),
                },
            });
        }

        items.push({
            kind: "button",
            text: "Make a List",
            callbackkey: CREATE_LIST,
        });

        const listVariables = variables.filter(
            (v) => v.getType() === VARIABLE_TYPE_LIST,
        );

        items.push(
            ...[...listVariables]
                .sort(Blockly.Variables.compareByName)
                .map((variable) => ({
                    kind: "block",
                    type: BLOCK_LIST_REPORTER.type,
                    gap: 8,
                    fields: generateVariableFieldJson(variable),
                })),
            { kind: "sep", gap: 24 },
        );

        const mostRecentList = listVariables.slice(-1)[0];
        if (mostRecentList) {
            items.push(
                {
                    kind: "block",
                    type: BLOCK_LIST_ADD.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_ADD.args0[0].name]: shadowDynamic("thing"),
                    },
                },
                GAP50,
                {
                    kind: "block",
                    type: BLOCK_LIST_DELETE.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_DELETE.args0[0].name]: shadowNumber(1),
                    },
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_CLEAR.type,
                    fields: generateVariableFieldJson(mostRecentList),
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_INSERT.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_INSERT.args0[0].name]:
                            shadowDynamic("thing"),
                        [BLOCK_LIST_INSERT.args0[1].name]: shadowNumber(1),
                    },
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_REPLACE.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_REPLACE.args0[0].name]: shadowNumber(1),
                        [BLOCK_LIST_REPLACE.args0[2].name]:
                            shadowDynamic("thing"),
                    },
                },
                GAP50,
                {
                    kind: "block",
                    type: BLOCK_LIST_INDEX.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_INDEX.args0[0].name]: shadowNumber(1),
                    },
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_INDEX_OF.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_INDEX_OF.args0[0].name]:
                            shadowDynamic("thing"),
                    },
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_LENGTH.type,
                    fields: generateVariableFieldJson(mostRecentList),
                },
                {
                    kind: "block",
                    type: BLOCK_LIST_CONTAINS.type,
                    fields: generateVariableFieldJson(mostRecentList),
                    inputs: {
                        [BLOCK_LIST_CONTAINS.args0[1].name]:
                            shadowDynamic("thing"),
                    },
                },
            );
        }

        return items;
    }
}
