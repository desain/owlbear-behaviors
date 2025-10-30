import { ArrowBack } from "@mui/icons-material";
import {
    Box,
    CardHeader,
    FormControlLabel,
    IconButton,
    Switch,
    Tooltip,
    Typography,
} from "@mui/material";
import { version } from "../../package.json";
import { usePlayerStorage } from "../state/usePlayerStorage";

interface SettingsProps {
    onBack: VoidFunction;
}

export function Settings({ onBack }: SettingsProps) {
    const contextMenuEnabled = usePlayerStorage((s) => s.contextMenuEnabled);
    const setContextMenuEnabled = usePlayerStorage(
        (s) => s.setContextMenuEnabled,
    );

    const showAddTagsContextMenu = !!usePlayerStorage(
        (s) => s.showAddTagsContextMenu,
    );
    const setShowAddTagsContextMenu = usePlayerStorage(
        (s) => s.setShowAddTagsContextMenu,
    );

    const muteBlockly = !!usePlayerStorage((store) => store.muteBlockly);
    const setMuteBlockly = usePlayerStorage((store) => store.setMuteBlockly);

    const showCopyPasteContextMenu = !!usePlayerStorage(
        (s) => s.showCopyPasteContextMenu,
    );
    const setShowCopyPasteContextMenu = usePlayerStorage(
        (s) => s.setShowCopyPasteContextMenu,
    );
    const useAdvancedBlocks = usePlayerStorage(
        (s) => s.useAdvancedBlocks ?? false,
    );
    const setUseAdvancedBlocks = usePlayerStorage(
        (s) => s.setUseAdvancedBlocks,
    );

    return (
        <Box sx={{ minWidth: 300 }}>
            <CardHeader
                title={"Behaviors Settings"}
                slotProps={{
                    title: {
                        sx: {
                            fontSize: "1.125rem",
                            fontWeight: "bold",
                            lineHeight: "32px",
                            color: "text.primary",
                        },
                    },
                }}
                action={
                    <Tooltip title="Back">
                        <IconButton onClick={onBack}>
                            <ArrowBack />
                        </IconButton>
                    </Tooltip>
                }
            />
            <Box sx={{ p: 2 }}>
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
                    label="Mute Block Sounds"
                    sx={{ mb: 2 }}
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={useAdvancedBlocks}
                            onChange={(e) =>
                                setUseAdvancedBlocks(e.target.checked)
                            }
                        />
                    }
                    label="Use Advanced Blocks"
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
        </Box>
    );
}
