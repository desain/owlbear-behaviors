import { Settings } from "@mui/icons-material";
import { Box, CardHeader, IconButton, Tooltip } from "@mui/material";
import { useActionResizer } from "owlbear-utils";
import { useRef } from "react";
import { openSettings } from "../popoverSettings/openSettings";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { useRehydrate } from "owlbear-utils";

export function Action() {
    const box: React.RefObject<HTMLElement | null> = useRef(null);

    const BASE_HEIGHT = 300;
    const MAX_HEIGHT = 700;
    useActionResizer(BASE_HEIGHT, MAX_HEIGHT, box);
    useRehydrate(usePlayerStorage);

    return (
        <Box ref={box}>
            <CardHeader
                title={"TODO extension name"}
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
                    <Tooltip title="Settings">
                        <IconButton onClick={openSettings}>
                            <Settings />
                        </IconButton>
                    </Tooltip>
                }
            />
        </Box>
    );
}
