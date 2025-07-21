import type { IVariableMap, IVariableModel } from "blockly";
import * as Blockly from "blockly";
import { VariableMap as BlocklyVariableMap, type Workspace } from "blockly";
import { getOrInsert } from "owlbear-utils";
import {
    changeVariableType,
    createVariable,
    deleteVariable,
    renameVariable,
} from "../../state/SceneMetadata";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import { VariableModel, type IBehaviorVariableModel } from "./VariableModel";
import type { VariableState } from "./VariableState";

export function isGlobal(model: IVariableModel<VariableState>) {
    return model instanceof VariableModel
        ? model.isSceneGlobal?.() ?? false
        : false;
}

export class VariableMap implements IVariableMap<IBehaviorVariableModel> {
    static readonly register = () => {
        Blockly.registry.register(
            Blockly.registry.Type.VARIABLE_MAP,
            Blockly.registry.DEFAULT,
            VariableMap,
            true,
        );
    };

    readonly locals: BlocklyVariableMap;
    readonly globals = new Map<VariableState["id"], IBehaviorVariableModel>();

    constructor(workspace: Workspace, potentialMap?: boolean) {
        this.locals = new BlocklyVariableMap(workspace, potentialMap);
        if (!potentialMap) {
            (usePlayerStorage.getState().sceneMetadata.vars ?? []).forEach(
                (v) => this.#getGlobal(v),
            );
        }
    }

    readonly #isPotentialMap = () => this.locals.potentialMap;

    readonly #getGlobal = (state: VariableState): IBehaviorVariableModel =>
        getOrInsert(
            this.globals,
            state.id,
            () =>
                new VariableModel(
                    this.locals.workspace,
                    state.name,
                    state.type,
                    state.id,
                    true,
                ),
        );

    readonly #getGlobals = (): IBehaviorVariableModel[] =>
        // Potential maps don't include globals
        [...this.globals.values()];

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
            if (this.#isPotentialMap()) {
                throw Error("potential map cannot create globals");
            }

            const state: VariableState = {
                name,
                id: opt_id ?? Blockly.utils.idGenerator.genUid(),
                type: opt_type ?? "",
                global: sceneGlobal,
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
        const conflictVar = this.getVariableById(variable.getId());
        if (conflictVar) {
            // don't check name mismatch because it's fine it someone
            // saves a workspace, then renames a global variable, then
            // loads the workspace again
            if (variable.getType() !== conflictVar.getType()) {
                throw Error("attempt to recreate variable with different type");
            } else {
                return; // don't recreate existing variables
            }
        }

        if (variable.isSceneGlobal?.()) {
            if (this.#isPotentialMap()) {
                throw Error("potential map cannot create globals");
            }
            void createVariable(variable.save());
            this.globals.set(variable.getId(), variable);
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
            if (this.#isPotentialMap()) {
                throw Error("potential map cannot rename globals");
            }

            void renameVariable(variable.getId(), newName);
            variable.setName(newName);

            // Apply to blocks
            let existingGroup = "";
            if (!this.#isPotentialMap()) {
                existingGroup = Blockly.Events.getGroup();
                if (!existingGroup) {
                    Blockly.Events.setGroup(true);
                }
            }

            try {
                if (!this.#isPotentialMap()) {
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
                if (!this.#isPotentialMap()) {
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
            if (this.#isPotentialMap()) {
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
        // Local deletion logic clears away blocks
        this.locals.deleteVariable(variable);

        // If it's a global, also delete the scene's resource
        if (variable.isSceneGlobal?.()) {
            if (this.#isPotentialMap()) {
                throw Error("potential map cannot delete globals");
            }

            void deleteVariable(variable.getId());
            this.globals.delete(variable.getId());
            Blockly.Events.fire(
                new (Blockly.Events.get(Blockly.Events.VAR_DELETE))(variable),
            );
        }
    };

    clear(): void {
        this.locals.clear();
    }
}
