import { type Item } from "@owlbear-rodeo/sdk";
import type { Draft } from "immer";

const METADATA_KEY = "com.owl-trackers/trackers";

interface NumberTracker {
    readonly variant: "value" | "counter" | "value-max";
    readonly name: string;
    readonly value: number;
}

interface CheckboxTracker {
    readonly variant: "checkbox";
    readonly name: string;
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

        if (!tracker || tracker.variant === "checkbox") {
            return;
        }

        tracker.value = value;
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

        if (!tracker || tracker.variant !== "checkbox") {
            return;
        }

        tracker.checked = checked;
    },
};
