// This file is for integrating with D&D Beyond.
// It fetches character data from the D&D Beyond API.

import { withTimeout } from "owlbear-utils";

interface Stat {
    score: number;
    modifier: number;
}

export interface DndBeyondCharacter {
    classes: { level: number }[];
    hp: {
        max: number;
        current: number;
        temp: number;
    };
    initiative: {
        modifier: number;
    };
    stats: {
        str: Stat;
        dex: Stat;
        con: Stat;
        int: Stat;
        wis: Stat;
        cha: Stat;
    };
    proficiencyBonus: number;
    ac: number;
    currencies: {
        cp: number;
        sp: number;
        ep: number;
        gp: number;
        pp: number;
    };
}

const API_URL = "https://character-service-scds.dndbeyond.com/v1/avrae";

export const DndBeyond = {
    getCharacter: async (
        characterId: string,
    ): Promise<DndBeyondCharacter | undefined> => {
        try {
            const response = await withTimeout(
                fetch(`${API_URL}/${encodeURIComponent(characterId)}`),
            );
            if (!response.ok) {
                console.error(
                    `D&D Beyond returned status code ${response.status}`,
                );
                return undefined;
            }
            return (await response.json()) as DndBeyondCharacter;
        } catch (error) {
            console.error("Failed to fetch D&D Beyond character data", error);
            return undefined;
        }
    },
};
