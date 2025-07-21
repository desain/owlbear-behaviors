import type { IVariableState, Workspace } from "blockly";
import * as Blockly from "blockly";
import { isGlobal } from "../variables/VariableMap";

export class VariableSerializer extends Blockly.serialization.variables
    .VariableSerializer {
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.SERIALIZER,
            "variables",
            new VariableSerializer(),
            true,
        );
    };

    // eslint-disable-next-line class-methods-use-this
    override save = (workspace: Workspace): IVariableState[] | null => {
        const localVariableStates = workspace
            .getVariableMap()
            .getAllVariables()
            .filter((v) => !isGlobal(v))
            .map((v) => v.save());
        const usedGlobalVariableStates = Blockly.Variables.allUsedVarModels(
            workspace,
        )
            .filter((v) => isGlobal(v))
            .map((v) => v.save());
        // Save all locals, even if unused, and all used globals (so that we
        // can re-create the globals if needed, eg if we're loaded from a
        // prefab into a scene that doesn't have those globals).
        const statesToSave = [
            ...localVariableStates,
            ...usedGlobalVariableStates,
        ];
        return statesToSave.length > 0 ? statesToSave : null;
    };
}
