import type { IVariableState } from "blockly";

export interface VariableState extends IVariableState {
    global?: boolean;
}
