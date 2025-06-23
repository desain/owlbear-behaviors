import { Add, SelectAll } from "@mui/icons-material";
import { Box, IconButton, List, Tooltip, Typography } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import { getId } from "owlbear-utils";
import { isBehaviorItem } from "../BehaviorItem";
import { METADATA_KEY_TAGS } from "../constants";
import { addTags, promptTag, removeTag } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { EditableListItem } from "./EditableListItem";

async function selectAllWithTag(tag: string) {
    const items = await OBR.scene.items.getItems(isBehaviorItem);
    const tagged = items.filter((item) =>
        item.metadata[METADATA_KEY_TAGS]?.includes(tag),
    );
    await OBR.player.select(tagged.map(getId));
}

export function TagList() {
    const tags = usePlayerStorage((s) => s.sceneMetadata.tags);

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
                    🏷️ Tags
                </Typography>
                <Tooltip title="Add tag">
                    <IconButton
                        onClick={() => {
                            const tag = promptTag();
                            if (tag) {
                                void addTags(tag);
                            }
                        }}
                    >
                        <Add />
                    </IconButton>
                </Tooltip>
            </Box>
            <List dense>
                {tags.map((tag) => (
                    <EditableListItem
                        key={tag}
                        name={tag}
                        onDelete={() => {
                            if (confirm(`Delete tag "${tag}"?`)) {
                                void removeTag(tag);
                            }
                        }}
                        deleteDisabled={tags.length <= 1}
                        secondaryAction={
                            <Tooltip title="Select All With Tag">
                                <IconButton
                                    edge="end"
                                    onClick={() => selectAllWithTag(tag)}
                                    size="small"
                                >
                                    <SelectAll />
                                </IconButton>
                            </Tooltip>
                        }
                    />
                ))}
                <Typography
                    variant="body2"
                    sx={{ px: 2, py: 1, color: "text.secondary" }}
                >
                    Tags are labels attached to tokens.
                </Typography>
            </List>
        </>
    );
}
