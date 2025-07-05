import OBR from "@owlbear-rodeo/sdk";
import { produce } from "immer";
import { isObject } from "owlbear-utils";
import {
    DROPDOWN_BROADCAST_DEFAULT,
    DROPDOWN_SOUND_MEOW,
    DROPDOWN_TAG_DEFAULT,
    METADATA_KEY_SCENE,
} from "../constants";

export interface SoundDefinition {
    url: string;
}
function isSoundDefinition(obj: unknown): obj is SoundDefinition {
    return isObject(obj) && "url" in obj && typeof obj.url === "string";
}

export interface SceneMetadata {
    broadcasts: string[];
    tags: string[];
    sounds: Record</*sound name*/ string, SoundDefinition>;
}
export function isSceneMetadata(metadata: unknown): metadata is SceneMetadata {
    return (
        isObject(metadata) &&
        "broadcasts" in metadata &&
        Array.isArray(metadata.broadcasts) &&
        metadata.broadcasts.every(
            (broadcast) => typeof broadcast === "string",
        ) &&
        "tags" in metadata &&
        Array.isArray(metadata.tags) &&
        metadata.tags.every((tag) => typeof tag === "string") &&
        "sounds" in metadata &&
        isObject(metadata.sounds) &&
        Object.values(metadata.sounds).every(isSoundDefinition)
    );
}

export const DEFAULT_SCENE_METADATA = {
    broadcasts: [DROPDOWN_BROADCAST_DEFAULT],
    tags: [DROPDOWN_TAG_DEFAULT],
    sounds: {
        [DROPDOWN_SOUND_MEOW]: {
            url: "https://cdn.freesound.org/previews/732/732520_13416215-lq.mp3",
        },
    },
} satisfies SceneMetadata;

async function getSceneMetadata(): Promise<SceneMetadata> {
    const currentMetadata =
        (await OBR.scene.getMetadata())[METADATA_KEY_SCENE] ??
        DEFAULT_SCENE_METADATA;
    if (!isSceneMetadata(currentMetadata)) {
        throw Error("Invalid scene metadata");
    }
    return currentMetadata;
}

export function promptBroadcast() {
    return prompt("New message name:")?.trim();
}

export async function addBroadcasts(...broadcasts: string[]) {
    const currentMetadata = await getSceneMetadata();
    const newMetadata = produce(currentMetadata, (draft) => {
        for (const broadcast of broadcasts) {
            if (!draft.broadcasts.includes(broadcast)) {
                draft.broadcasts.push(broadcast);
            }
        }
        draft.broadcasts.sort();
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export async function removeBroadcast(broadcast: string) {
    const currentMetadata = await getSceneMetadata();
    if (currentMetadata.broadcasts.length <= 1) {
        throw Error("Cannot delete the last broadcast");
    }
    const newMetadata = produce(currentMetadata, (draft) => {
        draft.broadcasts = draft.broadcasts.filter((b) => b !== broadcast);
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export function promptTag() {
    return prompt("New tag name:")?.trim();
}

export async function addTags(...tags: string[]) {
    const currentMetadata = await getSceneMetadata();
    const newMetadata = produce(currentMetadata, (draft) => {
        for (const tag of tags) {
            if (!draft.tags.includes(tag)) {
                draft.tags.push(...tags);
            }
        }
        draft.tags.sort();
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export async function removeTag(tag: string) {
    const currentMetadata = await getSceneMetadata();
    if (currentMetadata.tags.length <= 1) {
        throw Error("Cannot delete the last tag");
    }
    const newMetadata = produce(currentMetadata, (draft) => {
        draft.tags = draft.tags.filter((t) => t !== tag);
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export async function addSound(name: string, sound: SoundDefinition) {
    const currentMetadata = await getSceneMetadata();
    const newMetadata = produce(currentMetadata, (draft) => {
        draft.sounds[name] = sound;
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export async function removeSound(soundName: string) {
    const currentMetadata = await getSceneMetadata();
    if (Object.keys(currentMetadata.sounds).length <= 1) {
        throw new Error("Cannot delete the last sound");
    }
    const newMetadata = produce(currentMetadata, (draft) => {
        delete draft.sounds[soundName];
    });
    return OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
}

export async function renameSound(
    oldName: string,
    newName: string,
): Promise<boolean> {
    const currentMetadata = await getSceneMetadata();
    if (currentMetadata.sounds[newName]) {
        console.warn(`Sound name ${newName} already exists`);
        return false;
    }

    const newMetadata = produce(currentMetadata, (draft) => {
        const oldDefinition = draft.sounds[oldName];
        if (oldDefinition) {
            draft.sounds[newName] = oldDefinition;
            delete draft.sounds[oldName];
        }
    });
    await OBR.scene.setMetadata({ [METADATA_KEY_SCENE]: newMetadata });
    return true;
}
