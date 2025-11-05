import * as Blockly from "blockly";
import {
    DROPDOWN_BROADCAST_DEFAULT,
    DROPDOWN_SOUND_MEOW,
    DROPDOWN_TAG_DEFAULT,
    FIELD_BROADCAST,
    FIELD_SOUND,
    FIELD_TAG,
} from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";
import {
    BLOCK_BROADCAST_MENU,
    BLOCK_RECEIVE_BROADCAST,
    BLOCK_SENSING_TAG_MENU,
    BLOCK_SOUND_MENU,
} from "./blocks";

export function handleNewSceneMetadata(workspace: Blockly.WorkspaceSvg): void {
    const store = usePlayerStorage.getState();

    // Remove broadcasts that no longer exist in scene metadata
    workspace.getAllBlocks().forEach((block) => {
        if (
            block.type === BLOCK_BROADCAST_MENU.type ||
            block.type === BLOCK_RECEIVE_BROADCAST.type
        ) {
            const dropdown = block.getField(FIELD_BROADCAST);
            if (dropdown && dropdown instanceof Blockly.FieldDropdown) {
                const oldValue = dropdown.getValue();
                dropdown.getOptions(false); // Force refresh
                const broadcasts = store.sceneMetadata.broadcasts;
                if (oldValue && broadcasts.includes(oldValue)) {
                    // If the old value is still valid, keep it selected
                    dropdown.setValue(oldValue);
                } else {
                    // Fall back to the first available broadcast
                    dropdown.setValue(
                        broadcasts[0] ?? DROPDOWN_BROADCAST_DEFAULT,
                    );
                }
                dropdown.forceRerender();
            }
        }
    });

    // Remove tags that no longer exist in scene metadata
    workspace.getAllBlocks().forEach((block) => {
        if (block.type === BLOCK_SENSING_TAG_MENU.type) {
            const dropdown = block.getField(FIELD_TAG);
            if (dropdown && dropdown instanceof Blockly.FieldDropdown) {
                const oldValue = dropdown.getValue();
                dropdown.getOptions(false); // Force refresh
                const tags = store.sceneMetadata.tags;
                if (oldValue && tags.includes(oldValue)) {
                    // If the old value is still valid, keep it selected
                    dropdown.setValue(oldValue);
                } else {
                    // Fall back to the first available tag
                    dropdown.setValue(tags[0] ?? DROPDOWN_TAG_DEFAULT);
                }
                dropdown.forceRerender();
            }
        }
    });

    // Remove sounds that no longer exist in scene metadata
    workspace.getAllBlocks().forEach((block) => {
        if (block.type === BLOCK_SOUND_MENU.type) {
            const dropdown = block.getField(FIELD_SOUND);
            if (dropdown && dropdown instanceof Blockly.FieldDropdown) {
                const oldValue = dropdown.getValue();
                dropdown.getOptions(false); // Force refresh
                const sounds = Object.keys(store.sceneMetadata.sounds);
                if (oldValue && sounds.includes(oldValue)) {
                    // If the old value is still valid, keep it selected
                    dropdown.setValue(oldValue);
                } else {
                    // Fall back to the first available sound
                    dropdown.setValue(sounds[0] ?? DROPDOWN_SOUND_MEOW);
                }
                dropdown.forceRerender();
            }
        }
    });
}
