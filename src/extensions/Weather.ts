import { type Item, type Vector2 } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "rodeo.owlbear.weather/weather";

export type WeatherType = "SNOW" | "RAIN" | "SAND" | "FIRE" | "CLOUD" | "BLOOM";

export interface WeatherData {
    type: WeatherType;
    direction: Vector2;
    speed: number; // 1-4 (slow to super fast)
    density: number; // 1-4 (light to super heavy)
}

export const Weather = {
    hasWeather: (item: Item): boolean => !!item.metadata[METADATA_KEY],

    /**
     * Add weather to an item draft.
     */
    addWeather: (
        item: Draft<Item>,
        type: WeatherData["type"],
        direction: Vector2,
        speed: number,
        density: number,
    ): void => {
        item.metadata[METADATA_KEY] = {
            type,
            direction,
            speed,
            density,
        } satisfies WeatherData;
    },

    removeWeather: (item: Draft<Item>): void => {
        delete item.metadata[METADATA_KEY];
    },
};
