import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { version } from "../../package.json";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    const contextMenuEnabled = usePlayerStorage(
        (store) => store.contextMenuEnabled,
    );
    const setContextMenuEnabled = usePlayerStorage(
        (store) => store.setContextMenuEnabled,
    );

    const showAddTagsContextMenu = !!usePlayerStorage(
        (store) => store.showAddTagsContextMenu,
    );
    const setShowAddTagsContextMenu = usePlayerStorage(
        (store) => store.setShowAddTagsContextMenu,
    );

    const muteBlockly = !!usePlayerStorage((store) => store.muteBlockly);
    const setMuteBlockly = usePlayerStorage((store) => store.setMuteBlockly);

    const showCopyPasteContextMenu = !!usePlayerStorage(
        (store) => store.showCopyPasteContextMenu,
    );
    const setShowCopyPasteContextMenu = usePlayerStorage(
        (store) => store.setShowCopyPasteContextMenu,
    );

    return (
        <Box sx={{ p: 2, minWidth: 300 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={contextMenuEnabled}
                        onChange={(e) =>
                            setContextMenuEnabled(e.target.checked)
                        }
                    />
                }
                label="Enable Context Menu"
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={showAddTagsContextMenu}
                        onChange={(e) =>
                            setShowAddTagsContextMenu(e.target.checked)
                        }
                    />
                }
                label="Show Add Tags Context Menu"
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={showCopyPasteContextMenu}
                        onChange={(e) =>
                            setShowCopyPasteContextMenu(e.target.checked)
                        }
                    />
                }
                label="Show Copy/Paste Context Menu"
                sx={{ mb: 2 }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={muteBlockly}
                        onChange={(e) => setMuteBlockly(e.target.checked)}
                    />
                }
                label="Mute block sounds"
                sx={{ mb: 2 }}
            />

            <Typography
                color="textSecondary"
                variant="subtitle1"
                sx={{ mt: 2, px: 2 }}
            >
                Behaviors version {version}
            </Typography>
        </Box>
    );
}
