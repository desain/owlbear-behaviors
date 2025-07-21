import { Box, Button, Typography } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import type { BehaviorItem } from "../BehaviorItem";
import { ID_POPOVER_ADD_TAGS, METADATA_KEY_TAGS } from "../constants";
import { ItemTagsEditor } from "../modalEditBehaviors/ItemTagsEditor";
import { addTags } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";

export function PopoverAddTags() {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const selectedItems = usePlayerStorage((state) => state.selection);

    const handleCancel = async () => {
        await OBR.popover.close(ID_POPOVER_ADD_TAGS);
    };

    const handleOk = async () => {
        if (selectedTags.length === 0 || selectedItems.length === 0) {
            await OBR.popover.close(ID_POPOVER_ADD_TAGS);
            return;
        }

        // Add any new tags to scene metadata  
        await addTags(...selectedTags);

        // Apply selected tags to all selected items
        await OBR.scene.items.updateItems<BehaviorItem>(
            selectedItems,
            (items) => {
                items.forEach((item) => {
                    const existingTags = item.metadata[METADATA_KEY_TAGS] ?? [];
                    const newTags = [
                        ...new Set([...existingTags, ...selectedTags]),
                    ];

                    if (newTags.length > 0) {
                        item.metadata[METADATA_KEY_TAGS] = newTags;
                    }
                });
            },
        );

        await OBR.popover.close(ID_POPOVER_ADD_TAGS);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 300 }}>
            <Box sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Add Tags
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? "s" : ""} selected
                </Typography>

                <ItemTagsEditor
                    tags={selectedTags}
                    onTagsChange={setSelectedTags}
                />
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleOk}
                    disabled={selectedTags.length === 0}
                >
                    Add Tags
                </Button>
            </Box>
        </Box>
    );
}
