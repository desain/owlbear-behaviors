import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "com.show-distances/metadata";

interface Metadata {
    item_height: number;
}

export const CharacterDistances = {
    getHeight: (item: Item): number =>
        (item.metadata[METADATA_KEY] as Metadata | undefined)?.item_height ?? 0,

    setHeight: (item: Draft<Item>, height: number): void => {
        const metadata = item.metadata[METADATA_KEY] as Metadata | undefined;
        if (metadata) {
            metadata.item_height = height;
        } else {
            item.metadata[METADATA_KEY] = {
                item_height: height,
            } satisfies Metadata;
        }
    },
};
