import * as Blockly from "blockly";
import { EventShowEditProcedure } from "./EventShowEditProcedure";
import { getRootWorkspace } from "./procedures/procedureUtils";

export function registerContextMenuEdit() {
    Blockly.ContextMenuRegistry.registry.register({
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: "editBlock",
        displayText: "Edit",
        weight: 0,
        preconditionFn: (scope) =>
            scope.focusedNode instanceof Blockly.BlockSvg &&
            !scope.focusedNode.isInFlyout &&
            Blockly.Procedures.isProcedureBlock(scope.focusedNode)
                ? "enabled"
                : "hidden",
        callback: (scope) => {
            if (
                scope.focusedNode instanceof Blockly.BlockSvg &&
                Blockly.Procedures.isProcedureBlock(scope.focusedNode)
            ) {
                Blockly.Events.fire(
                    new EventShowEditProcedure(
                        getRootWorkspace(scope.focusedNode.workspace),
                        scope.focusedNode.getProcedureModel().getId(),
                    ),
                );
            }
        },
    });
}
