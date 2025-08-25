import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "com.owl-trackers/trackers";

interface BaseTracker {
    readonly id: string;
    readonly color: number;
    readonly name?: string;
    readonly showOnMap?: boolean;
}

interface NumberTracker extends BaseTracker {
    readonly variant: "value" | "counter" | "value-max";
    readonly value: number;
}

interface CheckboxTracker extends BaseTracker {
    readonly variant: "checkbox";
    readonly checked: boolean;
}

type OwlTracker = NumberTracker | CheckboxTracker;

export const OwlTrackers = {
    getFieldValue: (item: Item, fieldName: string): number => {
        const trackers = item.metadata[METADATA_KEY] as
            | OwlTracker[]
            | undefined;

        const tracker = trackers
            ?.filter((t) => t.variant !== "checkbox")
            ?.find((t) => t.name === fieldName);
        return tracker?.value ?? 0;
    },

    isFieldChecked: (item: Item, fieldName: string): boolean => {
        const trackers = item.metadata[METADATA_KEY] as
            | OwlTracker[]
            | undefined;

        const tracker = trackers
            ?.filter((t) => t.variant === "checkbox")
            ?.find((t) => t.name === fieldName);
        return tracker?.checked ?? false;
    },

    setFieldValue: (
        item: Draft<Item>,
        fieldName: string,
        value: number,
    ): void => {
        const trackers =
            (item.metadata[METADATA_KEY] as Draft<OwlTracker[] | undefined>) ??
            [];

        const tracker = trackers.find((t) => t.name === fieldName);

        if (!tracker) {
            trackers.push({
                variant: "value",
                name: fieldName,
                value,
                id: String(Date.now()),
                color: 0,
            });
        } else if (tracker.variant === "checkbox") {
            tracker.checked = !!value;
        } else {
            tracker.value = value;
        }

        item.metadata[METADATA_KEY] = trackers;
    },

    setFieldChecked: (
        item: Draft<Item>,
        fieldName: string,
        checked: boolean,
    ): void => {
        const trackers =
            (item.metadata[METADATA_KEY] as Draft<OwlTracker[] | undefined>) ??
            [];

        const tracker = trackers.find((t) => t.name === fieldName);

        if (!tracker) {
            trackers.push({
                variant: "checkbox",
                name: fieldName,
                checked,
                id: String(Date.now()),
                color: 0,
            });
        } else if (tracker.variant !== "checkbox") {
            tracker.value = Number(checked);
        } else {
            tracker.checked = checked;
        }

        item.metadata[METADATA_KEY] = trackers;
    },

    setFieldShowOnMap: (
        item: Draft<Item>,
        fieldName: string,
        show: boolean,
    ): void => {
        const trackers =
            (item.metadata[METADATA_KEY] as Draft<OwlTracker[] | undefined>) ??
            [];

        const tracker = trackers.find((t) => t.name === fieldName);

        if (tracker) {
            tracker.showOnMap = show;
            item.metadata[METADATA_KEY] = trackers;
        }
    },
};
