import type { IVariableMap, IVariableModel, IVariableState } from "blockly";
import * as Blockly from "blockly";
import { VariableMap, VariableModel, type Workspace } from "blockly";
import { getOrInsert } from "owlbear-utils";
import {
    changeVariableType,
    createVariable,
    deleteVariable,
    renameVariable,
} from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function isGlobal(model: IVariableModel<IVariableState>) {
    return model instanceof BehaviorVariableModel
        ? model.isSceneGlobal?.() ?? false
        : false;
}

interface IBehaviorVariableModel extends IVariableModel<IVariableState> {
    isSceneGlobal?: () => boolean;
}

/**
 * Serializer that only saves script-local variables.
 */
export class BehaviorVariableSerializer extends Blockly.serialization.variables
    .VariableSerializer {
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.SERIALIZER,
            "variables",
            new BehaviorVariableSerializer(),
            true,
        );
    };

    // eslint-disable-next-line class-methods-use-this
    override save = (workspace: Workspace): IVariableState[] | null => {
        const localVariableStates = workspace
            .getVariableMap()
            .getAllVariables()
            .filter((v) => !isGlobal(v))
            .map((v) => v.save());
        return localVariableStates.length > 0 ? localVariableStates : null;
    };
}

export class BehaviorVariableModel
    extends VariableModel
    implements IBehaviorVariableModel
{
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.VARIABLE_MODEL,
            Blockly.registry.DEFAULT,
            BehaviorVariableModel,
            true,
        );
    };

    readonly sceneGlobal: boolean;

    constructor(
        workspace: Workspace,
        name: string,
        opt_type?: string,
        opt_id?: string,
        opt_isSceneGlobal?: boolean,
    ) {
        super(workspace, name, opt_type, opt_id);
        this.sceneGlobal = opt_isSceneGlobal ?? false;
    }

    isSceneGlobal = (): boolean => this.sceneGlobal;
}

export class BehaviorVariableMap
    implements IVariableMap<IBehaviorVariableModel>
{
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.VARIABLE_MAP,
            Blockly.registry.DEFAULT,
            BehaviorVariableMap,
            true,
        );
    };

    readonly locals: VariableMap;
    readonly globals = new Map<IVariableState["id"], IBehaviorVariableModel>();

    constructor(workspace: Workspace, potentialMap?: boolean) {
        // console.log("constructy", potentialMap);
        this.locals = new VariableMap(workspace, potentialMap);
    }

    readonly #getGlobal = (state: IVariableState): IBehaviorVariableModel =>
        getOrInsert(
            this.globals,
            state.id,
            () =>
                new BehaviorVariableModel(
                    this.locals.workspace,
                    state.name,
                    state.type,
                    state.id,
                    true,
                ),
        );

    readonly #getGlobals = (): IBehaviorVariableModel[] =>
        // Potential maps don't include globals
        (this.locals.potentialMap
            ? []
            : usePlayerStorage.getState().sceneMetadata.vars ?? []
        ).map(this.#getGlobal);

    readonly getVariableById = (id: string): IBehaviorVariableModel | null => {
        const local = this.locals.getVariableById(id);
        if (local) {
            return local;
        }
        return this.#getGlobals().find((v) => v.getId() === id) ?? null;
    };

    readonly getVariable = (
        name: string,
        type?: string,
    ): IBehaviorVariableModel | null => {
        const local = this.locals.getVariable(name, type);
        if (local) {
            return local;
        }
        return (
            this.#getGlobals().find(
                (v) => v.getName() === name && v.getType() === (type ?? ""),
            ) ?? null
        );
    };

    readonly getAllVariables = (): IBehaviorVariableModel[] => [
        ...this.locals.getAllVariables(),
        ...this.#getGlobals(),
    ];

    readonly getVariablesOfType = (type: string): IBehaviorVariableModel[] => [
        ...this.locals.getVariablesOfType(type),
        ...this.#getGlobals().filter((v) => v.getType() === type),
    ];

    getTypes = (): string[] => [
        ...new Set([
            ...this.locals.getTypes(),
            ...this.#getGlobals().map((v) => v.getType()),
        ]),
    ];

    createVariable(
        name: string,
        opt_type?: string,
        opt_id?: string,
        sceneGlobal?: boolean,
    ): IBehaviorVariableModel {
        const conflictVar = this.getVariable(name, opt_type);
        if (conflictVar) {
            if (opt_id && opt_id !== conflictVar.getId()) {
                throw Error(`Name ${name} in use`);
            } else {
                return conflictVar;
            }
        } else if (opt_id && this.getVariableById(opt_id)) {
            throw Error(`ID ${opt_id} in use`);
        }

        if (sceneGlobal) {
            if (this.locals.potentialMap) {
                throw Error("potential map cannot create globals");
            }

            const state: IVariableState = {
                name,
                id: opt_id ?? Blockly.utils.idGenerator.genUid(),
                type: opt_type ?? "",
            };
            void createVariable(state);
            const variable = this.#getGlobal(state);

            Blockly.Events.fire(
                new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable),
            );

            return variable;
        } else {
            return this.locals.createVariable(name, opt_type, opt_id);
        }
    }

    addVariable = (variable: IBehaviorVariableModel): void => {
        if (variable.isSceneGlobal?.()) {
            if (this.locals.potentialMap) {
                throw Error("potential map cannot create globals");
            }
            void createVariable(variable.save());
        } else {
            this.locals.addVariable(variable);
        }
    };

    renameVariable = (
        variable: IBehaviorVariableModel,
        newName: string,
    ): IBehaviorVariableModel => {
        const conflictVar = this.getVariable(newName, variable.getType());
        if (conflictVar && conflictVar.getId() !== variable.getId()) {
            throw Error(`A variable named "${newName}" already exists.`);
        }

        if (variable.isSceneGlobal?.()) {
            if (this.locals.potentialMap) {
                throw Error("potential map cannot rename globals");
            }

            void renameVariable(variable.getId(), newName);
            variable.setName(newName);

            // Apply to blocks
            let existingGroup = "";
            if (!this.locals.potentialMap) {
                existingGroup = Blockly.Events.getGroup();
                if (!existingGroup) {
                    Blockly.Events.setGroup(true);
                }
            }

            try {
                if (!this.locals.potentialMap) {
                    Blockly.Events.fire(
                        new (Blockly.Events.get(Blockly.Events.VAR_RENAME))(
                            variable,
                            newName,
                        ),
                    );
                }
                variable.setName(newName);
                for (const block of this.locals.workspace.getAllBlocks(false)) {
                    block.updateVarName(variable);
                }
            } finally {
                if (!this.locals.potentialMap) {
                    Blockly.Events.setGroup(existingGroup);
                }
            }

            return variable;
        } else {
            return this.locals.renameVariable(variable, newName);
        }
    };

    changeVariableType(
        variable: IBehaviorVariableModel,
        newType: string,
    ): IBehaviorVariableModel {
        if (variable.isSceneGlobal?.()) {
            if (this.locals.potentialMap) {
                throw Error("potential map cannot change globals");
            }
            void changeVariableType(variable.getId(), newType);
            variable.setType(newType);
            return variable;
        } else {
            return this.locals.changeVariableType(variable, newType);
        }
    }

    deleteVariable = (variable: IBehaviorVariableModel): void => {
        if (variable.isSceneGlobal?.()) {
            if (this.locals.potentialMap) {
                throw Error("potential map cannot delete globals");
            }

            this.globals.delete(variable.getId());
            void deleteVariable(variable.getId());
            Blockly.Events.fire(
                new (Blockly.Events.get(Blockly.Events.VAR_DELETE))(variable),
            );
        }
        // Local deletion logic clears away blocks
        this.locals.deleteVariable(variable);
    };

    clear(): void {
        this.locals.clear();
    }
}
