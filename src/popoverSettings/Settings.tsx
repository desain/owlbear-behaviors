import { Box, FormControlLabel, Switch } from "@mui/material";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function Settings() {
    const toolEnabled = usePlayerStorage((store) => store.toolEnabled);
    const contextMenuEnabled = usePlayerStorage(
        (store) => store.contextMenuEnabled,
    );
    const setToolEnabled = usePlayerStorage((store) => store.setToolEnabled);
    const setContextMenuEnabled = usePlayerStorage(
        (store) => store.setContextMenuEnabled,
    );
    return (
        <Box sx={{ p: 2, minWidth: 300 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={toolEnabled}
                        onChange={(e) => setToolEnabled(e.target.checked)}
                    />
                }
                label="Enable Tool"
                sx={{ mb: 2 }}
            />
            <br />
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
        </Box>
    );
}
