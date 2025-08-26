import { isHexColor, units, unitsToPixels } from "owlbear-utils";
import type { BLOCK_EXTENSION_WEATHER_ADD } from "../../blockly/blocks";
import { Announcement } from "../../extensions/Announcement";
import { Auras } from "../../extensions/Auras";
import { Bones } from "../../extensions/Bones";
import { CharacterDistances } from "../../extensions/CharacterDistances";
import { Clash } from "../../extensions/Clash";
import { Codeo } from "../../extensions/Codeo";
import { Daggerheart } from "../../extensions/Daggerheart";
import { Fog } from "../../extensions/Fog";
import { Gapi } from "../../extensions/Gapi";
import { Grimoire } from "../../extensions/Grimoire";
import { Hoot } from "../../extensions/Hoot";
import { OwlTrackers } from "../../extensions/OwlTrackers";
import { Peekaboo } from "../../extensions/Peekaboo";
import { PrettySordid } from "../../extensions/PrettySordid";
import { Rumble } from "../../extensions/Rumble";
import { SmokeAndSpectre } from "../../extensions/SmokeAndSpectre";
import { Weather, type WeatherType } from "../../extensions/Weather";
import { usePlayerStorage } from "../../state/usePlayerStorage";
import { ItemProxy } from "../ItemProxy";

export const EXTENSIONS_BEHAVIORS = {
    // Announcement
    announce: (signal: AbortSignal, message: unknown, secsUnknown: unknown) => {
        const secs = Number(secsUnknown);
        if (!isFinite(secs) || isNaN(secs) || secs <= 0) {
            console.warn(`[announce] secs invalid: ${secs}`);
            return;
        }

        return Announcement.announce(signal, String(message), secs);
    },

    // Hoot
    hoot: async (signal: AbortSignal, track: unknown, playlist: unknown) => {
        await Hoot.play(String(playlist), String(track), false);
        signal.throwIfAborted();
    },

    // Auras and Emanations
    removeAuras: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        if (typeof selfIdUnknown === "string") {
            await Auras.removeAll(selfIdUnknown);
            signal.throwIfAborted();
        }
    },

    addAura: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        styleUnknown: unknown,
        colorUnknown: unknown,
        sizeUnknown: unknown,
    ) => {
        if (typeof selfIdUnknown !== "string") {
            return;
        }

        const size = Number(sizeUnknown);
        if (!isFinite(size) || isNaN(size) || size < 0) {
            console.warn(`[addAura] size invalid: ${size}`);
            return;
        }

        const color = String(colorUnknown);
        if (!isHexColor(color)) {
            console.warn(`[addAura] color invalid: ${color}`);
            return;
        }

        await Auras.add(selfIdUnknown, String(styleUnknown), color, size);
        signal.throwIfAborted();
    },

    addAuraPreset: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        presetUnknown: unknown,
    ) => {
        await Auras.addPreset(String(selfIdUnknown), String(presetUnknown));
        signal.throwIfAborted();
    },

    // Dynamic Fog
    hasLight: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<boolean> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return false;
        }
        return Fog.hasLight(selfItem);
    },

    addLight: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        radiusUnknown: unknown,
        shape: "circle" | "cone",
    ) => {
        const radius = units(Number(radiusUnknown));
        if (!isFinite(radius) || isNaN(radius) || radius < 0) {
            console.warn(`[addLight] radius invalid: ${radius}`);
            return;
        }

        // Convert from grid units to pixels
        const grid = usePlayerStorage.getState().grid;
        const radiusPixels = unitsToPixels(radius, grid);

        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            Fog.addLight(self, radiusPixels, shape);
        });
        signal.throwIfAborted();
    },

    removeLight: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            Fog.removeLight(self);
        });
        signal.throwIfAborted();
    },

    // Smoke and Spectre
    hasVision: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<boolean> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return false;
        }
        return SmokeAndSpectre.hasVision(selfItem);
    },

    addVision: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        radiusUnknown: unknown,
        shape: "circle" | "cone",
    ) => {
        const radius = units(Number(radiusUnknown));
        if (!isFinite(radius) || isNaN(radius) || radius < 0) {
            console.warn(`[addVision] radius invalid: ${radius}`);
            return;
        }
        // Convert from grid units to pixels
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.addVision(self, radius, shape);
        });
        signal.throwIfAborted();
    },

    disableVision: async (signal: AbortSignal, selfIdUnknown: unknown) => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.disableVision(self);
        });
        signal.throwIfAborted();
    },

    setVisionLine: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        enabledUnknown: unknown,
    ) => {
        const enabled = Boolean(enabledUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setVisionLine(self, enabled);
        });
        signal.throwIfAborted();
    },

    setPassable: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        passableUnknown: unknown,
    ) => {
        const passable = Boolean(passableUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setPassable(self, passable);
        });
        signal.throwIfAborted();
    },

    setDoubleSided: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        doubleSidedUnknown: unknown,
    ) => {
        const doubleSided = Boolean(doubleSidedUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setSided(self, doubleSided);
        });
        signal.throwIfAborted();
    },

    setDoorLocked: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        lockedUnknown: unknown,
    ) => {
        const locked = Boolean(lockedUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setDoorLocked(self, locked);
        });
        signal.throwIfAborted();
    },

    setDoorOpen: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        openUnknown: unknown,
    ) => {
        const open = Boolean(openUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setDoorOpen(self, open);
        });
        signal.throwIfAborted();
    },

    setDoorEnabled: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        enabledUnknown: unknown,
    ) => {
        const enabled = Boolean(enabledUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setDoorEnabled(self, enabled);
        });
        signal.throwIfAborted();
    },

    setWindowEnabled: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        enabledUnknown: unknown,
    ) => {
        const enabled = Boolean(enabledUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setWindowEnabled(self, enabled);
        });
        signal.throwIfAborted();
    },

    setVisionBlind: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        blindUnknown: unknown,
    ) => {
        const blind = Boolean(blindUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (self) => {
            SmokeAndSpectre.setVisionBlind(self, blind);
        });
        signal.throwIfAborted();
    },

    // GM's Grimoire
    getHp: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Grimoire.getHp(selfItem);
    },

    getMaxHp: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Grimoire.getMaxHp(selfItem);
    },

    getTempHp: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Grimoire.getTempHp(selfItem);
    },

    getArmorClass: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Grimoire.getArmorClass(selfItem);
    },

    // Rumble
    rumbleSay: async (
        signal: AbortSignal,
        messageUnknown: unknown,
        toSelf: boolean,
    ): Promise<void> => {
        await Rumble.sendChatMessage(String(messageUnknown), toSelf);
        signal.throwIfAborted();
    },

    rumbleRoll: async (
        signal: AbortSignal,
        notationUnknown: unknown,
    ): Promise<void> => {
        await Rumble.rollDice(String(notationUnknown));
        signal.throwIfAborted();
    },

    // Bones
    bonesRoll: async (
        signal: AbortSignal,
        notationUnknown: unknown,
        viewersUnknown: unknown,
    ): Promise<number> => {
        const notation = String(notationUnknown);
        const viewers = String(viewersUnknown) as "GM" | "ALL";

        const result = await Bones.roll(notation, viewers);
        signal.throwIfAborted();

        return result ?? 0;
    },

    // GM's Daggerheart
    getDaggerheartStat: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        statUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Daggerheart.getStat(selfItem, String(statUnknown));
    },

    getDaggerheartFear: async (signal: AbortSignal): Promise<number> => {
        const fear = await Daggerheart.getFear();
        signal.throwIfAborted();
        return fear;
    },

    // Owl Trackers
    getOwlTrackersField: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fieldNameUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return OwlTrackers.getFieldValue(selfItem, String(fieldNameUnknown));
    },

    isOwlTrackersFieldChecked: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fieldNameUnknown: unknown,
    ): Promise<boolean> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return false;
        }
        return OwlTrackers.isFieldChecked(selfItem, String(fieldNameUnknown));
    },

    setOwlTrackersField: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fieldNameUnknown: unknown,
        valueUnknown: unknown,
    ): Promise<void> => {
        const value = Number(valueUnknown);
        if (!isFinite(value) || isNaN(value)) {
            console.warn(`[setViewport] value invalid: ${value}`);
            return;
        }
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            OwlTrackers.setFieldValue(draft, String(fieldNameUnknown), value);
        });
        signal.throwIfAborted();
    },

    setOwlTrackersCheckbox: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fieldNameUnknown: unknown,
        checkedUnknown: unknown,
    ): Promise<void> => {
        const checked = Boolean(checkedUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            OwlTrackers.setFieldChecked(
                draft,
                String(fieldNameUnknown),
                checked,
            );
        });
        signal.throwIfAborted();
    },

    setOwlTrackerShowOnMap: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        fieldNameUnknown: unknown,
        showUnknown: unknown,
    ): Promise<void> => {
        const show = Boolean(showUnknown);
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            OwlTrackers.setFieldShowOnMap(
                draft,
                String(fieldNameUnknown),
                show,
            );
        });
        signal.throwIfAborted();
    },

    // Google Sheets
    getSheetsValue: async (
        signal: AbortSignal,
        cellUnknown: unknown,
        sheetUnknown: unknown,
        spreadsheetUrlOrIdUnknown: unknown,
    ): Promise<string> => {
        const spreadsheetId = Gapi.getSpreadsheetId(
            String(spreadsheetUrlOrIdUnknown),
        );
        const result = await Gapi.getSheetsValue(
            spreadsheetId,
            String(sheetUnknown),
            String(cellUnknown),
        );
        signal.throwIfAborted();
        return result;
    },

    // Owlbear Codeo
    runScript: async (signal: AbortSignal, scriptNameUnknown: unknown) => {
        await Codeo.runScript(String(scriptNameUnknown));
        signal.throwIfAborted();
    },

    // Weather
    addWeather: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        type: WeatherType,
        direction: (typeof BLOCK_EXTENSION_WEATHER_ADD)["args0"][1]["options"][number][1],
        speedUnknown: unknown,
        densityUnknown: unknown,
    ): Promise<void> => {
        const speed = Number(speedUnknown);
        const density = Number(densityUnknown);

        if (!isFinite(speed) || isNaN(speed) || speed < 1 || speed > 4) {
            console.warn(`[addWeather] speed invalid: ${speed}`);
            return;
        }

        if (
            !isFinite(density) ||
            isNaN(density) ||
            density < 1 ||
            density > 4
        ) {
            console.warn(`[addWeather] density invalid: ${density}`);
            return;
        }

        const directionVector = {
            NORTHWEST: { x: -1, y: 1 },
            NORTH: { x: 0, y: 1 },
            NORTHEAST: { x: 1, y: 1 },
            EAST: { x: 1, y: 0 },
            SOUTHEAST: { x: 1, y: -1 },
            SOUTH: { x: 0, y: -1 },
            SOUTHWEST: { x: -1, y: -1 },
            WEST: { x: -1, y: 0 },
            NONE: { x: 0, y: 0 },
        }[direction];

        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            Weather.addWeather(draft, type, directionVector, speed, density);
        });
        signal.throwIfAborted();
    },

    removeWeather: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<void> => {
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            Weather.removeWeather(draft);
        });
        signal.throwIfAborted();
    },

    hasWeather: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<boolean> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return false;
        }
        return Weather.hasWeather(selfItem);
    },

    // Pretty Sordid Initiative
    getMyInitiative: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return PrettySordid.getInitiativeCount(selfItem);
    },

    isMyTurn: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<boolean> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return false;
        }
        return PrettySordid.isActiveTurn(selfItem);
    },

    setMyInitiative: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        countUnknown: unknown,
    ): Promise<void> => {
        const count = Number(countUnknown);
        if (!isFinite(count) || isNaN(count)) {
            console.warn(`[setMyInitiative] count invalid: ${count}`);
            return;
        }
        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            PrettySordid.setInitiativeCount(draft, count);
        });
        signal.throwIfAborted();
    },

    // Clash!
    getClashHP: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Clash.getHP(selfItem);
    },

    getClashMaxHP: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Clash.getMaxHP(selfItem);
    },

    getClashInitiative: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Clash.getInitiative(selfItem);
    },

    // Peekaboo
    setSolidity: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        solidityUnknown: unknown,
    ): Promise<void> => {
        const solidity = Number(solidityUnknown);
        if (!isFinite(solidity) || isNaN(solidity)) {
            console.warn(`[setSolidity] solidity invalid: ${solidity}`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            Peekaboo.setSolidity(draft, solidity);
        });
        signal.throwIfAborted();
    },

    getSolidity: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return Peekaboo.getSolidity(selfItem);
    },

    // Character Distances
    getHeight: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
    ): Promise<number> => {
        const selfItem = await ItemProxy.getInstance().get(
            String(selfIdUnknown),
        );
        signal.throwIfAborted();
        if (!selfItem) {
            return 0;
        }
        return CharacterDistances.getHeight(selfItem);
    },

    setHeight: async (
        signal: AbortSignal,
        selfIdUnknown: unknown,
        heightUnknown: unknown,
    ): Promise<void> => {
        const height = Number(heightUnknown);
        if (!isFinite(height) || isNaN(height)) {
            console.warn(`[setHeight] height invalid: ${height}`);
            return;
        }

        await ItemProxy.getInstance().update(String(selfIdUnknown), (draft) => {
            CharacterDistances.setHeight(draft, height);
        });
        signal.throwIfAborted();
    },
};
