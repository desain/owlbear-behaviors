import * as Blockly from "blockly";
import { withTimeout } from "owlbear-utils";
import { EXTENSION_TAG, FIELD_TAG, INPUT_TAG } from "../constants";
import { addTags, promptTag } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

const CREATE_NEW_TAG = "CREATE_NEW";

function waitForTagInSceneMetadata(name: string): Promise<void> {
    return withTimeout(
        new Promise<void>((resolve, reject) => {
            const unsubscribe = usePlayerStorage.subscribe(
                (state) => state.sceneMetadata.tags,
                (tags) => {
                    unsubscribe();
                    if (tags.includes(name)) {
                        resolve();
                    } else {
                        reject(Error(`Tag "${name}" not found`));
                    }
                },
            );
        }),
    );
}

function createNewTag(block: Blockly.Block) {
    const name = promptTag();
    if (name) {
        void waitForTagInSceneMetadata(name).then(() => {
            const field = block.getField(FIELD_TAG);
            if (!field || !(field instanceof Blockly.FieldDropdown)) {
                throw new Error(
                    `Field ${FIELD_TAG} not found in block ${block.type}`,
                );
            }
            field.getOptions(false);
            field.setValue(name);
        });
        void addTags(name);
    }
    return null;
}

export function installTagExtension() {
    Blockly.Extensions.register(EXTENSION_TAG, function (this: Blockly.Block) {
        const menuGenerator = () => {
            const options: Blockly.MenuOption[] = [];
            options.push(
                ...usePlayerStorage
                    .getState()
                    .sceneMetadata.tags.map(
                        (t): [display: string, id: string] => [t, t],
                    ),
            );
            options.push(["New tag", CREATE_NEW_TAG]);
            return options;
        };
        const menuValidator = (value: string) => {
            if (value === CREATE_NEW_TAG) {
                createNewTag(this);
                return null;
            }
            return undefined;
        };
        this.getInput(INPUT_TAG)?.appendField(
            new Blockly.FieldDropdown(menuGenerator, menuValidator),
            FIELD_TAG,
        );
    });
}
