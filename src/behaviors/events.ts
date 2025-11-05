import OBR from "@owlbear-rodeo/sdk";
import { getId } from "owlbear-utils";
import { isBehaviorItem } from "../BehaviorItem";
import { broadcastTo, broadcastToAll } from "../broadcast/broadcast";
import { METADATA_KEY_TAGS } from "../constants";

export const EVENTS_BEHAVIORS = {
    broadcastToAll: async (signal: AbortSignal, messageUnknown: unknown) => {
        await broadcastToAll(String(messageUnknown));
        signal.throwIfAborted();
    },

    broadcastTo: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        messageUnknown: unknown,
        targetProxy: unknown,
    ) => {
        const selfId = String(selfIdUnknown);
        if (targetProxy === "ALL") {
            await broadcastToAll(String(messageUnknown));
        } else {
            const targets =
                targetProxy === "SELF"
                    ? [selfId]
                    : targetProxy === "CHILDREN"
                    ? (await OBR.scene.items.getItemAttachments([selfId]))
                          .filter((item) => item.id !== selfId)
                          .map(getId)
                    : [String(targetProxy)];
            await broadcastTo(String(messageUnknown), targets);
        }
        signal.throwIfAborted();
    },

    broadcastToTagged: async (
        signal: AbortSignal,
        messageUnknown: unknown,
        tagUnknown: unknown,
    ) => {
        const tag = String(tagUnknown);
        const targets = await OBR.scene.items.getItems(
            (item) =>
                isBehaviorItem(item) &&
                !!item.metadata[METADATA_KEY_TAGS]?.includes(tag),
        );
        await broadcastTo(String(messageUnknown), targets.map(getId));
        signal.throwIfAborted();
    },
};
