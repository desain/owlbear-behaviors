import { isObject } from "owlbear-utils";

export interface BonesRoll {
    readonly type: number;
    readonly value: number;
}

export type BonesRollEvent = readonly BonesRoll[];

export const Bones = {
    CHANNEL: "bones.dicetoken.broadcast",
    isBonesRollEvent: (data: unknown): data is BonesRollEvent =>
        Array.isArray(data) &&
        data.every(
            (roll) =>
                isObject(roll) &&
                "type" in roll &&
                "value" in roll &&
                typeof roll.type === "number" &&
                typeof roll.value === "number",
        ),
};
