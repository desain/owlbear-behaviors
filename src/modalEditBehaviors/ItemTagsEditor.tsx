import { Autocomplete, TextField } from "@mui/material";
import { useCallback, useState } from "react";
import { usePlayerStorage } from "../state/usePlayerStorage";

export interface ItemTagsEditorProps {
    tags: string[];
    readonly onTagsChange: (tags: string[]) => void;
}

export const ItemTagsEditor: React.FC<ItemTagsEditorProps> = ({
    tags,
    onTagsChange,
}) => {
    const availableTags = usePlayerStorage((state) => state.sceneMetadata.tags);
    const [inputValue, setInputValue] = useState("");

    const handleTagsChange = useCallback(
        (_event: unknown, newTags: string[]) => {
            onTagsChange(newTags);
        },
        [onTagsChange],
    );

    return (
        <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={tags}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={handleTagsChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
                    size="medium"
                />
            )}
        />
    );
};
