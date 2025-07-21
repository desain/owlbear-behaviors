import * as Blockly from "blockly";
import { MIXIN_DRAG_TO_DUPE } from "../../constants";
import type { BehaviorProcedureModelState } from "./BehaviorProcedureModel";
import { BehaviorProcedureModel } from "./BehaviorProcedureModel";
import {
    addDefineBlock,
    findLegalName,
    lookupProcedureWithFallback,
} from "./procedureUtils";

export const BLOCK_TYPE_ARGUMENT_REPORTER = "argument_reporter";
const FIELD_NAME = "NAME";

interface ArgumentReporterFields {
    model?: BehaviorProcedureModel;
    parameterId: string;
}

export interface ArgumentReporterExtraState {
    parameterId: string;
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

export type ArgumentReporterBlock = Blockly.Block &
    ArgumentReporterFields &
    ArgumentReporterDefinition;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ArgumentReporterDefinition extends ArgumentReporterBlockMixinType {}
type ArgumentReporterBlockMixinType = typeof DEFINITION;

const DEFINITION = {
    init: function (this: ArgumentReporterBlock) {
        this.jsonInit({
            style: "my_blocks",
            message0: "%1",
            args0: [
                {
                    type: "field_label",
                    name: FIELD_NAME,
                },
            ],
            output: null,
            inputsInline: true,
            extensions: [MIXIN_DRAG_TO_DUPE],
        });
    },

    getProcedureModel: function (
        this: ArgumentReporterBlock,
    ): Blockly.Procedures.IProcedureModel {
        if (this.model) {
            return this.model;
        } else {
            throw Error("call: no procedure model");
        }
    },

    isProcedureDef: () => false,

    doProcedureUpdate: function (this: ArgumentReporterBlock) {
        if (!this.model || this.isDeadOrDying()) {
            return;
        }

        // If we're in a toolbox flyout, the parent call block's
        // doProcedureUpdate should take care of updating us, so
        // we can keep our existing model.
        // If we're in the backpack, we don't ever update our model.
        const newModel = this.isInFlyout
            ? this.model
            : lookupProcedureWithFallback(this.workspace, this.model.getId());

        if (newModel) {
            this.model = newModel;
        } else {
            // model was deleted
            console.warn(
                "argumentReporter.doProcedureUpdate: procedure not in workspace, disposing",
            );
            this.dispose(true);
            return;
        }

        this.setDisabledReason(
            !this.model.getEnabled(),
            "PROCEDURE_MODEL_DISABLED",
        );

        const param = this.model
            .getParameters()
            .find((p) => p.getId() === this.parameterId);

        if (!param) {
            // parameter was deleted
            console.warn(
                "argumentReporter.doProcedureUpdate: parameter not found, disposing",
            );
            this.dispose(true);
            return;
        }

        this.setFieldValue(param.getName(), FIELD_NAME);
        this.outputConnection?.setCheck(param.getTypes());
    },

    saveExtraState: function (
        this: ArgumentReporterBlock,
        doFullSerialization?: boolean,
    ): ArgumentReporterExtraState {
        if (!this.model) {
            throw Error("saveExtraState: no model");
        }

        return {
            parameterId: this.parameterId,
            procedure: doFullSerialization
                ? this.model.saveState()
                : { id_: this.model.getId() },
        };
    },

    loadExtraState: function (
        this: ArgumentReporterBlock,
        state: ArgumentReporterExtraState,
    ) {
        this.parameterId = state.parameterId;

        if (this.model) {
            throw Error("Shouldn't have model yet");
        }

        // Look up existing model
        // TODO: don't look it up if we're in a backpack, but do look it up if
        // we're in the toolbox flyout
        const existingModel = lookupProcedureWithFallback(
            this.workspace,
            state.procedure.id_,
        );

        // Set this.model
        if (existingModel) {
            this.model = existingModel;
        } else if ("name" in state.procedure) {
            // The procedure doesn't exist in the workspace, but we
            // were created with a copy of it, so load that
            this.model = BehaviorProcedureModel.loadState(
                {
                    ...state.procedure,
                    // even though the procedure doesn't exist, another one with
                    // the same name might exist, so we might need to rename
                    name: findLegalName(state.procedure.name, this.workspace),
                },
                this.workspace,
            );

            // Maybe this block was pasted into the main workspace after the
            // procedure was deleted, in which case we want to recreate the
            // procedure and its define block.
            // Or maybe it's in a backpack flyout, in which case we want to
            // just keep the model for ourselves and not create anything.
            if (!this.isInFlyout) {
                this.workspace.getProcedureMap().add(this.model);
                addDefineBlock(this.workspace, this.model);
            }
        }

        // Grab a reference to the new model.
        if (this.model) {
            this.doProcedureUpdate();
        } else {
            throw Error("failed to load procedure for argument reporter block");
        }
    },

    onchange: function (
        this: ArgumentReporterBlock,
        event: Blockly.Events.BlockCreate,
    ) {
        // Handle pasting after the procedure definition has been deleted.
        // TODO: some kind of handling here for parameter missing?
        if (
            event.type === Blockly.Events.BLOCK_CREATE &&
            event.blockId === this.id
        ) {
            if (!this.model) {
                // Our procedure definition doesn't exist =(
                console.warn("onchange without model");
                this.dispose();
            }
        }

        // Disable if we're not in the right procedure definition
        if (
            !(
                this.workspace instanceof Blockly.WorkspaceSvg &&
                this.workspace.isDragging()
            ) &&
            event.type === Blockly.Events.BLOCK_MOVE &&
            !this.isInsertionMarker() &&
            !this.isDeadOrDying()
        ) {
            const rootBlock = this.getRootBlock();
            const enabled =
                rootBlock !== this &&
                Blockly.procedures.isProcedureBlock(rootBlock) &&
                rootBlock.isProcedureDef() &&
                rootBlock.getProcedureModel() === this.model;

            const initialGroup = Blockly.Events.getGroup();
            // Make it so the move and the disable event get undone together.
            Blockly.Events.setGroup(event.group);
            this.setDisabledReason(!enabled, "DISABLE_MISPLACED_ARG");
            this.setWarningText(
                enabled
                    ? null
                    : "This block can only be used in the definition of the custom block it came from",
                "WARN_MISPLACED_ARG",
            );
            Blockly.Events.setGroup(initialGroup);
        }
    },
};

export function registerBlockArgumentReporter() {
    Blockly.Blocks[BLOCK_TYPE_ARGUMENT_REPORTER] =
        DEFINITION satisfies Blockly.procedures.IProcedureBlock;
}
