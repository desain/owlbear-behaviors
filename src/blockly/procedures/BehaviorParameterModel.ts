import * as Blockly from "blockly";

interface BehaviorParameterModelState
    extends Blockly.serialization.procedures.ParameterState {
    /**
     * Workaround for blockly deleting 'id' keys which I need to use.
     */
    id_?: Blockly.serialization.procedures.ParameterState["id"];
}

export class BehaviorParameterModel
    implements Blockly.Procedures.IParameterModel
{
    readonly #id: string;
    #name: string;
    #types: readonly string[];

    /**
     * @param _workspace unused
     * @param name name to display on reference block (not unique), or label text
     * @param id name to use in codegen (unique)
     * @param types parameter types (if empty, this is a label)
     */
    constructor(
        _workspace: Blockly.Workspace,
        name: string,
        id?: string,
        types: readonly string[] = [],
    ) {
        this.#name = name;
        this.#types = types;
        this.#id = id ?? Blockly.utils.idGenerator.genUid();
    }
    getName(): string {
        return this.#name;
    }

    setName(name: string): this {
        if (name === this.#name) {
            return this;
        }
        this.#name = name;
        return this;
    }

    setTypes(types: string[]): this {
        this.#types = types;
        return this;
    }

    getTypes(): string[] {
        return [...this.#types];
    }

    getId(): string {
        return this.#id;
    }

    setProcedureModel(model: Blockly.Procedures.IProcedureModel): this {
        void model;
        return this;
    }

    saveState(): BehaviorParameterModelState {
        return {
            id: this.getId(),
            id_: this.getId(),
            name: this.#name,
            types: [...this.#types],
        };
    }

    static loadState = (
        state: BehaviorParameterModelState,
        workspace: Blockly.Workspace,
    ): BehaviorParameterModel =>
        new BehaviorParameterModel(
            workspace,
            state.name,
            state.id_ ?? state.id,
            state.types,
        );
}
