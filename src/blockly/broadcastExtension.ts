import * as Blockly from "blockly";
import { withTimeout } from "owlbear-utils";
import {
    CREATE_NEW_RESOURCE,
    EXTENSION_BROADCAST,
    FIELD_BROADCAST,
    INPUT_BROADCAST,
} from "../constants";
import { addBroadcasts, promptBroadcast } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

function waitForBroadcastInSceneMetadata(name: string): Promise<void> {
    return withTimeout(
        new Promise<void>((resolve, reject) => {
            const unsubscribe = usePlayerStorage.subscribe(
                (state) => state.sceneMetadata.broadcasts,
                (broadcasts) => {
                    unsubscribe();
                    if (broadcasts.includes(name)) {
                        resolve();
                    } else {
                        reject(Error(`Broadcast with ID ${name} not found`));
                    }
                },
            );
        }),
    );
}

export function installBroadcastExtension() {
    Blockly.Extensions.register(
        EXTENSION_BROADCAST,
        function (this: Blockly.Block) {
            this.getInput(INPUT_BROADCAST)?.appendField(
                new BroadcastDropdown(),
                FIELD_BROADCAST,
            );
        },
    );
}

class BroadcastDropdown extends Blockly.FieldDropdown {
    constructor() {
        const menuGenerator = () => {
            const options: [display: string, id: string][] = [];
            options.push(
                ...usePlayerStorage
                    .getState()
                    .sceneMetadata.broadcasts.map(
                        (t): [display: string, id: string] => [t, t],
                    ),
            );
            options.sort(([a], [b]) => a.localeCompare(b));
            options.push(["New broadcast", CREATE_NEW_RESOURCE]);
            return options;
        };
        const menuValidator = (value: string | null | undefined) => {
            if (value === CREATE_NEW_RESOURCE) {
                this.#createNewBroadcast();
                return null; // disallow selection
            }
            return undefined; // allow selection
        };
        super(menuGenerator, menuValidator);
    }

    readonly #createNewBroadcast = () => {
        const name = promptBroadcast();
        if (name === CREATE_NEW_RESOURCE) {
            alert("Invalid broadcast name");
        } else if (name) {
            void waitForBroadcastInSceneMetadata(name).then(() => {
                this.getOptions(false); // refresh dynamic options
                this.setValue(name);
            });
            // Add to player storage
            // This will trigger the scene metadata subscription and resolve the promise
            // in waitForBroadcastInSceneMetadata
            void addBroadcasts(name);
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
