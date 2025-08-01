import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "com.pretty-initiative/metadata";

interface PrettySordidMetadata {
    count: string;
    active: boolean;
    group: number;
    groupIndex: number;
    ready: boolean;
}

export const PrettySordid = {
    hasInitiative: (item: Item): boolean =>
        item.metadata[METADATA_KEY] !== undefined,

    getInitiativeCount: (item: Item): number => {
        const metadata = item.metadata[METADATA_KEY] as PrettySordidMetadata | undefined;
        if (!metadata?.count) {
            return 0;
        }
        const count = parseInt(metadata.count, 10);
        return isNaN(count) ? 0 : count;
    },

    isActiveTurn: (item: Item): boolean => {
        const metadata = item.metadata[METADATA_KEY] as PrettySordidMetadata | undefined;
        return metadata?.active ?? false;
    },

    setInitiativeCount: (item: Draft<Item>, count: number): void => {
        const metadata = item.metadata[METADATA_KEY] as PrettySordidMetadata | undefined;
        if (!metadata) {
            // Don't create metadata if it doesn't exist
            return;
        }
        
        // Update the count while preserving other properties
        item.metadata[METADATA_KEY] = {
            ...metadata,
            count: String(count),
        };
    },
};