import { isObject } from "owlbear-utils";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RoomMetadata {}
export function isRoomMetadata(metadata: unknown): metadata is RoomMetadata {
    return isObject(metadata);
}
