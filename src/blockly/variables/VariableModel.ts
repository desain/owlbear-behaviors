import * as Blockly from "blockly";
import {
    VariableModel as BlocklyVariableModel,
    type IVariableModel,
    type Workspace,
} from "blockly";
import type { VariableState } from "./VariableState";

export interface IBehaviorVariableModel extends IVariableModel<VariableState> {
    isSceneGlobal?: () => boolean;
}

export class VariableModel
    extends BlocklyVariableModel
    implements IBehaviorVariableModel
{
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.VARIABLE_MODEL,
            Blockly.registry.DEFAULT,
            VariableModel,
            true,
        );
    };

    readonly sceneGlobal: boolean;

    constructor(
        workspace: Workspace,
        name: string,
        opt_type?: string,
        opt_id?: string,
        opt_isSceneGlobal?: boolean,
    ) {
        super(workspace, name, opt_type, opt_id);
        this.sceneGlobal = opt_isSceneGlobal ?? false;
    }

    isSceneGlobal = (): boolean => this.sceneGlobal;

    override save = (): VariableState => ({
        ...super.save(),
        // local is default so don't save 'false' for locals
        global: this.isSceneGlobal() ? true : undefined,
    });

    static override load = (state: VariableState, workspace: Workspace) => {
        const variable = new VariableModel(
            workspace,
            state.name,
            state.type,
            state.id,
            state.global, // CHANGE: add global
        );
        workspace.getVariableMap().addVariable(variable);
        Blockly.Events.fire(
            new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable),
        );
    };
}
