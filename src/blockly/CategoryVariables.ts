import { ContinuousCategory } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";
import { shadowDynamic } from "./shadows";

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

export class CategoryVariables extends ContinuousCategory {
    override getContents(): Blockly.utils.toolbox.FlyoutItemInfoArray {
        // Adapted from https://github.com/google/blockly/blob/02f89d6f96d27cea3e718a1e774c89f5589f155e/core/variables.ts
        this.workspace_.registerButtonCallback(CREATE_VARIABLE, (button) => {
            Blockly.Variables.createVariableButtonHandler(
                button.getTargetWorkspace(),
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

        items.push(
            ...[...variables]
                .sort(Blockly.Variables.compareByName)
                .map((variable) => ({
                    kind: "block",
                    type: "variables_get",
                    gap: 8,
                    fields: generateVariableFieldJson(variable),
                })),
            { kind: "sep", gap: 20 },
        );

        const mostRecentVariable = variables.slice(-1)[0];
        if (mostRecentVariable) {
            items.push({
                kind: "block",
                type: "variables_set_dynamic",
                gap: 8,
                fields: generateVariableFieldJson(mostRecentVariable),
                inputs: {
                    VALUE: shadowDynamic("0"),
                },
            });

            items.push({
                kind: "block",
                type: "math_change",
                gap: 20,
                fields: generateVariableFieldJson(mostRecentVariable),
                inputs: {
                    DELTA: {
                        shadow: {
                            type: "math_number",
                            fields: {
                                NUM: 1,
                            },
                        },
                    },
                },
            });
        }

        return items;
    }
}
