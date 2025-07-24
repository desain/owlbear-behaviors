import { Add, PlayArrow, Stop } from "@mui/icons-material";
import { Box, IconButton, List, Tooltip, Typography } from "@mui/material";
import { playSoundUntilDone } from "../behaviors/impl/sound";
import { addSound, removeSound, renameSound } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { EditableListItem } from "./EditableListItem";

async function playSound(name: string) {
    const controller = new AbortController();
    await playSoundUntilDone(controller.signal, name);
}

async function handleAddSound() {
    const url = prompt("Sound URL:")?.trim();
    if (url) {
        await addSound("My New Sound", {
            url,
        });
    }
}

export function SoundList() {
    const sounds = usePlayerStorage((s) => s.sceneMetadata.sounds);
    const activeSounds = usePlayerStorage((s) => s.activeSounds);
    const stopAllSounds = usePlayerStorage((s) => s.stopAllSounds);

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={0.5}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    🔊 Sounds{" "}
                    {activeSounds.size > 0 && `(${activeSounds.size} playing)`}
                </Typography>
                <Box display="flex" gap={0.5}>
                    {activeSounds.size > 0 && (
                        <Tooltip title="Stop all sounds">
                            <IconButton onClick={stopAllSounds} size="small">
                                <Stop />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Add sound">
                        <IconButton onClick={handleAddSound}>
                            <Add />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <List dense>
                {Object.keys(sounds)
                    .sort()
                    .map((name) => (
                        <EditableListItem
                            key={name}
                            name={name}
                            onRename={(newName) => renameSound(name, newName)}
                            onDelete={() => {
                                if (confirm(`Delete sound "${name}"?`)) {
                                    void removeSound(name);
                                }
                            }}
                            deleteDisabled={Object.keys(sounds).length <= 1}
                            secondaryAction={
                                <Tooltip title="Play Sound">
                                    <IconButton
                                        edge="end"
                                        onClick={() => void playSound(name)}
                                        size="small"
                                    >
                                        <PlayArrow />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                    ))}
            </List>
        </>
    );
}
