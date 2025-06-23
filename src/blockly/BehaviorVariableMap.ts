import { VariableMap, type Workspace } from "blockly";

export class BehaviorVariableMap extends VariableMap {
    constructor(workspace: Workspace, potentialMap?: boolean) {
        // console.log("constructy", workspace, potentialMap);
        super(workspace, potentialMap);
    }
}
