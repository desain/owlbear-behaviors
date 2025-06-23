import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { version } from "../../package.json";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    // const toolEnabled = usePlayerStorage((store) => store.toolEnabled);
    const contextMenuEnabled = usePlayerStorage(
        (store) => store.contextMenuEnabled,
    );
    // const setToolEnabled = usePlayerStorage((store) => store.setToolEnabled);
    const setContextMenuEnabled = usePlayerStorage(
        (store) => store.setContextMenuEnabled,
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
