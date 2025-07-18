import type * as Blockly from "blockly";

/**
 * Base Blockly makes some assumptions about how many levels to go up. That has the wrong
 * result for the continuous toolbox flyout, so here's a better implementation.
 */
export function getRootWorkspace(workspace: Blockly.Workspace) {
    let result: Blockly.Workspace = workspace;
    while (result.options.parentWorkspace) {
        // Typescript isn't smart enough to figure out that the above
        // check guarantees result.options.parentWorkspace is non-null
        result = workspace.options.parentWorkspace as Blockly.Workspace;
    }
    return result;
}
