import OBR, { type Item, type Metadata, type Theme } from "@owlbear-rodeo/sdk";
import { enableMapSet } from "immer";
import type {
    ExtractNonFunctions,
    GridParams,
    GridParsed,
    Role,
} from "owlbear-utils";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { isBehaviorItem, type BehaviorItem } from "../BehaviorItem";
import {
    DROPDOWN_BROADCAST_DEFAULT,
    DROPDOWN_SOUND_MEOW,
    DROPDOWN_TAG_DEFAULT,
    LOCAL_STORAGE_STORE_NAME,
    METADATA_KEY_SCENE,
} from "../constants";
import { isSceneMetadata, type SceneMetadata } from "./SceneMetadata";

enableMapSet();

export interface LocalStorage {
    // readonly toolEnabled: boolean;
    readonly contextMenuEnabled: boolean;
    // readonly setToolEnabled: (this: void, toolEnabled: boolean) => void;
    readonly backpackContents: string[];
    readonly setContextMenuEnabled: (
        this: void,
        contextMenuEnabled: boolean,
    ) => void;
    readonly setBackpackContents: (
        this: void,
        backpackContents: string[],
    ) => void;
}
function partializeLocalStorage({
    // toolEnabled,
    contextMenuEnabled,
    backpackContents,
}: LocalStorage): ExtractNonFunctions<LocalStorage> {
    // console.log("partialize", window.location, backpackContents);
    return { contextMenuEnabled, backpackContents };
}

export type BehaviorItemMap = Map<BehaviorItem["id"], BehaviorItem>;
export interface OwlbearStore {
    readonly sceneReady: boolean;
    readonly theme: Theme;
    readonly role: Role;
    readonly playerId: string;
    readonly grid: GridParsed;
    readonly selection: string[];
    // readonly lastNonemptySelection: string[];
    // readonly lastNonemptySelectionItems: Item[];
    // readonly roomMetadata: RoomMetadata;
    /**
     * Whether the scene metadata has loaded since the last scene switch.
     */
    readonly sceneMetadataLoaded: boolean;
    readonly sceneMetadata: SceneMetadata;
    readonly itemsOfInterest: BehaviorItemMap;
    readonly setSceneReady: (this: void, sceneReady: boolean) => void;
    readonly handleThemeChange: (this: void, theme: Theme) => void;
    readonly handleRoleChange: (this: void, role: Role) => void;
    readonly handlePlayerIdChange: (this: void, playerId: string) => void;
    readonly handleGridChange: (this: void, grid: GridParams) => Promise<void>;
    readonly handleSelectionChange: (
        this: void,
        selection: string[] | undefined,
    ) => void;
    readonly handleItemsChange: (this: void, items: Item[]) => void;
    // readonly handleRoomMetadataChange: (this: void, metadata: Metadata) => void;
    readonly handleSceneMetadataChange: (
        this: void,
        metadata: Metadata,
    ) => void;

    /*
    Notes on mirroring metadata:

    https://discord.com/channels/795808973743194152/1082460044731371591/1110879213348737057
    Player metadata isn't saved between refreshes

    Below is some of the technical differences between types of metadata.

    Networking:
    The metadata for a scene or scene item uses a CRDT so it is network resilient.
    The metadata for a player uses a simple CRDT but can only be updated by one person at a time so collisions aren't a concern there.
    Room metadata doesn't use any network resiliency and is last writer wins. Which is why it is generally meant for small values with very low frequency updates.

    Size:
    Metadata for a scene uses the users storage quota.
    Each individual update to the scene and player metadata is limited by the max update size (64kb).
    The room metadata has a max size of 16kB shared across all extensions.

    Other Differences:
    Updates to the scene metadata are added to the undo stack of the user. This means a Ctrl+Z will undo changes made.
    Player metadata is per connection. This means that refreshing the page will reset the metadata}

    Tool metadata is stored in localStorage so all the limitations of that apply.
    This also means that there is no networking in tool metadata and it will be erased if the user clears their cache.
    */
}

export const usePlayerStorage = create<LocalStorage & OwlbearStore>()(
    subscribeWithSelector(
        persist(
            immer((set) => ({
                // local storage
                // toolEnabled: false,
                contextMenuEnabled: true,
                // setToolEnabled: (toolEnabled) => set({ toolEnabled }),
                backpackContents: [],
                setContextMenuEnabled: (contextMenuEnabled) =>
                    set({ contextMenuEnabled }),
                setBackpackContents: (backpackContents) =>
                    set({ backpackContents }),

                // owlbear store
                sceneReady: false,
                theme: {
                    background: {
                        default: "#000000",
                        paper: "#000000",
                    },
                    mode: "DARK",
                    primary: {
                        light: "#FFFFFF",
                        dark: "#000000",
                        contrastText: "#FFFFFF",
                        main: "#FFFFFF",
                    },
                    secondary: {
                        light: "#FFFFFF",
                        dark: "#000000",
                        contrastText: "#FFFFFF",
                        main: "#FFFFFF",
                    },
                    text: {
                        primary: "#FFFFFF",
                        secondary: "#FFFFFF",
                        disabled: "#FFFFFF",
                    },
                },

                role: "PLAYER",
                playerId: "NONE",
                grid: {
                    dpi: -1,
                    measurement: "CHEBYSHEV",
                    type: "SQUARE",
                    parsedScale: {
                        digits: 1,
                        unit: "ft",
                        multiplier: 5,
                    },
                },
                selection: [],
                // lastNonemptySelection: [],
                // lastNonemptySelectionItems: [],
                // roomMetadata: { _key: true },
                sceneMetadataLoaded: false,
                sceneMetadata: {
                    broadcasts: [DROPDOWN_BROADCAST_DEFAULT],
                    tags: [DROPDOWN_TAG_DEFAULT],
                    sounds: {
                        [DROPDOWN_SOUND_MEOW]: {
                            url: "https://cdn.freesound.org/previews/732/732520_13416215-lq.mp3",
                        },
                    },
                },
                itemsOfInterest: new Map(),
                setSceneReady: (sceneReady: boolean) =>
                    set({
                        sceneReady,
                        ...(sceneReady
                            ? {}
                            : {
                                  itemsOfInterest: new Map(),
                                  sceneMetadataLoaded: false,
                              }),
                    }),
                handleThemeChange: (theme: Theme) => set({ theme }),
                handleRoleChange: (role: Role) => set({ role }),
                handlePlayerIdChange: (playerId: string) => set({ playerId }),
                handleGridChange: async (grid: GridParams) => {
                    const parsedScale = (await OBR.scene.grid.getScale())
                        .parsed;
                    return set({
                        grid: {
                            dpi: grid.dpi,
                            measurement: grid.measurement,
                            type: grid.type,
                            parsedScale,
                        },
                    });
                },
                handleSelectionChange: (selection: string[] | undefined) =>
                    set({ selection: selection ?? [] }),
                // setSelection: async (selection: string[] | undefined) => {
                //     if (selection && selection.length > 0) {
                //         return set({
                //             lastNonemptySelection: selection,
                //             lastNonemptySelectionItems:
                //                 await OBR.scene.items.getItems(selection),
                //         });
                //     }
                // },
                // handleItemsChange: (items: Item[]) =>
                //     set((state) => {
                //         const lastNonemptySelectionItems = items.filter(
                //             (item) =>
                //                 state.lastNonemptySelection.includes(item.id),
                //         );
                //         return {
                //             lastNonemptySelectionItems,
                //         };
                //     }),
                handleItemsChange: (items: Item[]) => {
                    // console.log("new items", items);
                    const itemsOfInterest: OwlbearStore["itemsOfInterest"] =
                        new Map();
                    for (const item of items) {
                        if (isBehaviorItem(item)) {
                            itemsOfInterest.set(item.id, item);
                        }
                    }
                    set({ itemsOfInterest });
                },
                // handleRoomMetadataChange: (metadata) => {
                //     const roomMetadata = metadata[METADATA_KEY_ROOM];
                //     if (isRoomMetadata(roomMetadata)) {
                //         set({ roomMetadata });
                //     }
                // },
                handleSceneMetadataChange: (metadata) => {
                    // console.log("new metadata", metadata);
                    const sceneMetadata = metadata[METADATA_KEY_SCENE];
                    if (isSceneMetadata(sceneMetadata)) {
                        set({ sceneMetadata, sceneMetadataLoaded: true });
                    }
                },
            })),
            {
                name: LOCAL_STORAGE_STORE_NAME,
                partialize: partializeLocalStorage,
            },
        ),
    ),
);
