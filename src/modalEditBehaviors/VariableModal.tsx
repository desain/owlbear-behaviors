import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
} from "@mui/material";
import * as Blockly from "blockly";
import { useState } from "react";
import type { BehaviorVariableMap } from "../blockly/BehaviorVariableMap";

interface VariableModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly workspace: Blockly.WorkspaceSvg;
    readonly variableType: string;
}

const SCOPE_TOKEN = "token";
const SCOPE_GLOBAL = "global";

export const VariableModal: React.FC<VariableModalProps> = ({
    open,
    onClose,
    workspace,
    variableType,
}) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [isGlobal, setIsGlobal] = useState(false);

    const typeName = variableType === "" ? "Variable" : variableType;

    const validateName = (newName: string): string => {
        if (!newName.trim()) {
            return "Please enter a variable name";
        }

        // Check if variable already exists
        const existingVariable = Blockly.Variables.nameUsedWithAnyType(
            newName.trim(),
            workspace,
        );
        if (existingVariable) {
            return `A variable named "${newName.trim()}" already exists.`;
        }

        return "";
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setName(newName);
        setNameError(validateName(newName));
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSave();
        }
    };

    const resetFormAndClose = () => {
        // Reset form and close
        setName("");
        setIsGlobal(false);
        setNameError("");
        onClose();
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        const error = validateName(trimmedName);

        if (error) {
            setNameError(error);
            return;
        }

        // Create the variable
        const variableMap = workspace.getVariableMap() as BehaviorVariableMap;

        variableMap.createVariable(
            trimmedName,
            variableType,
            undefined,
            isGlobal,
        );

        resetFormAndClose();
    };

    return (
        // need disableRestoreFocus so that text autoFocus can work - see https://github.com/mui/material-ui/issues/33004
        <Dialog
            open={open}
            onClose={resetFormAndClose}
            maxWidth="sm"
            fullWidth
            disableRestoreFocus
        >
            <DialogTitle>New {typeName}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        label={`New ${typeName.toLowerCase()} name`}
                        value={name}
                        onChange={handleNameChange}
                        onKeyDown={handleKeyDown}
                        error={!!nameError}
                        helperText={nameError}
                        fullWidth
                        variant="outlined"
                        required
                    />

                    <FormControl component="fieldset">
                        <FormLabel component="legend">Scope</FormLabel>
                        <RadioGroup
                            value={isGlobal ? SCOPE_GLOBAL : SCOPE_TOKEN}
                            onChange={(e) =>
                                setIsGlobal(e.target.value === SCOPE_GLOBAL)
                            }
                            row
                        >
                            <FormControlLabel
                                value={SCOPE_TOKEN}
                                control={<Radio />}
                                label="For this token only"
                            />
                            {import.meta.env.DEV && (
                                <FormControlLabel
                                    value={SCOPE_GLOBAL}
                                    control={<Radio />}
                                    label="For all tokens"
                                />
                            )}
                        </RadioGroup>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={resetFormAndClose} variant="outlined">
                    {Blockly.Msg.DIALOG_CANCEL}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!name.trim() || !!nameError}
                >
                    {Blockly.Msg.DIALOG_OK}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
