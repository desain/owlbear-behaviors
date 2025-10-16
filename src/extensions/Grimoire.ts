import OBR, { type Item } from "@owlbear-rodeo/sdk";
import {
    complain,
    containsImplies,
    isNumber,
    isObject,
    makeIdempotent,
} from "owlbear-utils";
import { TIMEOUT_DICE_MS } from "../constants";

const METADATA_KEY = "com.bitperfect-software.hp-tracker/data";
const GMG_ID = "com.tabletop-almanac.gmg";
interface GrimoireData {
    readonly hp: number;
    readonly maxHp: number;
    readonly armorClass: number;
    readonly initiative?: number;
    readonly stats?: {
        readonly tempHp?: number;
    };
}

interface DiceResponse {
    readonly requestId: string;
    readonly total?: number;
}

function isDiceResponse(data: unknown): data is DiceResponse {
    return (
        isObject(data) &&
        "requestId" in data &&
        typeof data.requestId === "string" &&
        containsImplies(data, "total", isNumber)
    );
}

interface ErrorResponse {
    readonly requestId: string;
    readonly error: string;
}

function isErrorResponse(data: unknown): data is ErrorResponse {
    return (
        isObject(data) &&
        "requestId" in data &&
        typeof data.requestId === "string" &&
        "error" in data &&
        typeof data.error === "string"
    );
}

export const Grimoire = {
    hasData: (item: Item): boolean => item.metadata[METADATA_KEY] !== undefined,

    getHp: (item: Item): number => {
        const data = item.metadata[METADATA_KEY] as GrimoireData | undefined;
        return data?.hp ?? 0;
    },

    getMaxHp: (item: Item): number => {
        const data = item.metadata[METADATA_KEY] as GrimoireData | undefined;
        return data?.maxHp ?? 0;
    },

    getTempHp: (item: Item): number => {
        const data = item.metadata[METADATA_KEY] as GrimoireData | undefined;
        return data?.stats?.tempHp ?? 0;
    },

    getArmorClass: (item: Item): number => {
        const data = item.metadata[METADATA_KEY] as GrimoireData | undefined;
        return data?.armorClass ?? 0;
    },

    getInitiative: (item: Item): number => {
        const data = item.metadata[METADATA_KEY] as GrimoireData | undefined;
        return data?.initiative ?? 0;
    },

    setHp: async (itemId: string, hp: number): Promise<void> => {
        await OBR.broadcast.sendMessage(
            `${GMG_ID}/api/hp`,
            {
                requestId: crypto.randomUUID(),
                itemId,
                hp,
            },
            { destination: "LOCAL" },
        );
    },

    setTempHp: async (itemId: string, tempHP: number): Promise<void> => {
        await OBR.broadcast.sendMessage(
            `${GMG_ID}/api/temp-hp`,
            {
                requestId: crypto.randomUUID(),
                itemId,
                tempHP,
            },
            { destination: "LOCAL" },
        );
    },

    setAc: async (itemId: string, ac: number): Promise<void> => {
        await OBR.broadcast.sendMessage(
            `${GMG_ID}/api/ac`,
            {
                requestId: crypto.randomUUID(),
                itemId,
                ac,
            },
            { destination: "LOCAL" },
        );
    },

    setInitiative: async (
        itemId: string,
        initiative: number,
    ): Promise<void> => {
        await OBR.broadcast.sendMessage(
            `${GMG_ID}/api/initiative`,
            {
                requestId: crypto.randomUUID(),
                itemId,
                initiative,
            },
            { destination: "LOCAL" },
        );
    },

    roll: (
        notation: string,
        hidden: boolean,
        label: string,
    ): Promise<number | undefined> => {
        const requestId = crypto.randomUUID();

        return new Promise<number | undefined>((resolve) => {
            const unsubscribeResult = makeIdempotent(
                OBR.broadcast.onMessage(
                    `${GMG_ID}/api/response`,
                    ({ data }) => {
                        if (
                            isDiceResponse(data) &&
                            data.requestId === requestId
                        ) {
                            unsubscribeResult();
                            unsubscribeError();
                            resolve(data.total);
                        }
                    },
                ),
            );

            const unsubscribeError = makeIdempotent(
                OBR.broadcast.onMessage(`${GMG_ID}/api/error`, ({ data }) => {
                    if (isErrorResponse(data) && data.requestId === requestId) {
                        unsubscribeResult();
                        unsubscribeError();
                        complain(data.error);
                        resolve(undefined);
                    }
                }),
            );

            void OBR.broadcast.sendMessage(
                `${GMG_ID}/api/roll`,
                {
                    requestId,
                    notation,
                    hidden,
                    label,
                },
                { destination: "LOCAL" },
            );

            setTimeout(() => {
                unsubscribeResult();
                unsubscribeError();
                resolve(undefined);
            }, TIMEOUT_DICE_MS);
        });
    },
};
