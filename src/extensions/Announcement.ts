import OBR from "@owlbear-rodeo/sdk";

const KEY = "dev.sharkbrain.announcement/bar-1";

export const Announcement = {
    announce: async (signal: AbortSignal, message: string, secs: number) => {
        await OBR.room.setMetadata({
            [KEY]: {
                active: true,
                content: message,
            },
        });
        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
        signal.throwIfAborted();

        await OBR.room.setMetadata({
            [KEY]: {
                active: false,
                content: message,
            },
        });
        signal.throwIfAborted();
    },
};
