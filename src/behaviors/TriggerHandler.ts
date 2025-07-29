import type { Block } from "blockly";
import type { BehaviorItem } from "../BehaviorItem";
import type { BehaviorFunction } from "./compileBehavior";

interface BaseTriggerHandler {
    behaviorFunction: BehaviorFunction;
    hatBlockId: Block["id"];
    /**
     * Controller if the behavior is running.
     */
    abortController?: AbortController;
}

interface ImmediateTriggerHandler extends BaseTriggerHandler {
    readonly type: "immediately";
}

interface StartAsCloneTriggerHandler extends BaseTriggerHandler {
    readonly type: "startAsClone";
}

interface BroadcastTriggerHandler extends BaseTriggerHandler {
    readonly type: "broadcast";
    readonly broadcast: string;
}

interface SelectedTriggerHandler extends BaseTriggerHandler {
    readonly type: "selected";
    selectedState: boolean;
}
export interface PropertyChanged<K extends keyof BehaviorItem>
    extends BaseTriggerHandler {
    readonly type: K;
    /**
     * New value of the property.
     * ANY: all values trigger the handler
     * DEFINED: any non-undefined value triggers the handler
     * EXACTLY: the value must be exactly the given value to trigger the handler
     */
    readonly newValue: "ANY" | "DEFINED" | { exactly: BehaviorItem[K] };
}

interface CollisionTriggerHandler extends BaseTriggerHandler {
    readonly type: "collision";
    /**
     * True if this handler is for the start of a collision, false if
     * it's for the end of a collision.
     */
    readonly start: boolean;
}

interface GrimoireHpChangeTriggerHandler extends BaseTriggerHandler {
    readonly type: "grimoire_hp_change";
}

interface BonesRollTriggerHandler extends BaseTriggerHandler {
    readonly type: "bones_roll";
    readonly dieType: number | "ANY";
    readonly value: number;
}

interface PhaseTriggerHandler extends BaseTriggerHandler {
    readonly type: "phase_change";
    readonly name: string;
    readonly phase: number;
}

export type TriggerHandler =
    | ImmediateTriggerHandler
    | StartAsCloneTriggerHandler
    | BroadcastTriggerHandler
    | SelectedTriggerHandler
    | PropertyChanged<"position">
    | PropertyChanged<"rotation">
    | PropertyChanged<"visible">
    | PropertyChanged<"locked">
    | PropertyChanged<"layer">
    | PropertyChanged<"attachedTo">
    | CollisionTriggerHandler
    | GrimoireHpChangeTriggerHandler
    | BonesRollTriggerHandler
    | PhaseTriggerHandler;

export function propertyChangeTriggers<K extends keyof BehaviorItem>(
    handler: PropertyChanged<K>,
    value: BehaviorItem[K],
) {
    if (handler.newValue === "ANY") {
        return true;
    } else if (handler.newValue === "DEFINED") {
        return value !== undefined;
    } else {
        return handler.newValue.exactly === value;
    }
}
