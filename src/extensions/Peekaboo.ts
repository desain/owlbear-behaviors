import type { Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "com.desain.peekaboo/coverSolidity";

export const Peekaboo = {
    /**
     * @param solidity 0-100
     */
    setSolidity: (item: Draft<Item>, solidity: number): void => {
        const clampedSolidity = Math.max(0, Math.min(1, solidity / 100));
        item.metadata[METADATA_KEY] = clampedSolidity;
    },

    /**
     * @returns solidity 0-100, or 0 if no solidity is set
     */
    getSolidity: (item: Item): number => {
        const solidity = item.metadata[METADATA_KEY];
        if (typeof solidity !== "number") {
            return 0;
        }
        return Math.round(solidity * 100);
    },
};
