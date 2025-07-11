import OBR, { isImage, type Item } from "@owlbear-rodeo/sdk";
import { METADATA_KEY_CLONE } from "../../constants";

const LETTER_END = /^(.*) ([a-yA-Y])$/;
const NUMBER_END = /^(.*) (\d+)$/;

/**
 * Get text for a clone. If the original ends with a space, then a
 * letter A-Y (uppercase or lowercase), then that letter is changed
 * to the next letter.
 *
 * If the orignal ends with a space, then an integer, then that
 * integer is incremented.
 * @param name Original text.
 */
function getCloneText(text: string): string {
    // Match " <letter>" at end (A-Y)
    const letterMatch = LETTER_END.exec(text);
    if (letterMatch) {
        const prefix = letterMatch[1];
        const letter = letterMatch[2];
        if (!prefix || !letter) {
            throw Error("invalid regex match for " + text);
        }
        const nextChar = String.fromCharCode(letter?.charCodeAt(0) + 1);
        return `${prefix} ${nextChar}`;
    } else {
        // Match " <number>" at end
        const numberMatch = NUMBER_END.exec(text);
        if (numberMatch) {
            const prefix = numberMatch[1];
            const num = Number(numberMatch[2]);
            return `${prefix} ${num + 1}`;
        }
    }

    // Otherwise, no change.
    return text;
}

export const CONTROL_BEHAVIORS = {
    clone: async (signal: AbortSignal, itemIdUnknown: unknown) => {
        const itemId = String(itemIdUnknown);
        const [item] = await OBR.scene.items.getItems([itemId]);
        signal.throwIfAborted();
        if (!item) {
            return;
        }
        item.metadata[METADATA_KEY_CLONE] = true;

        const clone: Item = {
            ...item,
            metadata: { ...item.metadata, [METADATA_KEY_CLONE]: true },
            id: crypto.randomUUID(),
        };

        if (isImage(clone)) {
            clone.text.plainText = getCloneText(clone.text.plainText);
        }

        await OBR.scene.items.addItems([clone]);
        signal.throwIfAborted();
    },

    delete: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        const selfId = String(selfIdUnknown);
        await OBR.scene.items.deleteItems([selfId]);
        signal.throwIfAborted();
    },
};

if (import.meta.vitest) {
    const { describe, it, expect } = import.meta.vitest;
    describe("getCloneText", () => {
        it("increments ending uppercase letter", () => {
            expect(getCloneText("Goblin A")).toBe("Goblin B");
            expect(getCloneText("Goblin Y")).toBe("Goblin Z");
        });

        it("increments ending lowercase letter", () => {
            expect(getCloneText("Goblin a")).toBe("Goblin b");
            expect(getCloneText("Goblin y")).toBe("Goblin z");
        });

        it("does not increment Zs", () => {
            expect(getCloneText("Goblin Z")).toBe("Goblin Z");
            expect(getCloneText("Goblin z")).toBe("Goblin z");
        });

        it("increments ending number", () => {
            expect(getCloneText("Goblin 1")).toBe("Goblin 2");
            expect(getCloneText("Goblin 99")).toBe("Goblin 100");
        });

        it("returns unchanged if no match", () => {
            expect(getCloneText("Goblin")).toBe("Goblin");
            expect(getCloneText("GoblinZ")).toBe("GoblinZ");
            expect(getCloneText("Goblin 1a")).toBe("Goblin 1a");
        });
    });
}
