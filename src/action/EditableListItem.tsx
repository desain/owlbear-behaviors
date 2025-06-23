import { Check, Close, Delete, Edit } from "@mui/icons-material";
import {
    IconButton,
    ListItem,
    ListItemText,
    TextField,
    Tooltip,
} from "@mui/material";
import { useState } from "react";

interface EditableListItemProps {
    name: string;
    onRename?: (newName: string) => void;
    onDelete?: () => void;
    deleteDisabled?: boolean;
    secondaryAction?: React.ReactNode;
}

export function EditableListItem({
    name,
    onRename,
    onDelete,
    deleteDisabled = false,
    secondaryAction,
}: EditableListItemProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(name);

    const handleEdit = () => setEditing(true);
    const handleCancel = () => {
        setEditing(false);
        setValue(name);
    };
    const handleSave = () => {
        if (value.trim() && value !== name) {
            onRename?.(value.trim());
        }
        setEditing(false);
    };

    return (
        <ListItem
            secondaryAction={
                editing ? (
                    <>
                        <Tooltip title="Save">
                            <IconButton
                                edge="end"
                                onClick={handleSave}
                                size="small"
                            >
                                <Check />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <IconButton
                                edge="end"
                                onClick={handleCancel}
                                size="small"
                            >
                                <Close />
                            </IconButton>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        {onRename && (
                            <Tooltip title="Rename">
                                <IconButton
                                    edge="end"
                                    onClick={handleEdit}
                                    size="small"
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title={deleteDisabled ? "Cannot delete last item" : "Delete"}>
                                <span>
                                    <IconButton
                                        edge="end"
                                        onClick={deleteDisabled ? undefined : onDelete}
                                        size="small"
                                        disabled={deleteDisabled}
                                    >
                                        <Delete />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        {secondaryAction}
                    </>
                )
            }
        >
            {editing ? (
                <TextField
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    size="small"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSave();
                        }
                        if (e.key === "Escape") {
                            handleCancel();
                        }
                    }}
                    sx={{ width: 180 }}
                />
            ) : (
                <ListItemText primary={name} />
            )}
        </ListItem>
    );
}
