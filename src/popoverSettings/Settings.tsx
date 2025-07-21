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

    const muteBlockly = usePlayerStorage((store) => store.muteBlockly) ?? false;
    const setMuteBlockly = usePlayerStorage((store) => store.setMuteBlockly);

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
