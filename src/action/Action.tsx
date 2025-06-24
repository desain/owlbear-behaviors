import { Edit, Help, Settings, Stop } from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    CardHeader,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { useActionResizer, useRehydrate } from "owlbear-utils";
import { useEffect, useRef, useState } from "react";
import { installExtension } from "../install";
import { openHelp } from "../popoverHelp/openHelp";
import { openSettings } from "../popoverSettings/openSettings";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { activateTool } from "../tool/tool";
import { BroadcastList } from "./BroadcastList";
import { SoundList } from "./SoundList";
import { TagList } from "./TagList";

const BASE_HEIGHT = 10;
const MAX_HEIGHT = 700;

export function Action() {
    const role = usePlayerStorage((store) => store.role);
    const sceneReady = usePlayerStorage((store) => store.sceneReady);
    const box: React.RefObject<HTMLElement | null> = useRef(null);
    useActionResizer(BASE_HEIGHT, MAX_HEIGHT, box);
    useRehydrate(usePlayerStorage);

    const [stopper, setStopper] = useState<VoidFunction | undefined>();
    useEffect(() => {
        let uninstallExtension: VoidFunction | undefined;
        let unmounted = false;
        void installExtension(setStopper).then((uninstall) => {
            if (unmounted) {
                uninstall();
            } else {
                uninstallExtension = uninstall;
            }
        });

        return () => {
            unmounted = true;
            uninstallExtension?.();
            uninstallExtension = undefined;
        };
    }, []);

    return (
        <Box ref={box}>
            <CardHeader
                title={"Behaviors"}
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
                    role === "GM" ? (
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Help">
                                <IconButton onClick={openHelp}>
                                    <Help />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Settings">
                                <IconButton onClick={openSettings}>
                                    <Settings />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    ) : null
                }
            />
            {!sceneReady ? (
                <Alert severity="warning">Waiting for scene...</Alert>
            ) : role === "GM" ? (
                <>
                    <Box sx={{ px: 2, py: 1 }}>
                        Right click a token to set its behaviors or tags.
                    </Box>
                    {/* Broadcasts Section */}
                    <Box sx={{ mt: 2 }}>
                        <BroadcastList />
                    </Box>
                    {/* Tags Section */}
                    <Box sx={{ mt: 2 }}>
                        <TagList />
                    </Box>
                    {/* Sounds Section */}
                    <Box sx={{ mt: 2 }}>
                        <SoundList />
                    </Box>
                    {/* Action Buttons */}
                    <Stack direction="column" spacing={2} sx={{ mt: 3, px: 2 }}>
                        <Button
                            variant="text"
                            startIcon={<Stop />}
                            onClick={() => {
                                stopper?.();
                            }}
                        >
                            Stop all behaviors
                        </Button>
                        <Button
                            variant="text"
                            startIcon={<Edit />}
                            onClick={activateTool}
                        >
                            Edit directly
                        </Button>
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                mt: 0.5,
                                color: "text.secondary",
                            }}
                        >
                            Enables a tool that lets you click an item to edit
                            its behaviors, without selecting it first
                        </Typography>
                    </Stack>
                </>
            ) : (
                <Alert severity="warning">
                    This extension is for the GM's use only.
                </Alert>
            )}
        </Box>
    );
}
