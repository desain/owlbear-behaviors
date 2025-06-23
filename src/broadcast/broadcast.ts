import OBR from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";
import { BEHAVIOR_REGISTRY } from "../behaviors/BehaviorRegistry";
import { CHANNEL_MESSAGE } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

const BEHAVIOR_BROADCAST = "BEHAVIOR_BROADCAST";
interface BehaviorBroadcastMessage {
    readonly type: typeof BEHAVIOR_BROADCAST;
    readonly name: string;
}
function isBehaviorBroadcastMessage(
    message: unknown,
): message is BehaviorBroadcastMessage {
    return (
        isObject(message) &&
        "type" in message &&
        message.type === BEHAVIOR_BROADCAST &&
        "name" in message &&
        typeof message.name === "string"
    );
}

export function sendBroadcast(name: string) {
    return OBR.broadcast.sendMessage(
        CHANNEL_MESSAGE,
        { type: BEHAVIOR_BROADCAST, name } satisfies BehaviorBroadcastMessage,
        {
            destination: "LOCAL",
        },
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

export function installBroadcastListener() {
    return OBR.broadcast.onMessage(CHANNEL_MESSAGE, ({ data }) => {
        const state = usePlayerStorage.getState();
        const isGm = state.role === "GM";
        if (!isGm && isDeselectMessage(data)) {
            void OBR.player.deselect(data.ids);
        } else if (isGm && isBehaviorBroadcastMessage(data)) {
            // console.log("got behavior broadcast", data);
            BEHAVIOR_REGISTRY.handleBroadcast(data.name);
        } else if (isGm && isNewSelectionMessage(data)) {
            void BEHAVIOR_REGISTRY.handleNewSelection(
                data.newlySelected,
                data.deselected,
            );
            // } else if (isGm && isUpdateBackpackMessage(data)) {
            //     state.setBackpackContents(data.contents);
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
