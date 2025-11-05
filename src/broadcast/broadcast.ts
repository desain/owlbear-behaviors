import OBR, { type Item, type Vector2 } from "@owlbear-rodeo/sdk";
import { deferCallAll, isObject, isVector2 } from "owlbear-utils";
import { type BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import {
    isSpeechBubbleParams,
    setViewport,
    showSpeechBubble,
    type SpeechBubbleParams,
} from "../behaviors/impl/looks";
import { playSoundUntilDone } from "../behaviors/impl/sound";
import { CHANNEL_MESSAGE } from "../constants";
import { Bones } from "../extensions/Bones";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function broadcastToAll(message: string) {
    return OBR.broadcast.sendMessage(CHANNEL_MESSAGE, message, {
        destination: "LOCAL",
    });
}

const BROADCAST_TO = "BROADCAST_TO";
export interface BroadcastToMessage {
    readonly type: typeof BROADCAST_TO;
    readonly message: string;
    readonly targets: readonly Item["id"][];
}

function isBroadcastToMessage(message: unknown): message is BroadcastToMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === BROADCAST_TO &&
        "message" in message &&
        typeof message.message === "string" &&
        "targets" in message &&
        Array.isArray(message.targets) &&
        message.targets.every((t) => typeof t === "string")
    );
}

export function broadcastTo(message: string, targets: Item["id"][]) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        {
            type: BROADCAST_TO,
            message,
            targets,
        } satisfies BroadcastToMessage,
        { destination: "LOCAL" },
    );
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
    readonly volume: number;
}

function isPlaySoundMessage(message: unknown): message is PlaySoundMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === PLAY_SOUND &&
        "soundName" in message &&
        typeof message.soundName === "string" &&
        "volume" in message &&
        typeof message.volume === "number"
    );
}

/**
 * Play a sound on other instances.
 */
export function broadcastPlaySound(soundName: string, volume: number) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: PLAY_SOUND, soundName, volume } satisfies PlaySoundMessage,
        {
            destination: "REMOTE",
        },
    );
}

const STOP_ALL_SOUNDS = "STOP_ALL_SOUNDS";
interface StopAllSoundsMessage {
    readonly type: typeof STOP_ALL_SOUNDS;
}

function isStopAllSoundsMessage(
    message: unknown,
): message is StopAllSoundsMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === STOP_ALL_SOUNDS
    );
}

/**
 * Stop all sounds on other instances.
 */
export function broadcastStopAllSounds() {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: STOP_ALL_SOUNDS } satisfies StopAllSoundsMessage,
        {
            destination: "REMOTE",
        },
    );
}

const SET_VIEWPORT = "SET_VIEWPORT";
interface SetViewportMessage {
    readonly type: typeof SET_VIEWPORT;
    readonly zoom?: number;
    readonly center?: Vector2;
}

function isSetViewportMessage(message: unknown): message is SetViewportMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === SET_VIEWPORT &&
        (!("zoom" in message) || typeof message.zoom === "number") &&
        (!("center" in message) || isVector2(message.center))
    );
}

/**
 * Center viewport on coordinates.
 */
export function broadcastSetViewport(zoom?: number, center?: Vector2) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: SET_VIEWPORT, zoom, center } satisfies SetViewportMessage,
        {
            destination: "REMOTE",
        },
    );
}

const SHOW_SPEECH_BUBBLE = "SHOW_SPEECH_BUBBLE";

/**
 * Message to show a (local item) speech bubble on other instances.
 */
interface ShowSpeechBubbleMessage extends SpeechBubbleParams {
    readonly type: typeof SHOW_SPEECH_BUBBLE;
}

function isShowSpeechBubbleMessage(
    message: unknown,
): message is ShowSpeechBubbleMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === SHOW_SPEECH_BUBBLE &&
        isSpeechBubbleParams(message)
    );
}

export function broadcastShowSpeechBubble(params: SpeechBubbleParams) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        {
            type: SHOW_SPEECH_BUBBLE,
            ...params,
        } satisfies ShowSpeechBubbleMessage,
        { destination: "REMOTE" },
    );
}

const STOP_ALL_BEHAVIORS = "STOP_ALL_BEHAVIORS";

interface StopAllBehaviorsMessage {
    readonly type: typeof STOP_ALL_BEHAVIORS;
}

function isStopAllBehaviorsMessage(message: unknown) {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === STOP_ALL_BEHAVIORS
    );
}

export function broadcastStopAllBehaviors() {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: STOP_ALL_BEHAVIORS } satisfies StopAllBehaviorsMessage,
        {
            destination: "LOCAL",
        },
    );
}

function installBonesListener(behaviorRegistry: BehaviorRegistry) {
    return OBR.broadcast.onMessage(Bones.CHANNEL, ({ data }) => {
        const state = usePlayerStorage.getState();
        const isGm = state.role === "GM";

        if (isGm && Bones.isBonesRollEvent(data)) {
            for (const roll of data) {
                behaviorRegistry.handleBonesRoll(roll);
            }
        }
    });
}

export function installBroadcastListener(behaviorRegistry: BehaviorRegistry) {
    const unsubscribeBones = installBonesListener(behaviorRegistry);
    const unsubscribeMain = OBR.broadcast.onMessage(
        CHANNEL_MESSAGE,
        ({ data }) => {
            const state = usePlayerStorage.getState();
            const isGm = state.role === "GM";
            if (!isGm && isDeselectMessage(data)) {
                void OBR.player.deselect(data.ids);
            } else if (isGm && typeof data === "string") {
                behaviorRegistry.handleBroadcast(data);
            } else if (isGm && isBroadcastToMessage(data)) {
                behaviorRegistry.handleBroadcast(data.message, data.targets);
            } else if (isGm && isNewSelectionMessage(data)) {
                void behaviorRegistry.handleNewSelection(
                    data.newlySelected,
                    data.deselected,
                );
            } else if (isPlaySoundMessage(data)) {
                void playSoundUntilDone(
                    new AbortController().signal,
                    data.soundName,
                    data.volume,
                );
            } else if (isStopAllSoundsMessage(data)) {
                usePlayerStorage.getState().stopAllSounds();
            } else if (isSetViewportMessage(data)) {
                void setViewport(data.zoom, data.center);
            } else if (isShowSpeechBubbleMessage(data)) {
                void showSpeechBubble(data);
            } else if (isStopAllBehaviorsMessage(data)) {
                void behaviorRegistry.stopAll();
            } else {
                console.warn(
                    "Received unknown broadcast message",
                    data,
                    "on channel",
                    CHANNEL_MESSAGE,
                );
            }
        },
    );

    return deferCallAll(unsubscribeBones, unsubscribeMain);
}
