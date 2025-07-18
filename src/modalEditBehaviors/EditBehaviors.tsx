import { Backpack } from "@blockly/workspace-backpack";
import Close from "@mui/icons-material/Close";
import Save from "@mui/icons-material/Save";
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import * as Blockly from "blockly";
import "blockly/msg/en";
import { useCallback, useEffect, useState } from "react";
import type { BehaviorItem } from "../BehaviorItem";
import { getTags, isBehaviorItem } from "../BehaviorItem";
import { BehaviorConnectionChecker } from "../blockly/BehaviorConnectionChecker";
import { Renderer } from "../blockly/blockRendering/Renderer";
import { BLOCK_IMMEDIATELY } from "../blockly/blocks";
import { Dragger } from "../blockly/Dragger";
import { isShowCreateVariable } from "../blockly/EventShowCreateVariable";
import { isShowEditProcedure } from "../blockly/EventShowEditProcedure";
import { installGetExtensionCallback } from "../blockly/getExtensionButton";
import { handleNewSceneMetadata } from "../blockly/handleNewSceneMetadata";
import { setupBlocklyGlobals } from "../blockly/setupBlocklyGlobals";
import { createBlocklyTheme, GRID_COLOR } from "../blockly/theme";
import { createToolbox } from "../blockly/toolbox";
import {
    METADATA_KEY_BEHAVIORS,
    METADATA_KEY_TAGS,
    MODAL_EDIT_BEHAVIOR_ID,
} from "../constants";
import { addTags } from "../state/SceneMetadata";
import { usePlayerStorage } from "../state/usePlayerStorage";
import { ItemTagsEditor } from "./ItemTagsEditor";
import { NewBlockModal } from "./NewBlockModal";
import { VariableModal } from "./VariableModal";

export interface EditBehaviorsProps {
    readonly itemId: string;
    readonly catBlocks: boolean;
}

export const EditBehaviors: React.FC<EditBehaviorsProps> = ({
    itemId,
    catBlocks,
}) => {
    const theme = usePlayerStorage((state) => state.theme);
    const sceneMetadata = usePlayerStorage((state) => state.sceneMetadata);
    const backpackContents = usePlayerStorage(
        (state) => state.backpackContents,
    );
    const setBackpackContents = usePlayerStorage(
        (state) => state.setBackpackContents,
    );
    const grid = usePlayerStorage((state) => state.grid);

    const [item, setItem] = useState<BehaviorItem | null>(null);
    const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(
        null,
    );
    const [backpack, setBackpack] = useState<Backpack | null>(null);
    const [blocklyArea, setBlocklyArea] = useState<HTMLDivElement | null>(null);
    const [blocklyDiv, setBlocklyDiv] = useState<HTMLDivElement | null>(null);
    const [pendingTags, setPendingTags] = useState<string[]>([]);

    /**
     * null = new block, undefined = closed
     */
    const [editBlockProcedureId, setEditBlockProcedureId] = useState<
        string | null | undefined
    >();

    /**
     * undefined = closed, string = variable type to create
     */
    const [createVariableType, setCreateVariableType] = useState<
        string | undefined
    >();

    // Callback refs so that the values can trigger re-renders
    const blocklyAreaRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node !== null) {
                setBlocklyArea(node);
            }
        },
        [setBlocklyArea],
    );

    // Callback refs so that the values can trigger re-renders
    const blocklyDivRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node !== null) {
                setBlocklyDiv(node);
            }
        },
        [setBlocklyDiv],
    );

    // Fetch the item when the component mounts
    useEffect(() => {
        void OBR.scene.items.getItems([itemId]).then((items) => {
            if (items[0] && isBehaviorItem(items[0])) {
                setItem(items[0]);
                setPendingTags(getTags(items[0]));
            }
        });
    }, [itemId]);

    // Create blockly workspace
    useEffect(() => {
        /**
         * https://developers.google.com/blockly/guides/configure/web/resizable
         */
        const onresize = () => {
            // console.log("resizing Blockly");
            // Compute the absolute coordinates and dimensions of blocklyArea.
            if (!blocklyArea || !blocklyDiv || !workspace) {
                return;
            }
            let x = 0;
            let y = 0;
            let element: HTMLElement | null = blocklyArea;
            do {
                x += element.offsetLeft;
                y += element.offsetTop;
                element = element.offsetParent as HTMLElement;
            } while (element);
            // Position blocklyDiv over blocklyArea.
            blocklyDiv.style.left = x + "px";
            blocklyDiv.style.top = y + "px";
            blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
            blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
            Blockly.svgResize(workspace);
        };

        if (blocklyArea && blocklyDiv && !workspace && item) {
            // console.log("injecting Blockly");
            setupBlocklyGlobals();
            const workspace = Blockly.inject(blocklyDiv, {
                // https://developers.google.com/blockly/guides/configure/web/configuration_struct
                renderer: Renderer.NAME, // catBlocks ? RENDERER_CAT : "zelos", // Scratch styling
                toolbox: createToolbox(item, grid),
                theme: createBlocklyTheme(theme, catBlocks),
                trashcan: false,
                move: {
                    scrollbars: true,
                    wheel: true,
                },
                zoom: {
                    controls: true,
                    // wheel: true,
                    pinch: true,
                    startScale: 0.7,
                },
                grid: {
                    spacing: 20,
                    length: 5, // 1 = dots, 5 = crosses, 20 = full lines.
                    colour: GRID_COLOR,
                    snap: true,
                },
                plugins: {
                    flyoutsVerticalToolbox: "ContinuousFlyout",
                    metricsManager: "ContinuousMetrics",
                    toolbox: "ContinuousToolbox",
                    // variableMap: BehaviorVariableMap,
                    [Blockly.registry.Type.CONNECTION_CHECKER.toString()]:
                        BehaviorConnectionChecker,
                    [Blockly.registry.Type.BLOCK_DRAGGER.toString()]: Dragger,
                },
            });
            installGetExtensionCallback(workspace);

            // Add event listeners for modals
            workspace.addChangeListener((event) => {
                if (isShowEditProcedure(event)) {
                    setEditBlockProcedureId(event.getProcedureId());
                } else if (isShowCreateVariable(event)) {
                    setCreateVariableType(event.getVariableType());
                }
            });

            setWorkspace(workspace);

            // Load workspace content
            if (item.metadata[METADATA_KEY_BEHAVIORS]) {
                Blockly.serialization.workspaces.load(
                    item.metadata[METADATA_KEY_BEHAVIORS].workspace,
                    workspace,
                );
            } else {
                // Add a starting block if not loading a workspace
                const block = workspace.newBlock(BLOCK_IMMEDIATELY.type); // Replace with your block type
                block.initSvg();
                block.render();
                // block.moveBy(120, 40); // Position the block (x, y)
            }

            // Initialize backpack after loading workspace so we can override its contents
            const backpack = new Backpack(workspace, {
                useFilledBackpackImage: true,
            });
            backpack.init();
            backpack.setContents(backpackContents);
            setBackpack(backpack);
        }

        // Register resize handler if workspace exists
        if (workspace) {
            window.addEventListener("resize", onresize, false);
            // Call onresize to ensure correct sizing
            setTimeout(onresize, 0);
        }

        return () => {
            window.removeEventListener("resize", onresize, false);
        };
    }, [
        blocklyArea,
        blocklyDiv,
        workspace,
        backpack,
        item,
        theme,
        backpackContents,
        catBlocks,
        grid,
    ]);

    // Update the workspace when scene metadata changes
    useEffect(() => {
        if (workspace) {
            handleNewSceneMetadata(workspace);
        }
    }, [workspace, sceneMetadata]);

    async function handleClose(save: boolean) {
        // save the backpack to local storage, not the workspace
        if (backpack) {
            setBackpackContents(backpack.getContents());
            backpack.setContents([]);
        }

        if (save) {
            // Save the workspace serialized to JSON in the item behavior key
            if (workspace && item) {
                await OBR.scene.items.updateItems([item], (items) =>
                    items.forEach((item) => {
                        if (
                            workspace.getAllBlocks().length > 0 ||
                            workspace.getVariableMap().getAllVariables()
                                .length > 0
                        ) {
                            item.metadata[METADATA_KEY_BEHAVIORS] = {
                                lastModified: Date.now(),
                                workspace:
                                    Blockly.serialization.workspaces.save(
                                        workspace,
                                    ),
                            };
                        } else {
                            delete item.metadata[METADATA_KEY_BEHAVIORS];
                        }

                        if (pendingTags.length > 0) {
                            item.metadata[METADATA_KEY_TAGS] = pendingTags;
                        } else {
                            delete item.metadata[METADATA_KEY_TAGS];
                        }
                    }),
                );

                // Add any new tags to scene metadata
                const availableTags =
                    usePlayerStorage.getState().sceneMetadata.tags;
                await addTags(
                    ...pendingTags.filter(
                        (tag) => !availableTags.includes(tag),
                    ),
                );
            }
        }

        await OBR.modal.close(MODAL_EDIT_BEHAVIOR_ID);
    }

    if (item === null) {
        return null;
    }

    return (
        <>
            <div ref={blocklyDivRef} style={{ position: "absolute" }} />
            <Stack sx={{ height: "100%" }}>
                <DialogTitle>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <div>Edit Behavior for {item.name}</div>
                        <Box
                            sx={{
                                flex: 1,
                                // backgroundColor: theme.background.paper,
                                borderRadius: 1,
                                p: 1,
                            }}
                        >
                            <ItemTagsEditor
                                tags={pendingTags}
                                onTagsChange={setPendingTags}
                            />
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <div
                        ref={blocklyAreaRef}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    ></div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => handleClose(false)}
                        startIcon={<Close />}
                        variant="contained"
                    >
                        Close without Saving
                    </Button>
                    <Button
                        onClick={() => handleClose(true)}
                        startIcon={<Save />}
                        variant="contained"
                    >
                        Save and Run
                    </Button>
                </DialogActions>
            </Stack>
            {workspace && (
                <>
                    <NewBlockModal
                        open={editBlockProcedureId !== undefined}
                        onClose={() => {
                            setEditBlockProcedureId(undefined);
                        }}
                        workspace={workspace}
                        procedureId={editBlockProcedureId ?? null}
                    />
                    <VariableModal
                        open={createVariableType !== undefined}
                        onClose={() => {
                            setCreateVariableType(undefined);
                        }}
                        workspace={workspace}
                        variableType={createVariableType ?? ""}
                    />
                </>
            )}
        </>
    );
};
