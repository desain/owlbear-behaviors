import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    isText,
    type Curve,
    type Image,
    type Item,
    type Line,
    type Path,
    type Shape,
    type Text,
} from "@owlbear-rodeo/sdk";
import {
    containsImplies,
    isObject,
    isString,
    isTrue,
    type HasParameterizedMetadata,
} from "owlbear-utils";
import {
    METADATA_KEY_BEHAVIORS,
    METADATA_KEY_CLONE,
    METADATA_KEY_MENU_ITEMS,
    METADATA_KEY_TAGS,
} from "./constants";

export interface BehaviorData {
    lastModified: number;
    workspace: object;
}
function isBehaviorData(data: unknown): data is BehaviorData {
    return (
        isObject(data) &&
        "lastModified" in data &&
        typeof data.lastModified === "number" &&
        "workspace" in data &&
        typeof data.workspace === "object"
    );
}

export type BehaviorItem = (Image | Line | Curve | Shape | Path | Text) &
    HasParameterizedMetadata<typeof METADATA_KEY_TAGS, string[] | undefined> &
    HasParameterizedMetadata<
        typeof METADATA_KEY_BEHAVIORS,
        BehaviorData | undefined
    > &
    HasParameterizedMetadata<typeof METADATA_KEY_CLONE, true | undefined> &
    HasParameterizedMetadata<
        typeof METADATA_KEY_MENU_ITEMS,
        Record<string, boolean> | undefined
    >;
export function isBehaviorItem(item: Item): item is BehaviorItem {
    return (
        (isImage(item) ||
            isLine(item) ||
            isCurve(item) ||
            isShape(item) ||
            isPath(item) ||
            isText(item)) &&
        containsImplies(
            item.metadata,
            METADATA_KEY_TAGS,
            (tags) => Array.isArray(tags) && tags.every(isString),
        ) &&
        containsImplies(
            item.metadata,
            METADATA_KEY_BEHAVIORS,
            isBehaviorData,
        ) &&
        containsImplies(item.metadata, METADATA_KEY_CLONE, isTrue) &&
        containsImplies(
            item.metadata,
            METADATA_KEY_MENU_ITEMS,
            (items): items is Record<string, boolean> =>
                isObject(items) &&
                Object.values(items).every(
                    (value) => typeof value === "boolean",
                ),
        )
    );
}

export const BEHAVIOR_ITEM_TYPES = [
    "IMAGE",
    "LINE",
    "CURVE",
    "SHAPE",
    "PATH",
    "TEXT",
] as const satisfies BehaviorItem["type"][];
// This will error if BEHAVIOR_ITEM_TYPES is missing any BehaviorItem['type'] value
type AssertAllTypesCovered = Exclude<
    BehaviorItem["type"],
    (typeof BEHAVIOR_ITEM_TYPES)[number]
> extends never
    ? true
    : [
          error: "Missing types in BEHAVIOR_ITEM_TYPES",
          missingValue: Exclude<
              BehaviorItem["type"],
              (typeof BEHAVIOR_ITEM_TYPES)[number]
          >,
      ];

// This line will cause a type error if not all types are covered
const _assertAllTypesCovered: AssertAllTypesCovered = true;
void _assertAllTypesCovered;

export function getTags(item: BehaviorItem) {
    return item.metadata[METADATA_KEY_TAGS] ?? [];
}
