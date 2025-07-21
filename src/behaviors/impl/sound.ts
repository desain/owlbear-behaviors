import { withTimeout } from "owlbear-utils";
import { broadcastPlaySound } from "../../broadcast/broadcast";
import { usePlayerStorage } from "../../state/usePlayerStorage";

export async function playSoundUntilDone(
    signal: AbortSignal,
    soundName: string,
) {
    const state = usePlayerStorage.getState();
    const sound = state.sceneMetadata.sounds[soundName];
    if (!sound) {
        console.warn(`[playSoundUntilDone] Sound not found: ${soundName}`);
        return;
    }

    await withTimeout(
        new Promise<void>((resolve, reject) => {
            const handleAbort = () => {
                signal.removeEventListener("abort", handleAbort);
                reject(Error(String(signal.reason)));
            };

            // https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
            if (signal.aborted) {
                handleAbort();
                return;
            }

            signal.addEventListener("abort", handleAbort);

            try {
                const audio = new Audio(sound.url);
                audio.addEventListener("ended", () => {
                    signal.removeEventListener("abort", handleAbort);
                    resolve();
                });
                audio.addEventListener("error", (e) => {
                    signal.removeEventListener("abort", handleAbort);
                    reject(Error(e.message));
                });
                audio.addEventListener("canplaythrough", () => {
                    if (signal.aborted) {
                        handleAbort();
                        return;
                    }
                    void audio.play();
                });
            } catch (e) {
                reject(
                    Error(
                        `[playSoundUntilDone] Could not play sound: ${
                            sound.url
                        }: ${String(e)}`,
                    ),
                );
            }
        }),
        20_000,
    );
}

export const SOUND_BEHAVIORS = {
    playSoundUntilDone: async (
        signal: AbortSignal,
        soundNameUnknown: unknown,
    ): Promise<void> => {
        const soundName = String(soundNameUnknown);
        const state = usePlayerStorage.getState();

        if (state.role === "GM") {
            void broadcastPlaySound(soundName);
        }

        await playSoundUntilDone(signal, soundName);

        signal.throwIfAborted();
    },
};
