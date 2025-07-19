import * as Blockly from "blockly";
import { withTimeout } from "owlbear-utils";
import {
    CREATE_NEW_RESOURCE,
    EXTENSION_TAG,
    FIELD_TAG,
    INPUT_TAG,
} from "../constants";
import { addTags, promptTag } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

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

export function registerTagExtension() {
    Blockly.Extensions.register(EXTENSION_TAG, function (this: Blockly.Block) {
        this.getInput(INPUT_TAG)?.appendField(new TagDropdown(), FIELD_TAG);
    });
}

class TagDropdown extends Blockly.FieldDropdown {
    constructor() {
        const menuGenerator = () => {
            const options: [display: string, id: string][] = [];
            options.push(
                ...usePlayerStorage
                    .getState()
                    .sceneMetadata.tags.map(
                        (t): [display: string, id: string] => [t, t],
                    ),
            );
            options.push(["New tag", CREATE_NEW_RESOURCE]);
            return options;
        };
        const menuValidator = (value: string | null | undefined) => {
            if (value === CREATE_NEW_RESOURCE) {
                this.#createNewTag();
                return null; // disallow selection
            }
            return undefined; // allow selection
        };
        super(menuGenerator, menuValidator);
    }

    readonly #createNewTag = () => {
        const name = promptTag();
        if (name === CREATE_NEW_RESOURCE) {
            alert("Invalid tag name");
        } else if (name) {
            void waitForTagInSceneMetadata(name).then(() => {
                this.getOptions(false); // refresh dynamic options
                this.setValue(name);
            });
            void addTags(name);
        }
    };

    protected override doClassValidation_(
        newValue: string,
    ): string | null | undefined;
    protected override doClassValidation_(newValue?: string): string | null;
    /**
     * Always allow new values, since unknown options may have come from a prefab.
     */
    protected override doClassValidation_(
        newValue?: string,
    ): string | null | undefined {
        void this;
        return newValue ?? null;
    }
}
