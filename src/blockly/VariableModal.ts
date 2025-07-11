import { Modal } from "@blockly/plugin-modal";
import * as Blockly from "blockly";
import { usePlayerStorage } from "../state/usePlayerStorage";
import type { BehaviorVariableMap } from "./BehaviorVariableMap";

const SCOPE_ALL = "all";

const CLASS_VARIABLE_MODAL = "variableModal";
const CLASS_VARIABLE_MODAL_LABEL = "variableModalLabel";
const CLASS_VARIABLE_MODAL_INPUT = "variableModalInput";
const CLASS_VARIABLE_MODAL_SCOPE_CONTAINER = "variableModalScopeContainer";
const CLASS_VARIABLE_MODAL_RADIO_CONTAINER = "variableModalRadioContainer";
const CLASS_VARIABLE_MODAL_RADIO = "variableModalRadio";
const CLASS_VARIABLE_MODAL_RADIO_LABEL = "variableModalRadioLabel";
const CLASS_VARIABLE_MODAL_BUTTON_CONTAINER = "variableModalButtonContainer";
const CLASS_VARIABLE_MODAL_CANCEL_BUTTON = "variableModalCancelButton";
const CLASS_VARIABLE_MODAL_CREATE_BUTTON = "variableModalCreateButton";

export class VariableModal extends Modal {
    readonly #typeName: string;
    readonly #variableType: string;

    constructor(workspace: Blockly.WorkspaceSvg, variableType: string) {
        const typeName = variableType === "" ? "Variable" : variableType;
        super(`New ${typeName}`, workspace);
        this.#typeName = typeName;
        this.#variableType = variableType;
    }

    override renderContent_(container: HTMLDivElement): HTMLElement {
        if (this.htmlDiv_) {
            this.htmlDiv_.classList.add(CLASS_VARIABLE_MODAL);
        }

        // Variable name input
        const nameLabel = document.createElement("label");
        nameLabel.textContent = `New ${this.#typeName.toLowerCase()} name:`;
        nameLabel.className = CLASS_VARIABLE_MODAL_LABEL;

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.required = true;
        nameInput.className = CLASS_VARIABLE_MODAL_INPUT;

        // Scope selection
        const scopeContainer = document.createElement("div");
        scopeContainer.className = CLASS_VARIABLE_MODAL_SCOPE_CONTAINER;

        // Create radio buttons for scope
        const scopeRadios = [
            { value: SCOPE_ALL, labelText: "For all tokens", checked: false },
            { value: "token", labelText: "For this token only", checked: true },
        ].map(({ value, labelText, checked }) => {
            const radioContainer = document.createElement("div");
            radioContainer.className = CLASS_VARIABLE_MODAL_RADIO_CONTAINER;

            const radio = document.createElement("input");
            radio.id = value;
            radio.type = "radio";
            radio.name = "scope";
            radio.value = value;
            radio.checked = checked;
            radio.className = CLASS_VARIABLE_MODAL_RADIO;

            const label = document.createElement("label");
            label.textContent = labelText;
            label.className = CLASS_VARIABLE_MODAL_RADIO_LABEL;
            label.htmlFor = value;

            radioContainer.appendChild(radio);
            radioContainer.appendChild(label);
            scopeContainer.appendChild(radioContainer);

            return radio;
        });

        // Buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.className = CLASS_VARIABLE_MODAL_BUTTON_CONTAINER;

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = CLASS_VARIABLE_MODAL_CANCEL_BUTTON;
        cancelButton.addEventListener("click", () => this.hide());

        const theme = usePlayerStorage.getState().theme;
        const createButton = document.createElement("button");
        createButton.textContent = "Create";
        createButton.className = CLASS_VARIABLE_MODAL_CREATE_BUTTON;
        createButton.style.border = `1px solid ${theme.primary.main}`;
        createButton.style.background = theme.primary.main;
        createButton.addEventListener("click", () => {
            // Determine scope (true for all tokens, false for this token only)
            const isGlobal =
                scopeRadios.find((r) => r.value === SCOPE_ALL)?.checked ??
                false;
            this.#createVariable(nameInput.value.trim(), isGlobal);
        });

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(createButton);

        // Assemble the modal
        container.appendChild(nameLabel);
        container.appendChild(nameInput);
        container.appendChild(scopeContainer);
        container.appendChild(buttonContainer);

        return container;
    }

    #createVariable(name: string, isGlobal: boolean): void {
        if (!name) {
            Blockly.dialog.alert("Please enter a variable name");
            return;
        }

        // Check if variable already exists
        const variableMap =
            this.workspace_.getVariableMap() as BehaviorVariableMap;
        const existingVariable = Blockly.Variables.nameUsedWithAnyType(
            name,
            this.workspace_,
        );
        if (existingVariable) {
            Blockly.dialog.alert(
                Blockly.Msg.VARIABLE_ALREADY_EXISTS!.replace("%1", name),
            );
            return;
        }

        // Create the variable
        variableMap.createVariable(
            name,
            this.#variableType,
            undefined,
            isGlobal,
        );

        this.hide();
        this.dispose();
    }
}

Blockly.Css.register(`
    .${CLASS_VARIABLE_MODAL} {
        color: rgb(92, 92, 92);
        
        .blocklyModalHeader {
            background: rgb(187, 153, 255);
            padding: 8px;
            color: white;
        }
        
        .${CLASS_VARIABLE_MODAL_LABEL} {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            margin-top: 16px;
        }
        
        .${CLASS_VARIABLE_MODAL_INPUT} {
            width: 100%;
            padding: 8px;
            margin-bottom: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        
        .${CLASS_VARIABLE_MODAL_SCOPE_CONTAINER} {
            margin-bottom: 20px;
            display: flex;
            justify-content: space-evenly;
            gap: 16px;
        }
        
        .${CLASS_VARIABLE_MODAL_RADIO_CONTAINER} {
            display: flex;
            align-items: center;
        }
        
        .${CLASS_VARIABLE_MODAL_RADIO} {
            margin: 0 8px 0 0;
            vertical-align: middle;
        }
        
        .${CLASS_VARIABLE_MODAL_RADIO_LABEL} {
            cursor: pointer;
            margin: 0;
            vertical-align: middle;
            line-height: 1;
        }
        
        .${CLASS_VARIABLE_MODAL_BUTTON_CONTAINER} {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .${CLASS_VARIABLE_MODAL_CANCEL_BUTTON} {
            padding: 8px 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background: #f5f5f5;
            cursor: pointer;
        }
        
        .${CLASS_VARIABLE_MODAL_CREATE_BUTTON} {
            padding: 8px 16px;
            border-radius: 4px;
            color: white;
            cursor: pointer;
        }
    }
`);
