import * as Blockly from "blockly";

export interface HasDragDuplicate {
    getDragDuplicate?: () => Blockly.IDraggable | undefined;
}

function hasDragDuplicate(obj: object): obj is HasDragDuplicate {
    return (
        !("getDragDuplicate" in obj) ||
        obj.getDragDuplicate === undefined ||
        typeof obj.getDragDuplicate === "function"
    );
}

export class Dragger extends Blockly.dragging.Dragger {
    constructor(
        draggable: Blockly.IDraggable,
        workspace: Blockly.WorkspaceSvg,
    ) {
        const myDraggable = hasDragDuplicate(draggable)
            ? draggable.getDragDuplicate?.() ?? draggable
            : draggable;
        super(myDraggable, workspace);
    }
}
