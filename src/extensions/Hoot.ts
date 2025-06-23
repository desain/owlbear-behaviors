import OBR from "@owlbear-rodeo/sdk";

export const Hoot = {
    play: (playlist: string, track: string, repeat = false) =>
        OBR.broadcast.sendMessage(
            "eu.armindo.hoot",
            {
                message: {
                    type: "play",
                    payload: {
                        playlist,
                        track,
                        repeatMode: repeat ? "repeat" : "no-repeat",
                    },
                },
            },
            { destination: "LOCAL" },
        ),
};
