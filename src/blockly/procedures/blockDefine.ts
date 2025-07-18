import * as Blockly from "blockly";
import { INPUT_CUSTOM_BLOCK } from "../../constants";
import { EventShowEditProcedure } from "../EventShowEditProcedure";
import {
    BehaviorProcedureModel,
    type BehaviorProcedureModelState,
} from "./BehaviorProcedureModel";
import {
    BLOCK_TYPE_ARGUMENT_REPORTER,
    type ArgumentReporterExtraState,
} from "./blockArgumentReporter";
import { BLOCK_TYPE_CALL, type CallBlockExtraState } from "./blockCall";
import { getRootWorkspace } from "./getRootWorkspace";
import { findLegalName } from "./procedureUtils";

export const BLOCK_TYPE_DEFINE = "define";

interface DefineBlockFields {
    model?: BehaviorProcedureModel;
}

export interface DefineBlockExtraState {
    /**
     * Either just the procedure ID (if we didn't save extra state),
     * or state to use to recreate the procedure, for when the block
     * is copy-pasted or put into a flyout.
     */
    procedure:
        | {
              /**
               * Can't use Pick for this since Typescript turns the type into unknown
               * due to the extra {[key: string]: unknown} prop in State.
               */
              id_: BehaviorProcedureModelState["id_"];
          }
        | BehaviorProcedureModelState;
}

export type DefineBlock = Blockly.Block &
    DefineBlockFields &
    DefineBlockDefinition;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DefineBlockDefinition extends DefineBlockMixinType {}
type DefineBlockMixinType = typeof DEFINITION;

const DEFINITION = {
    init: function (this: DefineBlock) {
        this.jsonInit({
            style: "my_blocks",
            tooltip: "%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}",
            message0: "define %1",
            args0: [
                {
                    type: "input_statement",
                    name: INPUT_CUSTOM_BLOCK,
                },
            ],
            nextStatement: null,
            inputsInline: true,
        });
    },

    destroy: function (this: DefineBlock) {
        // (Optionally) Destroy the model when the definition block is deleted.

        // Insertion markers reference the model of the original block.
        if (this.isInsertionMarker()) {
            return;
        }

        if (this.model) {
            this.workspace.getProcedureMap().delete(this.model.getId());
        }
    },

    getProcedureModel: function (
        this: DefineBlock,
    ): Blockly.Procedures.IProcedureModel {
        if (this.model) {
            return this.model;
        } else {
            throw Error("No procedure model");
        }
    },

    isProcedureDef: () => true,

    // If your procedure references variables
    // then you should return those models here.
    // getVarModels: () => [],

    doProcedureUpdate: function (this: DefineBlock) {
        // This block should never be in the toolbox flyout, and if it's in the
        // backpack flyout, it should never need to update its procedure. The
        // shadow loading logic should take care of populating the prototype
        if (!this.model || this.isDeadOrDying() || this.isInFlyout) {
            return;
        }

        const newModel = this.workspace
            .getProcedureMap()
            .get(this.model.getId());

        if (newModel) {
            BehaviorProcedureModel.assertInstance(newModel);
            this.model = newModel;
        } else {
            // model was deleted
            console.warn(
                "define.doProcedureUpdate: procedure not in workspace, disposing",
            );
            this.dispose(true);
            return;
        }

        this.setDisabledReason(
            !this.model.getEnabled(),
            "PROCEDURE_MODEL_DISABLED",
        );

        this.getInput(INPUT_CUSTOM_BLOCK)?.connection?.setShadowState({
            type: BLOCK_TYPE_CALL,
            extraState: {
                procedure: { id_: this.model.getId() },
            } satisfies CallBlockExtraState,
            inputs: Object.fromEntries(
                this.model
                    .getParameters()
                    .filter((p) => p.getTypes().length > 0)
                    .map((parameter) => [
                        parameter.getId(),
                        {
                            shadow: {
                                type: BLOCK_TYPE_ARGUMENT_REPORTER,
                                extraState: {
                                    procedure: { id_: this.model!.getId() },
                                    parameterId: parameter.getId(),
                                } satisfies ArgumentReporterExtraState,
                            },
                        },
                    ]),
            ),
        });
    },

    // When doFullSerialization is true, we should serialize the full state of
    // the model.
    saveExtraState: function (
        this: DefineBlock,
        doFullSerialization?: boolean,
    ): DefineBlockExtraState {
        if (!this.model) {
            throw Error("saveExtraState: no model");
        }

        return {
            procedure: doFullSerialization
                ? this.model.saveState()
                : { id_: this.model.getId() },
        };
    },

    loadExtraState: function (this: DefineBlock, state: DefineBlockExtraState) {
        // console.log("define.loadExtraState");

        if ("name" in state.procedure) {
            // if we're pasting or loading a flyout, we might be able
            // to reuse our saved ID, but only if it's not already
            // in use
            const id_ = this.workspace
                .getProcedureMap()
                .get(state.procedure.id_)
                ? Blockly.utils.idGenerator.genUid()
                : state.procedure.id_;

            this.model = BehaviorProcedureModel.loadState(
                {
                    ...state.procedure,
                    id_,
                    id: id_, // this isn't used but set it just in case
                    name: findLegalName(state.procedure.name, this.workspace),
                },
                this.workspace,
            );

            // if we're in a flyout like the backpack, don't save procedures.
            // When we're copied to the main workspace, we'll populate our
            // procedure definition there
            if (!this.isInFlyout) {
                this.workspace.getProcedureMap().add(this.model);
            }
        } else {
            const model = this.workspace
                .getProcedureMap()
                .get(state.procedure.id_);
            if (model) {
                BehaviorProcedureModel.assertInstance(model);
            }
            this.model = model;
        }
        this.doProcedureUpdate();
    },

    customContextMenu: function (
        this: DefineBlock,
        items: (
            | Blockly.ContextMenuRegistry.ContextMenuOption
            | Blockly.ContextMenuRegistry.LegacyContextMenuOption
        )[],
    ) {
        // Don't show 'edit' menu for flyout item
        if (this.isInFlyout) {
            return;
        }

        items.splice(0, items.length); // remove other items
        items.push({
            text: "Edit",
            enabled: true,
            callback: () =>
                Blockly.Events.fire(
                    new EventShowEditProcedure(
                        getRootWorkspace(this.workspace),
                        this.model?.getId(),
                    ),
                ),
        });
    } satisfies Blockly.BlockSvg["customContextMenu"],
};

export function installBlockDefine() {
    Blockly.Blocks[BLOCK_TYPE_DEFINE] =
        DEFINITION satisfies Blockly.Procedures.IProcedureBlock;
}

export function isDefineBlock(block: Blockly.Block): block is DefineBlock {
    return block.type === BLOCK_TYPE_DEFINE;
}
