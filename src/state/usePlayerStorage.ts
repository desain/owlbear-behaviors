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
import { LOCAL_STORAGE_STORE_NAME, METADATA_KEY_SCENE } from "../constants";
import {
    DEFAULT_SCENE_METADATA,
    isSceneMetadata,
    type SceneMetadata,
} from "./SceneMetadata";

enableMapSet();

export interface LocalStorage {
    readonly contextMenuEnabled: boolean;
    readonly showAddTagsContextMenu?: boolean;
    readonly backpackContents: string[];
    readonly muteBlockly?: boolean;
    readonly setContextMenuEnabled: (
        this: void,
        contextMenuEnabled: boolean,
    ) => void;
    readonly setShowAddTagsContextMenu: (
        this: void,
        showAddTagsContextMenu: boolean,
    ) => void;
    readonly setBackpackContents: (
        this: void,
        backpackContents: string[],
    ) => void;
    readonly setMuteBlockly: (this: void, muteBlockly: boolean) => void;
}
function partializeLocalStorage({
    contextMenuEnabled,
    showAddTagsContextMenu,
    backpackContents,
    muteBlockly,
}: LocalStorage): ExtractNonFunctions<LocalStorage> {
    return { contextMenuEnabled, showAddTagsContextMenu, backpackContents, muteBlockly };
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
                showAddTagsContextMenu: true,
                // setToolEnabled: (toolEnabled) => set({ toolEnabled }),
                backpackContents: [],
                setContextMenuEnabled: (contextMenuEnabled) =>
                    set({ contextMenuEnabled }),
                setShowAddTagsContextMenu: (showAddTagsContextMenu) =>
                    set({ showAddTagsContextMenu }),
                setBackpackContents: (backpackContents) =>
                    set({ backpackContents }),
                setMuteBlockly: (muteBlockly) => set({ muteBlockly }),

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
                sceneMetadataLoaded: false,
                sceneMetadata: DEFAULT_SCENE_METADATA,
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
                handleItemsChange: (items: Item[]) => {
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
