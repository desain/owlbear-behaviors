import OBR, { type Item } from "@owlbear-rodeo/sdk";
import type { HexColor } from "owlbear-utils";

const CHANNEL = "com.desain.emanation/message";

export const Auras = {
    add: (id: Item["id"], style: string, color: HexColor, size: number) =>
        OBR.broadcast.sendMessage(
            CHANNEL,
            {
                type: "CREATE_AURAS",
                sources: [id],
                size,
                style,
                color,
            },
            { destination: "LOCAL" },
        ),

    removeAll: (id: Item["id"]) =>
        OBR.broadcast.sendMessage(
            CHANNEL,
            {
                type: "REMOVE_AURAS",
                sources: [id],
            },
            { destination: "LOCAL" },
        ),

    addPreset: (id: Item["id"], preset: string) =>
        OBR.broadcast.sendMessage(
            CHANNEL,
            {
                type: "CREATE_AURAS_PRESETS",
                sources: [id],
                presets: [preset],
            },
            { destination: "LOCAL" },
        ),
};
