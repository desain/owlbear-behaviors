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
import { isObject, type HasParameterizedMetadata } from "owlbear-utils";
import {
    METADATA_KEY_BEHAVIORS,
    METADATA_KEY_CLONE,
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
    HasParameterizedMetadata<typeof METADATA_KEY_CLONE, true | undefined>;
export function isBehaviorItem(item: Item): item is BehaviorItem {
    return (
        (isImage(item) ||
            isLine(item) ||
            isCurve(item) ||
            isShape(item) ||
            isPath(item) ||
            isText(item)) &&
        (!(METADATA_KEY_TAGS in item.metadata) ||
            (Array.isArray(item.metadata[METADATA_KEY_TAGS]) &&
                item.metadata[METADATA_KEY_TAGS].every(
                    (tag) => typeof tag === "string",
                ))) &&
        (!(METADATA_KEY_BEHAVIORS in item.metadata) ||
            isBehaviorData(item.metadata[METADATA_KEY_BEHAVIORS])) &&
        (!(METADATA_KEY_CLONE in item.metadata) ||
            item.metadata[METADATA_KEY_CLONE] === true)
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
