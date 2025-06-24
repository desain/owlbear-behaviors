import OBR from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";
import { BEHAVIORS_IMPL } from "../behaviors/BehaviorImpl";
import { type BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import { CHANNEL_MESSAGE } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function sendMessage(name: string) {
    return OBR.broadcast.sendMessage(CHANNEL_MESSAGE, name, {
        destination: "LOCAL",
    });
}

const NEW_SELECTION = "NEW_SELECTION";
interface NewSelectionMessage {
    readonly type: typeof NEW_SELECTION;
    readonly newlySelected: string[];
    readonly deselected: string[];
}
function isNewSelectionMessage(
    message: unknown,
): message is NewSelectionMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === NEW_SELECTION &&
        "newlySelected" in message &&
        Array.isArray(message.newlySelected) &&
        message.newlySelected.every((id) => typeof id === "string") &&
        "deselected" in message &&
        Array.isArray(message.deselected) &&
        message.deselected.every((id) => typeof id === "string")
    );
}

export function notifyGmOfNewSelections(
    newlySelected: Iterable<string>,
    deselected: Iterable<string>,
) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        {
            type: NEW_SELECTION,
            newlySelected: [...newlySelected],
            deselected: [...deselected],
        } satisfies NewSelectionMessage,
        {
            destination: "REMOTE",
        },
    );
}

const DESELECT = "DESELECT";
/**
 * Message that the GM's instance of Behaviors sends to the player instances
 * to tell them to deselect items.
 */
interface DeselectMessage {
    readonly type: typeof DESELECT;
    readonly ids?: string[];
}

function isDeselectMessage(message: unknown): message is DeselectMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === DESELECT &&
        ("ids" in message
            ? Array.isArray(message.ids) &&
              message.ids.every((id) => typeof id === "string")
            : true)
    );
}

export function notifyPlayersToDeselect(ids?: string[]) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: DESELECT, ids } satisfies DeselectMessage,
        {
            destination: "REMOTE",
        },
    );
}

const PLAY_SOUND = "PLAY_SOUND";
interface PlaySoundMessage {
    readonly type: typeof PLAY_SOUND;
    readonly soundName: string;
}

function isPlaySoundMessage(message: unknown): message is PlaySoundMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === PLAY_SOUND &&
        "soundName" in message &&
        typeof message.soundName === "string"
    );
}

/**
 * Play a sound on other instances.
 */
export function broadcastPlaySound(soundName: string) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: PLAY_SOUND, soundName } satisfies PlaySoundMessage,
        {
            destination: "REMOTE",
        },
    );
}

export function installBroadcastListener(behaviorRegistry: BehaviorRegistry) {
    return OBR.broadcast.onMessage(CHANNEL_MESSAGE, ({ data }) => {
        const state = usePlayerStorage.getState();
        const isGm = state.role === "GM";
        if (!isGm && isDeselectMessage(data)) {
            void OBR.player.deselect(data.ids);
        } else if (isGm && typeof data === "string") {
            // console.log("got behavior broadcast", data);
            behaviorRegistry.handleBroadcast(data);
        } else if (isGm && isNewSelectionMessage(data)) {
            void behaviorRegistry.handleNewSelection(
                data.newlySelected,
                data.deselected,
            );
        } else if (isPlaySoundMessage(data)) {
            void BEHAVIORS_IMPL.playSoundUntilDone(
                new AbortController().signal,
                data.soundName,
            );
        } else {
            console.warn(
                "Received unknown broadcast message",
                data,
                "on channel",
                CHANNEL_MESSAGE,
            );
        }
    });
}
