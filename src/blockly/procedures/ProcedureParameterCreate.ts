/**
 * Notifies listeners that a parameter has been added to a procedure model.
 */

import {
    ProcedureParameterBase,
    type ProcedureParameterBaseJson,
} from "@blockly/block-shareable-procedures";
import * as Blockly from "blockly";
import { BehaviorParameterModel } from "./BehaviorParameterModel";

/**
 * Relaxation of [shareable procedures ProcedureParameterCreate](https://github.com/google/blockly-samples/blob/dca244f12bbc2029d0b1420fd7408078bbc15b3f/plugins/block-shareable-procedures/src/events_procedure_parameter_create.ts)
 */
export class BehaviorProcedureParameterCreate extends ProcedureParameterBase {
    readonly #index: number;

    static override readonly TYPE = "behavior_procedure_parameter_create";
    /** A string used to check the type of the event. */
    override type = BehaviorProcedureParameterCreate.TYPE;

    /**
     * Constructs the procedure parameter create event.js.
     *
     * @param workspace The workspace this event is associated with.
     * @param procedure The procedure model this event is associated with.
     * @param parameter The parameter model that was just added to the procedure.
     * @param index The index the parameter was inserted at.
     */
    constructor(
        workspace: Blockly.Workspace,
        procedure: Blockly.procedures.IProcedureModel,
        parameter: Blockly.Procedures.IParameterModel,
        index: number,
    ) {
        super(workspace, procedure, parameter);
        this.#index = index;
    }

    /**
     * Replays the event in the workspace.
     *
     * @param forward if true, play the event forward (redo), otherwise play it
     *     backward (undo).
     */
    override run(forward: boolean) {
        const workspace = this.getEventWorkspace_();
        const procedureMap = workspace.getProcedureMap();
        const procedureModel = procedureMap.get(this.procedure.getId());

        if (!procedureModel) {
            throw new Error(
                "Cannot add a parameter to a procedure that does not exist " +
                    "in the procedure map",
            );
        }

        if (forward) {
            procedureModel.insertParameter(this.parameter, this.#index);
        } else {
            procedureModel.deleteParameter(this.#index);
        }
    }

    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    override toJson(): ProcedureParameterCreateJson {
        const json = super.toJson() as ProcedureParameterCreateJson;
        json.index = this.#index;
        json.parameter = {
            id: this.parameter.getId(),
            name: this.parameter.getName(),
            types: this.parameter.getTypes(),
        };
        return json;
    }

    /**
     * Deserializes the JSON event.
     * @param json The JSON representation of a procedure parameter create event.
     * @param workspace The workspace to deserialize the event into.
     * @returns The new procedure parameter create event.
     */
    static override fromJson = (
        json: ProcedureParameterCreateJson,
        workspace: Blockly.Workspace,
    ): BehaviorProcedureParameterCreate => {
        const procedure = workspace.getProcedureMap().get(json.procedureId);

        if (!procedure) {
            throw new Error(
                "Cannot deserialize parameter create event because the " +
                    "target procedure does not exist",
            );
        }

        return new BehaviorProcedureParameterCreate(
            workspace,
            procedure,
            BehaviorParameterModel.loadState(json.parameter, workspace),
            json.index,
        );
    };
}

export interface ProcedureParameterCreateJson
    extends ProcedureParameterBaseJson {
    parameter: Blockly.serialization.procedures.ParameterState;
    index: number;
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT,
    BehaviorProcedureParameterCreate.TYPE,
    BehaviorProcedureParameterCreate,
);
