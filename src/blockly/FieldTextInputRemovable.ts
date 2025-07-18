import * as Blockly from "blockly";
import trash from "../../assets/trash.svg";

/**
 * Adaptation of:
 * https://github.com/scratchfoundation/scratch-blocks/blob/develop/core/field_textinput_removable.js
 */
export class FieldTextInputRemovable extends Blockly.FieldTextInput {
    static readonly TYPE = "field_input_removable";

    protected override showEditor_(
        e?: Event,
        quietInput?: boolean,
        manageEphemeralFocus?: boolean,
    ): void {
        super.showEditor_(e, quietInput, manageEphemeralFocus);

        const div = Blockly.WidgetDiv.getDiv();
        div?.classList.add("removableTextInput");

        const removeButton = document.createElement("img");
        removeButton.className = "blocklyTextRemoveIcon";
        removeButton.setAttribute("src", trash);
        removeButton.addEventListener("mousedown", this.#remove);
        div?.appendChild(removeButton);
    }

    override applyColour(): void {
        super.applyColour();
        const sourceBlock = this.getSourceBlock();
        if (
            sourceBlock &&
            !sourceBlock.isShadow() &&
            sourceBlock instanceof Blockly.BlockSvg
        ) {
            this.getBorderRect().style.fill = sourceBlock.getColourTertiary();
            this.getTextElement().style.fill = "white";
        }
    }

    readonly #remove = () => {
        let parentInput: Blockly.Input | null = this.getParentInput();
        while (parentInput) {
            const sourceInputCount =
                parentInput.getSourceBlock().inputList.length;
            if (sourceInputCount > 1) {
                parentInput.getSourceBlock().removeInput(parentInput.name);
                // parentInput.dispose();
                return;
            } else {
                parentInput =
                    parentInput
                        .getSourceBlock()
                        .outputConnection?.targetConnection?.getParentInput() ??
                    null;
            }
        }
    };
}

export function registerFieldTextInputRemovable() {
    Blockly.fieldRegistry.register(
        FieldTextInputRemovable.TYPE,
        FieldTextInputRemovable,
    );
    Blockly.Css.register(`
    .removableTextInput {
        overflow: visible;
    }

    .blocklyTextRemoveIcon {
        position: absolute;
        width: 24px;
        height: 24px;
        top: -40px;
        left: 50%;
        margin-left: -12px;
        cursor: pointer;
    }
`);
}
