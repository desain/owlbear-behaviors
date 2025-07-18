import { triggerProceduresUpdate } from "@blockly/block-shareable-procedures";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import * as Blockly from "blockly";
import { useCallback, useEffect, useState } from "react";
import {
    BLOCK_ARGUMENT_EDITOR_BOOLEAN,
    BLOCK_ARGUMENT_EDITOR_STRNUM,
    BLOCK_PROCEDURE_PREVIEW,
} from "../blockly/blocks";
import { FieldTextInputRemovable } from "../blockly/FieldTextInputRemovable";
import { BehaviorParameterModel } from "../blockly/procedures/BehaviorParameterModel";
import { BehaviorProcedureModel } from "../blockly/procedures/BehaviorProcedureModel";
import { isDefineBlock } from "../blockly/procedures/blockDefine";
import { addDefineBlock } from "../blockly/procedures/procedureUtils";
import { createBlocklyTheme } from "../blockly/theme";
import { FIELD_ARGUMENT_EDITOR_TEXT } from "../constants";
import { usePlayerStorage } from "../state/usePlayerStorage";

interface NewBlockModalProps {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly workspace: Blockly.WorkspaceSvg;
    readonly procedureId: string | null;
}

// https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/blocks_vertical/procedures.js#L205
// https://github.com/scratchfoundation/scratch-blocks/blob/e96b5d43c16e9afe939d22454dbf7e73f8e811ed/blocks_vertical/procedures.js#L360
function handleAddParam(
    block: Blockly.Block | null,
    param: Blockly.serialization.procedures.ParameterState,
) {
    if (!block) {
        console.warn("handleAddParam: null block");
        return;
    }

    if (param.types?.length) {
        const isBool = param.types?.[0] === "Boolean";
        const newInput = block
            .appendValueInput(param.id)
            .setCheck(isBool ? "Boolean" : ["String", "Number", "ItemId"]);
        newInput.connection?.setShadowState({
            type: isBool
                ? BLOCK_ARGUMENT_EDITOR_BOOLEAN.type
                : BLOCK_ARGUMENT_EDITOR_STRNUM.type,
            fields: {
                [FIELD_ARGUMENT_EDITOR_TEXT]: param.name,
            },
        });
    } else {
        const lastInput = block.inputList[block.inputList.length - 1];
        const lastField = lastInput?.fieldRow?.[lastInput.fieldRow?.length - 1];

        if (lastField && lastField instanceof FieldTextInputRemovable) {
            lastField.setValue(lastField.getValue() + " " + param.name);
        } else {
            block
                .appendDummyInput(param.id)
                .appendField(new FieldTextInputRemovable(param.name));
        }
    }
}

function getOrCreateModel(
    workspace: Blockly.Workspace,
    procedureId: string | null,
): BehaviorProcedureModel {
    const existing = procedureId
        ? workspace.getProcedureMap().get(procedureId)
        : undefined;
    if (existing && existing instanceof BehaviorProcedureModel) {
        return existing;
    }
    const created = new BehaviorProcedureModel(workspace, `f${Date.now()}`);
    workspace.getProcedureMap().add(created);
    return created;
}

export const NewBlockModal: React.FC<NewBlockModalProps> = ({
    open,
    onClose,
    workspace,
    procedureId,
}) => {
    const theme = usePlayerStorage((state) => state.theme);
    const [previewWorkspace, setPreviewWorkspace] =
        useState<Blockly.WorkspaceSvg | null>(null);
    const [previewBlock, setPreviewBlock] = useState<Blockly.BlockSvg | null>(
        null,
    );
    const [previewContainerDiv, setPreviewContainerDiv] =
        useState<HTMLDivElement | null>(null);

    const previewContainerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node !== null) {
                setPreviewContainerDiv(node);
            }
        },
        [setPreviewContainerDiv],
    );

    useEffect(() => {
        if (open && previewContainerDiv && !previewWorkspace) {
            // Hide any previous widgets
            Blockly.WidgetDiv.hide();

            // Initialize the preview workspace when modal opens
            const newPreviewWorkspace = Blockly.inject(previewContainerDiv, {
                renderer: "zelos",
                theme: createBlocklyTheme(theme, false),
                trashcan: false,
                scrollbars: true,
                move: {
                    wheel: true,
                },
            });
            setPreviewWorkspace(newPreviewWorkspace);

            // Setup the preview block
            const block = newPreviewWorkspace.newBlock(
                BLOCK_PROCEDURE_PREVIEW.type,
            );
            setPreviewBlock(block);
            block.setMovable(false);
            block.setDeletable(false);
            block.contextMenu = false;
            block.initSvg();
            block.render();

            // Load existing procedure
            if (procedureId) {
                const procedure = workspace.getProcedureMap().get(procedureId);
                procedure
                    ?.getParameters()
                    .forEach((p) => handleAddParam(block, p.saveState()));
            } else {
                handleAddParam(block, { id: "arg0", name: "block name" });
            }

            // Finalize
            newPreviewWorkspace.centerOnBlock(block.id);
        } else if (!open && previewWorkspace) {
            // Cleanup when modal closes
            previewWorkspace.dispose();
            setPreviewWorkspace(null);
            setPreviewBlock(null);
            setPreviewContainerDiv(null);
        }
    }, [
        open,
        previewContainerDiv,
        previewWorkspace,
        theme,
        procedureId,
        workspace,
    ]);

    const handleSave = () => {
        if (previewBlock) {
            const model = getOrCreateModel(workspace, procedureId);

            // Update the procedure model
            model.startBulkUpdate();
            // clear parameters
            while (model.getParameters().length) {
                model.deleteParameter(0);
            }
            // recreate parameters
            previewBlock.inputList.forEach((input, i) => {
                const types = input.connection?.getCheck() ?? undefined;
                const paramName: unknown =
                    input.fieldRow[0]?.getValue() ??
                    input.connection?.targetBlock()?.getFieldValue("TEXT");
                if (typeof paramName !== "string") {
                    throw Error("Parameter name not string");
                }
                model.insertParameter(
                    new BehaviorParameterModel(
                        workspace,
                        paramName,
                        input.name,
                        types,
                    ),
                    i,
                );
            });
            model.endBulkUpdate();

            // The flyout workspace doesn't update by default, so update
            // the call blocks in that workspace
            const flyoutWorkspace = workspace.getFlyout()?.getWorkspace();
            if (flyoutWorkspace) {
                triggerProceduresUpdate(flyoutWorkspace);
            }

            // Ensure the define block exists in the workspace
            if (
                !workspace
                    .getTopBlocks(false)
                    .some(
                        (b) =>
                            isDefineBlock(b) &&
                            b.getProcedureModel().getId() === procedureId,
                    )
            ) {
                addDefineBlock(workspace, model);
            }
        }

        onClose();
    };

    return (
        // Need `disableEnforceFocus` so that the blockly widget div can take focus
        // to edit block fields
        <Dialog open={open} onClose={onClose} maxWidth="md" disableEnforceFocus>
            <DialogTitle>Make a Block</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    {/* Preview Container */}
                    <Box
                        ref={previewContainerRef}
                        sx={{
                            width: 600,
                            height: 200,
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            backgroundColor: "#f5f5f5",
                        }}
                    />

                    {/* Add Buttons */}
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="space-evenly"
                    >
                        <Button
                            variant="outlined"
                            onClick={() =>
                                handleAddParam(previewBlock, {
                                    id: `i${Date.now()}`,
                                    name: "number or text",
                                    types: ["String", "Number", "ItemId"],
                                })
                            }
                            sx={{ flex: 1, textAlign: "center" }}
                        >
                            <Stack>
                                <Typography variant="body2" fontWeight="bold">
                                    Add an input
                                </Typography>
                                <Typography variant="caption">
                                    number or text
                                </Typography>
                            </Stack>
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() =>
                                handleAddParam(previewBlock, {
                                    id: `i${Date.now()}`,
                                    name: "boolean",
                                    types: ["Boolean"],
                                })
                            }
                            sx={{ flex: 1, textAlign: "center" }}
                        >
                            <Stack>
                                <Typography variant="body2" fontWeight="bold">
                                    Add an input
                                </Typography>
                                <Typography variant="caption">
                                    boolean
                                </Typography>
                            </Stack>
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() =>
                                handleAddParam(previewBlock, {
                                    id: `i${Date.now()}`,
                                    name: "label text",
                                })
                            }
                            sx={{ flex: 1, textAlign: "center" }}
                        >
                            <Typography variant="body2" fontWeight="bold">
                                Add a label
                            </Typography>
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button onClick={handleSave} variant="contained">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};
