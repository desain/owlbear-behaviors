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
    const { setSceneReady } = usePlayerStorage.getState();

    const sceneReadyInitialized = OBR.scene.isReady().then(setSceneReady);
    const unsubscribeSceneReady = OBR.scene.onReadyChange((ready) => {
        setSceneReady(ready);
    });

    // const roleInitialized = OBR.player.getRole().then(setRole);
    // const playerIdInitialized = OBR.player.getId().then(setPlayerId);
    // const selectionInitialized = OBR.player
    //     .getSelection()
    //     .then(store.setSelection);
    // const unsubscribePlayer = OBR.player.onChange((player) => {
    //     setRole(player.role);
    //     setPlayerId(player.id);
    //     void setSelection(player.selection);
    // });

    // const gridInitialized = Promise.all([
    //     OBR.scene.grid.getDpi(),
    //     OBR.scene.grid.getMeasurement(),
    //     OBR.scene.grid.getType(),
    // ]).then(([dpi, measurement, type]) =>
    //     setGrid({ dpi, measurement, type }),
    // );
    // const unsubscribeGrid = OBR.scene.grid.onChange(setGrid);

    // const roomMetadataInitialized = OBR.room.getMetadata().then(handleRoomMetadataChange);
    // const unsubscribeRoomMetadata = OBR.room.onMetadataChange(handleRoomMetadataChange);

    // const unsubscribeItems = OBR.scene.items.onChange((items) =>
    //     updateItems(items),
    // );

    return [
        Promise.all([
            sceneReadyInitialized,
            // roleInitialized,
            // playerIdInitialized,
            // selectionInitialized,
            // gridInitialized,
            // roomMetadataInitialized,
        ]).then(() => void 0),
        deferCallAll(
            unsubscribeSceneReady,
            // unsubscribePlayer,
            // unsubscribeGrid,
            // unsubscribeItems,
            // unsubscribeRoomMetadata,
        ),
    ];
}
