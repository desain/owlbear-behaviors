import { type Item } from "@owlbear-rodeo/sdk";

const HP_METADATA_KEY = "com.battle-system.clash/clash_currentHP";
const MAX_HP_METADATA_KEY = "com.battle-system.clash/clash_maxHP";
const INITIATIVE_METADATA_KEY = "com.battle-system.clash/clash_initiative";

export const Clash = {
    hasHP: (item: Item): boolean =>
        item.metadata[HP_METADATA_KEY] !== undefined,

    getHP: (item: Item): number => Number(item.metadata[HP_METADATA_KEY] ?? 0),

    getMaxHP: (item: Item): number =>
        Number(item.metadata[MAX_HP_METADATA_KEY] ?? 0),

    getInitiative: (item: Item): number =>
        Number(item.metadata[INITIATIVE_METADATA_KEY] ?? 0),
};
