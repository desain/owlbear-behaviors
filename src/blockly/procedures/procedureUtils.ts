import * as Blockly from "blockly";
import { BehaviorProcedureModel } from "./BehaviorProcedureModel";
import { BLOCK_TYPE_DEFINE, type DefineBlockExtraState } from "./blockDefine";
import { getRootWorkspace } from "./getRootWorkspace";

/**
 * Grab a reference to the new model.
 * If we're in a flyout, we might be in the toolbox flyout,
 * in which case we want to get the procedure definition from
 * the root workspace.
 * Or we could be in the backpack, in which case we want to
 * see if the backpack has a procedure definition for us first
 * So try the current workspace and fall back to the root one
 */
export function lookupProcedureWithFallback(
    workspace: Blockly.Workspace,
    procedureId: string,
): BehaviorProcedureModel | undefined {
    const result =
        workspace.getProcedureMap().get(procedureId) ??
        getRootWorkspace(workspace).getProcedureMap().get(procedureId);
    if (result) {
        BehaviorProcedureModel.assertInstance(result);
    }
    return result;
}

export function addDefineBlock(
    workspace: Blockly.Workspace,
    model: BehaviorProcedureModel,
) {
    Blockly.serialization.blocks.append(
        {
            type: BLOCK_TYPE_DEFINE,
            extraState: {
                procedure: { id_: model.getId() },
            } satisfies DefineBlockExtraState,
        },
        workspace,
    );
}

/**
 * Copy of identical function from Blockly but making the 'block' parameter
 * optional, since this can be called with a partially-initialized block
 */
export function findLegalName(
    name: string,
    workspace: Blockly.Workspace,
): string {
    while (
        workspace
            .getProcedureMap()
            .getProcedures()
            .some((p) => p.getName() === name)
    ) {
        // Collision with another procedure.
        const r = /^(.*?)(\d+)$/.exec(name);
        if (!r) {
            name += "2";
        } else if (r[1] && r[2]) {
            name = r[1] + (parseInt(r[2]) + 1);
        } else {
            throw Error("failed to parse procedure name");
        }
    }
    return name;
}
