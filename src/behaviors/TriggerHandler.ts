import type { BehaviorItem } from "../BehaviorItem";
import type { BehaviorFunction } from "./compileBehavior";

interface BaseTriggerHandler {
    behaviorFunction: BehaviorFunction;
    /**
     * Controller if the behavior is running.
     */
    abortController?: AbortController;
}

interface BroadcastTriggerHandler extends BaseTriggerHandler {
    readonly type: "broadcast";
    readonly broadcast: string;
}

interface SelectedTriggerHandler extends BaseTriggerHandler {
    readonly type: "selected";
    selectedState: boolean;
}
interface PropertyChanged<K extends keyof BehaviorItem>
    extends BaseTriggerHandler {
    readonly type: K;
    /**
     * New value of the property. If unset, all changes will
     * trigger the handler.
     */
    readonly newValue?: BehaviorItem[K];
}

interface CollisionTriggerHandler extends BaseTriggerHandler {
    readonly type: "collision";
    /**
     * True if this handler is for the start of a collision, false if
     * it's for the end of a collision.
     */
    readonly start: boolean;
}

export type TriggerHandler =
    | BroadcastTriggerHandler
    | SelectedTriggerHandler
    | PropertyChanged<"position">
    | PropertyChanged<"visible">
    | PropertyChanged<"locked">
    | PropertyChanged<"layer">
    | CollisionTriggerHandler;
