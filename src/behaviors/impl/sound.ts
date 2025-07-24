import { withTimeout } from "owlbear-utils";
import {
    broadcastPlaySound,
    broadcastStopAllSounds,
} from "../../broadcast/broadcast";
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
            const soundId = `${soundName}_${Date.now()}`;
            let audio: HTMLAudioElement | undefined;

            const handleAbort = () => {
                signal.removeEventListener("abort", handleAbort);
                usePlayerStorage.getState().removeActiveSound(soundId);
                audio?.pause();
                reject(Error(String(signal.reason)));
            };

            // https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
            if (signal.aborted) {
                handleAbort();
                return;
            } else {
                signal.addEventListener("abort", handleAbort);
            }

            const cleanup = () => {
                signal.removeEventListener("abort", handleAbort);
                usePlayerStorage.getState().removeActiveSound(soundId);
            };

            try {
                audio = new Audio(sound.url);

                audio.addEventListener("ended", () => {
                    cleanup();
                    resolve();
                });
                audio.addEventListener("error", (e) => {
                    cleanup();
                    reject(Error(e.message));
                });
                audio.addEventListener("canplaythrough", () => {
                    if (signal.aborted) {
                        handleAbort();
                    } else if (audio) {
                        usePlayerStorage
                            .getState()
                            .addActiveSound(soundId, () => {
                                audio?.pause();
                                resolve();
                            });
                        void audio.play();
                    }
                });
            } catch (e) {
                cleanup();
                reject(
                    Error(
                        `[playSoundUntilDone] Could not play sound: ${
                            sound.url
                        }: ${String(e)}`,
                    ),
                );
            }
        }),
        600_000,
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

    stopAllSounds: (signal: AbortSignal): void => {
        const state = usePlayerStorage.getState();

        if (state.role === "GM") {
            void broadcastStopAllSounds();
        }

        state.stopAllSounds();

        signal.throwIfAborted();
    },
};
