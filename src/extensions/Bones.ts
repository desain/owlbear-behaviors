import OBR from "@owlbear-rodeo/sdk";
import { isObject, makeIdempotent } from "owlbear-utils";
import { TIMEOUT_DICE_MS } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

export interface BonesRoll {
    readonly type: number;
    readonly value: number;
}

export type BonesRollEvent = readonly BonesRoll[];

interface BonesLogRoll {
    readonly created: string;
    readonly rollHtml: string;
}

function isBonesLogRoll(data: unknown): data is BonesLogRoll {
    return (
        isObject(data) &&
        "created" in data &&
        typeof data.created === "string" &&
        "rollHtml" in data &&
        typeof data.rollHtml === "string"
    );
}

const ROLL_HTML_REGEX = /\s*=\s*<strong>\s*(\d+)\s*<\/strong>\s*$/;

export const Bones = {
    CHANNEL: "bones.dicetoken.broadcast",
    isBonesRollEvent: (data: unknown): data is BonesRollEvent =>
        Array.isArray(data) &&
        data.every(
            (roll) =>
                isObject(roll) &&
                "type" in roll &&
                "value" in roll &&
                typeof roll.type === "number" &&
                typeof roll.value === "number",
        ),
    roll: (notation: string, viewers: "GM" | "SELF" | "ALL") => {
        const created = new Date().toISOString();
        return new Promise<number | undefined>((resolve) => {
            const unsubscribePlayerMetadata = makeIdempotent(
                OBR.player.onChange((player) => {
                    const resultMetadata =
                        player.metadata[
                            "com.battle-system.bones/metadata_logroll"
                        ];
                    if (
                        !isBonesLogRoll(resultMetadata) ||
                        resultMetadata.created <= created
                    ) {
                        return;
                    }
                    const match = ROLL_HTML_REGEX.exec(
                        resultMetadata.rollHtml,
                    )?.[1];
                    if (match) {
                        unsubscribePlayerMetadata();
                        resolve(Number(match));
                    }
                }),
            );
            void OBR.player.setMetadata({
                "com.battle-system.bones/metadata_bonesroll": {
                    notation,
                    created,
                    senderName: "Behaviors",
                    senderId: usePlayerStorage.getState().playerId,
                    viewers,
                },
            });
            setTimeout(() => {
                unsubscribePlayerMetadata();
                resolve(undefined);
            }, TIMEOUT_DICE_MS);
        });
    },
};
