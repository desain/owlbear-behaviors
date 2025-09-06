import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft, WritableDraft } from "immer";

const METADATA_KEY = "com.pretty-initiative/metadata";

interface PrettySordidMetadata {
    readonly count: string;
    readonly active: boolean;
    readonly group: number;
    readonly groupIndex?: number;
    readonly ready?: boolean;
}

export const PrettySordid = {
    hasInitiative: (item: Item): boolean =>
        item.metadata[METADATA_KEY] !== undefined,

    getInitiativeCount: (item: Item): number => {
        const metadata = item.metadata[METADATA_KEY] as
            | PrettySordidMetadata
            | undefined;
        if (!metadata?.count) {
            return 0;
        }
        const count = parseInt(metadata.count, 10);
        return isNaN(count) ? 0 : count;
    },

    isActiveTurn: (item: Item): boolean => {
        const metadata = item.metadata[METADATA_KEY] as
            | PrettySordidMetadata
            | undefined;
        return !!metadata?.active;
    },

    setInitiativeCount: (item: Draft<Item>, count: number): void => {
        const metadata = item.metadata[METADATA_KEY] as
            | WritableDraft<PrettySordidMetadata>
            | undefined;

        if (metadata) {
            metadata.count = String(count);
        } else {
            item.metadata[METADATA_KEY] = {
                count: String(count),
                active: false,
                group: 1,
            } satisfies PrettySordidMetadata;
        }
    },
};
