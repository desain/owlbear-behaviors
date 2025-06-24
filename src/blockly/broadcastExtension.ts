import * as Blockly from "blockly";
import { withTimeout } from "owlbear-utils";
import {
    EXTENSION_BROADCAST,
    FIELD_BROADCAST,
    INPUT_BROADCAST,
} from "../constants";
import { addBroadcast, promptBroadcast } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

const CREATE_NEW_BROADCAST = "CREATE_NEW";

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

function createNewBroadcast(block: Blockly.Block) {
    const name = promptBroadcast();
    if (name) {
        // Add to scene metadata
        void waitForBroadcastInSceneMetadata(name).then(() => {
            const field = block.getField(FIELD_BROADCAST);
            if (!field || !(field instanceof Blockly.FieldDropdown)) {
                throw new Error(
                    `Field ${FIELD_BROADCAST} not found in block ${block.type}`,
                );
            }
            field.getOptions(false); // Refresh options, disabling cache
            field.setValue(name);
        });
        // Add to player storage
        // This will trigger the scene metadata subscription and resolve the promise
        // in waitForBroadcastInSceneMetadata
        void addBroadcast(name);
    }
    return null; // disallow selection
}

export function installBroadcastExtension() {
    Blockly.Extensions.register(
        EXTENSION_BROADCAST,
        function (this: Blockly.Block) {
            const menuGenerator = () => {
                const options: Blockly.MenuOption[] = [];

                options.push(
                    ...usePlayerStorage
                        .getState()
                        .sceneMetadata.broadcasts.map(
                            (b): [display: string, id: string] => [b, b],
                        ),
                );
                // Always add "Create Message" option at the end
                options.push(["New message", CREATE_NEW_BROADCAST]);

                return options;
            };

            const menuValidator = (value: string) => {
                if (value === CREATE_NEW_BROADCAST) {
                    // Open dialog to create new broadcast
                    createNewBroadcast(this);
                    return null; // disallow selection
                }
                return undefined; // allow selection
            };

            this.getInput(INPUT_BROADCAST)?.appendField(
                new Blockly.FieldDropdown(menuGenerator, menuValidator),
                FIELD_BROADCAST,
            );
        },
    );
}
