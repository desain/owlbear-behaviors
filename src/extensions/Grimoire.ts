import { type Item } from "@owlbear-rodeo/sdk";

const METADATA_KEY = "com.bitperfect-software.hp-tracker/data";

interface GrimoireData {
    readonly hp: number;
    readonly maxHp: number;
    readonly armorClass: number;
    readonly stats?: {
        readonly tempHp?: number;
    };
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
};
