import OBR, { type Item } from "@owlbear-rodeo/sdk";

const ROOM_METADATA_KEY = "com.tabletop-almanac.gmd/metadata";
const METADATA_KEY = "com.tabletop-almanac.gmd/data";

interface DaggerheartRoomData {
    readonly fear: number;
}

interface DaggerheartData {
    readonly active: boolean;
    readonly agility: number;
    readonly strength: number;
    readonly finesse: number;
    readonly instinct: number;
    readonly presence: number;
    readonly knowledge: number;
    readonly evasion: number;
    readonly armor: {
        readonly current: number;
        readonly max: number;
    };
    readonly hp: {
        readonly current: number;
        readonly max: number;
    };
    readonly stress: {
        readonly current: number;
        readonly max: number;
    };
    readonly hope: number;
    readonly thresholds: {
        readonly major: number;
        readonly sever: number;
    };
    readonly spotlight: number;
}

export const Daggerheart = {
    getFear: async (): Promise<number> => {
        const roomMetadata = await OBR.room.getMetadata();
        const data = roomMetadata[ROOM_METADATA_KEY] as
            | DaggerheartRoomData
            | undefined;
        return data?.fear ?? 0;
    },

    getStat: (item: Item, statName: string): number => {
        const data = item.metadata[METADATA_KEY] as DaggerheartData | undefined;
        if (!data) {
            return 0;
        }

        switch (statName) {
            case "agility":
                return data.agility;
            case "strength":
                return data.strength;
            case "finesse":
                return data.finesse;
            case "instinct":
                return data.instinct;
            case "presence":
                return data.presence;
            case "knowledge":
                return data.knowledge;
            case "evasion":
                return data.evasion;
            case "armor_current":
                return data.armor.current;
            case "armor_max":
                return data.armor.max;
            case "hp_current":
                return data.hp.current;
            case "hp_max":
                return data.hp.max;
            case "stress_current":
                return data.stress.current;
            case "stress_max":
                return data.stress.max;
            case "hope":
                return data.hope;
            case "threshold_major":
                return data.thresholds.major;
            case "threshold_severe":
                return data.thresholds.sever;
            case "spotlight":
                return data.spotlight;
            default:
                return 0;
        }
    },
};
