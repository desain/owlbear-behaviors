import * as Blockly from "blockly";
import { EXTENSION_SOUND, FIELD_SOUND, INPUT_SOUND } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function installSoundExtension() {
    Blockly.Extensions.register(
        EXTENSION_SOUND,
        function (this: Blockly.Block) {
            const menuGenerator = () => {
                const options: Blockly.MenuOption[] = [];
                options.push(
                    ...Object.keys(
                        usePlayerStorage.getState().sceneMetadata.sounds,
                    ).map((name): [display: string, id: string] => [
                        name,
                        name,
                    ]),
                );
                return options;
            };
            this.getInput(INPUT_SOUND)?.appendField(
                new Blockly.FieldDropdown(menuGenerator),
                FIELD_SOUND,
            );
        },
    );
}
