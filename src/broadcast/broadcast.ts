import OBR, { Math2, type Vector2 } from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";
import { type BehaviorRegistry } from "../behaviors/BehaviorRegistry";
import {
    isSpeechBubbleParams,
    showSpeechBubble,
    type SpeechBubbleParams,
} from "../behaviors/impl/looks";
import { playSoundUntilDone } from "../behaviors/impl/sound";
import { CHANNEL_MESSAGE } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function sendMessage(name: unknown) {
    return OBR.broadcast.sendMessage(CHANNEL_MESSAGE, String(name), {
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

const STOP_ALL_SOUNDS = "STOP_ALL_SOUNDS";
interface StopAllSoundsMessage {
    readonly type: typeof STOP_ALL_SOUNDS;
}

function isStopAllSoundsMessage(message: unknown): message is StopAllSoundsMessage {
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
    readonly x: number;
    readonly y: number;
}

function isSetViewportMessage(message: unknown): message is SetViewportMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === SET_VIEWPORT &&
        "x" in message &&
        typeof message.x === "number" &&
        "y" in message &&
        typeof message.y === "number"
    );
}

/**
 * Animate the viewport to center on specified coordinates.
 */
async function animateViewportTo(x: number, y: number): Promise<void> {
    const [absolutePosition, viewportWidth, viewportHeight, scale] =
        await Promise.all([
            OBR.viewport.transformPoint({ x, y }),
            OBR.viewport.getWidth(),
            OBR.viewport.getHeight(),
            OBR.viewport.getScale(),
        ]);

    // Get the center of the viewport in screen-space
    const viewportCenter: Vector2 = {
        x: viewportWidth / 2,
        y: viewportHeight / 2,
    };

    // Offset the item center by the viewport center
    const absoluteCenter = Math2.subtract(absolutePosition, viewportCenter);

    // Convert the position to world-space
    const relativeCenter = await OBR.viewport.inverseTransformPoint(
        absoluteCenter,
    );

    // Invert and scale the world-space position to match a viewport position offset
    const position = Math2.multiply(relativeCenter, -scale);

    await OBR.viewport.animateTo({ position, scale });
}

/**
 * Center viewport on coordinates.
 */
export function broadcastSetViewport(
    x: number,
    y: number,
    destination: "LOCAL" | "ALL",
) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: SET_VIEWPORT, x, y } satisfies SetViewportMessage,
        {
            destination,
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
            void playSoundUntilDone(
                new AbortController().signal,
                data.soundName,
            );
        } else if (isStopAllSoundsMessage(data)) {
            usePlayerStorage.getState().stopAllSounds();
        } else if (isSetViewportMessage(data)) {
            void animateViewportTo(data.x, data.y);
        } else if (isShowSpeechBubbleMessage(data)) {
            void showSpeechBubble(data);
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
