import { ContinuousCategory } from "@blockly/continuous-toolbox";
import * as Blockly from "blockly";
import { CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS } from "../constants";
import { EventShowEditProcedure } from "./EventShowEditProcedure";
import type { CallBlockExtraState } from "./procedures/blockCall";

const CREATE_BLOCK = "CREATE_BLOCK";

export class CategoryMyBlocks extends ContinuousCategory {
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.TOOLBOX_ITEM,
            CUSTOM_DYNAMIC_CATEGORY_MY_BLOCKS,
            CategoryMyBlocks,
        );
    };

    override getContents(): Blockly.utils.toolbox.FlyoutItemInfoArray {
        this.workspace_.registerButtonCallback(CREATE_BLOCK, () => {
            const event = new EventShowEditProcedure(this.workspace_);
            Blockly.Events.fire(event);
        });

        const items: Blockly.utils.toolbox.FlyoutItemInfoArray = [
            {
                kind: "button",
                text: "Make a Block",
                callbackkey: CREATE_BLOCK,
            },
        ];

        for (const procedure of this.workspace_
            .getProcedureMap()
            .getProcedures()) {
            items.push({
                kind: "block",
                type: "call",
                extraState: {
                    procedure: { id_: procedure.getId() },
                } satisfies CallBlockExtraState,
            });
        }

        return items;
    }
}
