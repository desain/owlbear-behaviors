import { Add, Send } from "@mui/icons-material";
import { Box, IconButton, List, Tooltip, Typography } from "@mui/material";
import { sendMessage } from "../broadcast/broadcast";
import {
    addBroadcasts,
    promptBroadcast,
    removeBroadcast,
} from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { EditableListItem } from "./EditableListItem";

export function BroadcastList() {
    const broadcasts = usePlayerStorage((s) => s.sceneMetadata.broadcasts);

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={0.5}
            >
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                    💌 Messages
                </Typography>
                <Tooltip title="Add message">
                    <IconButton
                        onClick={() => {
                            const broadcast = promptBroadcast();
                            if (broadcast) {
                                void addBroadcasts(broadcast);
                            }
                        }}
                    >
                        <Add />
                    </IconButton>
                </Tooltip>
            </Box>
            <List dense>
                {broadcasts.map((broadcast) => (
                    <EditableListItem
                        key={broadcast}
                        name={broadcast}
                        onDelete={async () => {
                            if (confirm(`Delete message "${broadcast}"?`)) {
                                await removeBroadcast(broadcast);
                            }
                        }}
                        deleteDisabled={broadcasts.length <= 1}
                        secondaryAction={
                            <Tooltip title="Send Message">
                                <IconButton
                                    edge="end"
                                    onClick={() => sendMessage(broadcast)}
                                    size="small"
                                >
                                    <Send />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                ))}
                <Typography
                    variant="body2"
                    sx={{ px: 2, py: 1, color: "text.secondary" }}
                >
                    Tokens can receive and react to messages.
                </Typography>
            </List>
        </>
    );
}
