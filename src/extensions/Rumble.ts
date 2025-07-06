import OBR from "@owlbear-rodeo/sdk";

const CHAT_METADATA_KEY = "com.battle-system.friends/metadata_chatlog";
const DICE_METADATA_KEY = "com.battle-system.friends/metadata_diceroll";

export const Rumble = {
    sendChatMessage: async (
        message: string,
        toSelf: boolean,
    ): Promise<void> => {
        await OBR.player.setMetadata({
            [CHAT_METADATA_KEY]: {
                chatlog: message,
                created: new Date().toISOString(),
                sender: "Behaviors",
                targetId: toSelf ? await OBR.player.getId() : "0000",
            },
        });
    },

    rollDice: async (notation: string): Promise<void> => {
        await OBR.player.setMetadata({
            [DICE_METADATA_KEY]: {
                notation: notation,
                created: new Date().toISOString(),
                sender: "Behaviors",
            },
        });
    },
};
