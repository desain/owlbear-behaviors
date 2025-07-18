import {
    ProcedureCreate,
    ProcedureDelete,
    ProcedureParameterDelete,
    ProcedureRename,
    triggerProceduresUpdate,
} from "@blockly/block-shareable-procedures";
import * as Blockly from "blockly";
import { BehaviorParameterModel } from "./BehaviorParameterModel";
import { BehaviorProcedureParameterCreate } from "./ProcedureParameterCreate";

export interface BehaviorProcedureModelState
    extends Blockly.serialization.procedures.State {
    /**
     * Workaround for blockly deleting 'id' keys which I need to use.
     */
    id_: Blockly.serialization.procedures.State["id"];
}

export class BehaviorProcedureModel
    implements Blockly.Procedures.IProcedureModel, Blockly.IObservable
{
    static assertInstance(
        model: Blockly.Procedures.IProcedureModel,
    ): asserts model is BehaviorProcedureModel {
        if (!(model instanceof BehaviorProcedureModel)) {
            throw Error("model should be behavior procedure model");
        }
    }

    readonly #id: string;
    readonly #workspace: Blockly.Workspace;
    readonly #parameters: Blockly.Procedures.IParameterModel[] = [];
    #shouldTriggerUpdates = true;
    #shouldFireEvents = false;
    #name: string;
    #enabled = true;

    /**
     * @param workspace Owner workspace
     * @param name base for constructing function name (unique)
     * @param id unique id (if undefined, a new one will be constructed)
     */
    constructor(workspace: Blockly.Workspace, name: string, id?: string) {
        this.#workspace = workspace;
        this.#name = name;
        this.#id = id ?? Blockly.utils.idGenerator.genUid();
    }

    /**
     * Disables triggering updates to procedure blocks until the endBulkUpdate
     * is called.
     */
    startBulkUpdate() {
        this.#shouldTriggerUpdates = false;
    }

    /**
     * Triggers an update to procedure blocks. Should be used with
     * startBulkUpdate.
     */
    endBulkUpdate() {
        this.#shouldTriggerUpdates = true;
        triggerProceduresUpdate(this.#workspace);
    }

    startPublishing(): void {
        this.#shouldFireEvents = true;
        Blockly.Events.fire(new ProcedureCreate(this.#workspace, this));
        for (const param of this.#parameters) {
            if (Blockly.isObservable(param)) {
                param.startPublishing();
            }
        }
    }

    stopPublishing(): void {
        triggerProceduresUpdate(this.#workspace);

        const event = new ProcedureDelete(this.#workspace, this);
        // Procedure deletions happen when blocks are deleted, so the block
        // delete event will take care of restoring the procedure
        event.recordUndo = false;

        Blockly.Events.fire(event);
        this.#shouldFireEvents = false;
        for (const param of this.#parameters) {
            if (Blockly.isObservable(param)) {
                param.stopPublishing();
            }
        }
    }

    getId(): string {
        return this.#id;
    }

    getWorkspace(): Blockly.Workspace {
        return this.#workspace;
    }

    getName(): string {
        return this.#name;
    }

    setName(name: string): this {
        if (name === this.#name) {
            return this;
        }
        const oldName = this.#name;
        this.#name = name;

        if (this.#shouldTriggerUpdates) {
            triggerProceduresUpdate(this.#workspace);
        }

        if (this.#shouldFireEvents) {
            Blockly.Events.fire(
                new ProcedureRename(this.#workspace, this, oldName),
            );
        }

        return this;
    }

    getEnabled(): boolean {
        return this.#enabled;
    }

    setEnabled(enabled: boolean): this {
        if (enabled === this.#enabled) {
            return this;
        }

        this.#enabled = enabled;

        if (this.#shouldTriggerUpdates) {
            triggerProceduresUpdate(this.#workspace);
        }

        if (this.#shouldFireEvents) {
            // TODO is this needed?
            // Blockly.Events.fire(new ProcedureEnable(this.#workspace, this));
        }

        return this;
    }

    getReturnTypes(): string[] | null {
        void this;
        return null;
    }

    setReturnTypes(types: string[] | null): this {
        if (types !== null) {
            throw Error("Return types not supported");
        }
        return this;
    }

    /**
     * @throws on invalid index
     */
    getParameter(index: number): Blockly.Procedures.IParameterModel {
        const param = this.#parameters[index];
        if (!param) {
            throw Error("Invalid parameter index");
        }
        return param;
    }

    getParameters(): Blockly.Procedures.IParameterModel[] {
        return [...this.#parameters];
    }

    insertParameter(
        parameterModel: Blockly.Procedures.IParameterModel,
        index: number,
    ): this {
        if (
            this.#parameters[index] &&
            this.#parameters[index].getId() === parameterModel.getId()
        ) {
            return this;
        }

        this.#parameters.splice(index, 0, parameterModel);

        parameterModel.setProcedureModel(this);

        if (Blockly.isObservable(parameterModel)) {
            if (this.#shouldFireEvents) {
                parameterModel.startPublishing();
            } else {
                parameterModel.stopPublishing();
            }
        }

        if (this.#shouldTriggerUpdates) {
            triggerProceduresUpdate(this.#workspace);
        }

        if (this.#shouldFireEvents) {
            Blockly.Events.fire(
                new BehaviorProcedureParameterCreate(
                    this.#workspace,
                    this,
                    parameterModel,
                    index,
                ),
            );
        }

        return this;
    }

    deleteParameter(index: number): this {
        const oldParam = this.#parameters[index];
        if (!oldParam) {
            return this;
        }

        this.#parameters.splice(index, 1);

        if (this.#shouldTriggerUpdates) {
            triggerProceduresUpdate(this.#workspace);
        }

        if (Blockly.isObservable(oldParam)) {
            oldParam.stopPublishing();
        }

        if (this.#shouldFireEvents) {
            Blockly.Events.fire(
                new ProcedureParameterDelete(
                    this.#workspace,
                    this,
                    oldParam,
                    index,
                ),
            );
        }

        return this;
    }

    saveState(): BehaviorProcedureModelState {
        return {
            id: this.getId(),
            id_: this.getId(),
            name: this.getName(),
            returnTypes: this.getReturnTypes(),
            parameters: this.getParameters().map((p) => p.saveState()),
        };
    }

    static readonly loadState = (
        state: BehaviorProcedureModelState,
        workspace: Blockly.Workspace,
    ): BehaviorProcedureModel => {
        const model = new BehaviorProcedureModel(
            workspace,
            state.name,
            state.id_,
        ).setReturnTypes(state.returnTypes);
        model.#shouldTriggerUpdates = false;
        state.parameters?.forEach((p) =>
            model.insertParameter(
                BehaviorParameterModel.loadState(p, workspace),
                model.getParameters().length,
            ),
        );
        model.#shouldTriggerUpdates = true;
        return model;
    };
}
