import OBR, { type Player } from "@owlbear-rodeo/sdk";
import { complain, isObject, makeIdempotent } from "owlbear-utils";
import { PLUGIN_ID, TIMEOUT_DICE_MS } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

const SOURCE = `${PLUGIN_ID}/dice-plus`;

interface RollRequest {
    rollId: string;
    playerId: Player["id"];
    playerName: Player["name"];
    rollTarget: "everyone" | "self" | "dm";
    diceNotation: string;
    showResults: boolean;
    timestamp: number;
    source: string;
}

interface RollResult {
    rollId: string;
    result: {
        totalValue: number;
    };
}

function isRollResult(data: unknown): data is RollResult {
    return (
        isObject(data) &&
        "rollId" in data &&
        typeof data.rollId === "string" &&
        "result" in data &&
        isObject(data.result) &&
        "totalValue" in data.result &&
        typeof data.result.totalValue === "number"
    );
}

interface RollError {
    rollId: string;
    error: string;
}

function isRollError(data: unknown): data is RollError {
    return (
        isObject(data) &&
        "rollId" in data &&
        typeof data.rollId === "string" &&
        "error" in data &&
        typeof data.error === "string"
    );
}

export const DicePlus = {
    roll: async (
        notation: string,
        rollTarget: "everyone" | "dm",
    ): Promise<number | undefined> => {
        const name = await OBR.player.getName();
        const rollId = crypto.randomUUID();
        const request = {
            rollId,
            playerId: usePlayerStorage.getState().playerId,
            playerName: name,
            rollTarget,
            diceNotation: notation,
            showResults: true,
            timestamp: Date.now(),
            source: SOURCE,
        } satisfies RollRequest;
        console.log(request);

        return new Promise((resolve) => {
            const unsubscribeRollResult = makeIdempotent(
                OBR.broadcast.onMessage(`${SOURCE}/roll-result`, (event) => {
                    const data = event.data;
                    if (isRollResult(data) && data.rollId === rollId) {
                        unsubscribeRollResult();
                        unsubscribeError();
                        resolve(data.result.totalValue);
                    }
                }),
            );

            const unsubscribeError = makeIdempotent(
                OBR.broadcast.onMessage(`${SOURCE}/roll-error`, (event) => {
                    const data = event.data;
                    if (isRollError(data) && data.rollId === rollId) {
                        unsubscribeRollResult();
                        unsubscribeError();
                        complain(data.error);
                        resolve(undefined);
                    }
                }),
            );

            void OBR.broadcast.sendMessage("dice-plus/roll-request", request, {
                destination: "ALL",
            });

            setTimeout(() => {
                unsubscribeRollResult();
                unsubscribeError();
                resolve(undefined);
            }, TIMEOUT_DICE_MS);
        });
    },
};
