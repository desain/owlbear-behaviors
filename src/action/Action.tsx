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
import OBR from "@owlbear-rodeo/sdk";
import { useActionResizer, useRehydrate } from "owlbear-utils";
import { useEffect, useRef } from "react";
import { broadcastStopAllBehaviors } from "../broadcast/broadcast";
import { ID_POPOVER_EXECUTOR } from "../constants";
import { openHelp } from "../popoverHelp/openHelp";
import { openSettings } from "../popoverSettings/openSettings";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { activateTool } from "../tool/tool";
import { BroadcastList } from "./BroadcastList";
import { SoundList } from "./SoundList";
import { TagList } from "./TagList";
import { TokenList } from "./TokenList";

const BASE_HEIGHT = 10;
const MAX_HEIGHT = 700;

export function Action() {
    const role = usePlayerStorage((store) => store.role);
    const sceneReady = usePlayerStorage((store) => store.sceneReady);
    const box: React.RefObject<HTMLElement | null> = useRef(null);

    // Some browsers 'optimize' invisible iframes to not run timeouts or
    // handle messages quickly when they are not visible; the OBR action
    // window is counted as invisible when it's not open, which causes
    // the extension to chug in some browsers.
    // To get around this, defer behavior execution to a tiny popover in
    // the corner of the screen, which is technically visible and so
    // avoids the optimization.
    useEffect(() => {
        void OBR.popover.open({
            // Width and height 10 seem to be the minimum for the popover
            // to actually display
            width: 10,
            height: 10,
            url: "/src/popoverExecutor/popoverExecutor.html",
            anchorReference: "POSITION",
            anchorPosition: {
                left: 0,
                top: 0,
            },
            id: ID_POPOVER_EXECUTOR,
            disableClickAway: true,
            hidePaper: true,
        });

        return () => void OBR.popover.close(ID_POPOVER_EXECUTOR);
    });

    useActionResizer(BASE_HEIGHT, MAX_HEIGHT, box);
    useRehydrate(usePlayerStorage);

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
                    {/* Tokens with Behaviors Section */}
                    <Box sx={{ mt: 2 }}>
                        <TokenList />
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
                            onClick={() => void broadcastStopAllBehaviors()}
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
