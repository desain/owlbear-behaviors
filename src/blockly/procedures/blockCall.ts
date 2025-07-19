import * as Blockly from "blockly";
import { BLOCK_DYNAMIC_VAL } from "../blocks";
import type { BehaviorProcedureModelState } from "./BehaviorProcedureModel";
import { BehaviorProcedureModel } from "./BehaviorProcedureModel";
import {
    addDefineBlock,
    findLegalName,
    lookupProcedureWithFallback,
} from "./procedureUtils";

export const BLOCK_TYPE_CALL = "call";

interface CallBlockFields {
    model?: BehaviorProcedureModel;
}

export interface CallBlockExtraState {
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

export type CallBlock = Blockly.Block & CallBlockFields & CallBlockDefinition;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CallBlockDefinition extends CallBlockMixinType {}
type CallBlockMixinType = typeof DEFINITION;

/**
 * This block has to be defined using Javascript rather than JSON,
 * since it needs to use the extraState management.
 *
 * It needs extraState because the 'data' serialization parameter
 * is not available during init.
 *
 * extraState doesn't work with JSON because JSON extensions can't
 * use extraState without being mutators, and this block doesn't
 * have a mutator.
 */
const DEFINITION = {
    init: function (this: CallBlock) {
        this.jsonInit({
            style: "my_blocks",
            message0: "",
            previousStatement: null,
            nextStatement: null,
            inputsInline: true,
        });
    },

    getProcedureModel: function (
        this: CallBlock,
    ): Blockly.Procedures.IProcedureModel {
        if (this.model) {
            return this.model;
        } else {
            throw Error("call: no procedure model");
        }
    },

    isProcedureDef: () => false,

    // If your procedure references variables
    // then you should return those models here.
    // getVarModels: () => [],

    doProcedureUpdate: function (this: CallBlock) {
        if (!this.model || this.isDeadOrDying()) {
            return;
        }

        // If we're in a toolbox flyout, the procedure category recreation
        // logic should take care of updating us, so we can keep our
        // existing model.
        // If we're in the backpack, we don't ever update our model.
        const newModel = this.isInFlyout
            ? this.model
            : lookupProcedureWithFallback(this.workspace, this.model.getId());

        if (newModel) {
            this.model = newModel;
        } else {
            // model was deleted
            console.warn(
                "call.doProcedureUpdate: procedure not in workspace, disposing",
            );
            this.dispose(true);
            return;
        }

        this.setTooltip(
            Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP?.replace(
                "%1",
                this.model.getName(),
            ) ?? "",
        );

        this.setDisabledReason(
            !this.model.getEnabled(),
            "PROCEDURE_MODEL_DISABLED",
        );

        // Save previous connections
        const prevConnections = new Map<
            string,
            | { shadow: Blockly.serialization.blocks.State }
            | { block: Blockly.Block }
        >();
        for (const input of this.inputList) {
            const block = input.connection?.targetBlock();
            if (block) {
                if (block.isShadow()) {
                    const saved = Blockly.serialization.blocks.save(block);
                    if (!saved) {
                        throw Error("failed to save shadow block");
                    }
                    prevConnections.set(input.name, { shadow: saved });
                } else {
                    prevConnections.set(input.name, { block });
                }
            }
        }

        // Reset all inputs
        this.inputList
            .map((input) => input.name)
            .forEach((name) => this.removeInput(name));

        // Recreate inputs
        for (const parameter of this.model.getParameters()) {
            // a paramter with no input types is just a label
            if (parameter.getTypes().length === 0) {
                this.appendDummyInput().appendField(parameter.getName());
            } else {
                const input = this.appendValueInput(parameter.getId()).setCheck(
                    parameter.getTypes(),
                );

                const takesString = parameter.getTypes().includes("String");
                const takesNumber = parameter.getTypes().includes("Number");

                if (takesString) {
                    input.connection?.setShadowState({
                        type: BLOCK_DYNAMIC_VAL.type,
                        fields: {
                            [BLOCK_DYNAMIC_VAL.args0[0].name]: "",
                        },
                    });
                } else if (takesNumber) {
                    input.connection?.setShadowState({
                        type: "math_number",
                        fields: {
                            NUM: 0,
                        },
                    });
                }

                const prevConnection = prevConnections.get(input.name);
                if (prevConnection) {
                    if ("shadow" in prevConnection) {
                        input.connection?.setShadowState(prevConnection.shadow);
                    } else if (prevConnection.block.outputConnection) {
                        input.connection?.connect(
                            prevConnection.block.outputConnection,
                        );
                    }
                }
            }
        }
        // for deleted fields, disconnect any non-shadow connected blocks
    },

    saveExtraState: function (
        this: CallBlock,
        doFullSerialization?: boolean,
    ): CallBlockExtraState {
        if (!this.model) {
            throw Error("saveExtraState: no model");
        }

        return {
            procedure: doFullSerialization
                ? this.model.saveState()
                : { id_: this.model.getId() },
        };
    },

    loadExtraState: function (this: CallBlock, state: CallBlockExtraState) {
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

        if (this.model) {
            this.doProcedureUpdate();
        } else {
            throw Error("failed to load procedure for call block");
        }
    },

    // Handle pasting after the procedure definition has been deleted.
    onchange: function (this: CallBlock, event: Blockly.Events.BlockCreate) {
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
    },
};

export function registerBlockCall() {
    Blockly.Blocks[BLOCK_TYPE_CALL] =
        DEFINITION satisfies Blockly.Procedures.IProcedureBlock;
}
