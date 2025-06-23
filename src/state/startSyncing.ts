import OBR from "@owlbear-rodeo/sdk";
import { deferCallAll } from "owlbear-utils";
import { usePlayerStorage } from "./usePlayerStorage";

/**
 * @returns [Promise that resolves once store has initialized, function to stop syncing]
 */
export function startSyncing(): [
    initialized: Promise<void>,
    unsubscribe: VoidFunction,
] {
    // console.log("startSyncing");
    const {
        setSceneReady,
        handleThemeChange,
        handleSceneMetadataChange,
        handleItemsChange,
        handleGridChange,
        handleRoleChange,
        handleSelectionChange,
        handlePlayerIdChange,
    } = usePlayerStorage.getState();

    const sceneReadyInitialized = OBR.scene.isReady().then(setSceneReady);
    const unsubscribeSceneReady = OBR.scene.onReadyChange((ready) => {
        setSceneReady(ready);
    });

    const themeInitialized = OBR.theme.getTheme().then(handleThemeChange);
    const unsubscribeTheme = OBR.theme.onChange(handleThemeChange);

    const roleInitialized = OBR.player.getRole().then(handleRoleChange);
    const playerIdInitialized = OBR.player.getId().then(handlePlayerIdChange);
    const selectionInitialized = OBR.player
        .getSelection()
        .then(handleSelectionChange);
    const unsubscribePlayer = OBR.player.onChange((player) => {
        handleRoleChange(player.role);
        handlePlayerIdChange(player.id);
        handleSelectionChange(player.selection);
    });

    const gridInitialized = Promise.all([
        OBR.scene.grid.getDpi(),
        OBR.scene.grid.getMeasurement(),
        OBR.scene.grid.getType(),
    ]).then(([dpi, measurement, type]) =>
        handleGridChange({ dpi, measurement, type }),
    );
    const unsubscribeGrid = OBR.scene.grid.onChange(handleGridChange);

    // const roomMetadataInitialized = OBR.room.getMetadata().then(handleRoomMetadataChange);
    // const unsubscribeRoomMetadata = OBR.room.onMetadataChange(handleRoomMetadataChange);

    const sceneMetadataInitialized = OBR.scene
        .getMetadata()
        .then(handleSceneMetadataChange);
    const unsubscribeSceneMetadata = OBR.scene.onMetadataChange(
        handleSceneMetadataChange,
    );

    const itemsInitialized = OBR.scene.items.getItems().then(handleItemsChange);
    const unsubscribeItems = OBR.scene.items.onChange(handleItemsChange);

    return [
        Promise.all([
            sceneReadyInitialized,
            themeInitialized,
            sceneMetadataInitialized,
            itemsInitialized,
            roleInitialized,
            playerIdInitialized,
            selectionInitialized,
            gridInitialized,
            // roomMetadataInitialized,
        ]).then(() => void 0),
        deferCallAll(
            unsubscribeSceneReady,
            unsubscribeTheme,
            unsubscribeSceneMetadata,
            unsubscribePlayer,
            unsubscribeGrid,
            unsubscribeItems,
            // unsubscribeRoomMetadata,
        ),
    ];
}
