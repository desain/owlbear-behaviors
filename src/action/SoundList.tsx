import { Add, PlayArrow } from "@mui/icons-material";
import { Box, IconButton, List, Tooltip, Typography } from "@mui/material";
import { BEHAVIORS_IMPL } from "../behaviors/BehaviorImpl";
import { addSound, removeSound, renameSound } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { EditableListItem } from "./EditableListItem";

async function playSound(name: string) {
    const controller = new AbortController();
    await BEHAVIORS_IMPL.playSoundUntilDone(controller.signal, name);
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

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={0.5}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    🔊 Sounds
                </Typography>
                <Tooltip title="Add sound">
                    <IconButton onClick={handleAddSound}>
                        <Add />
                    </IconButton>
                </Tooltip>
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
