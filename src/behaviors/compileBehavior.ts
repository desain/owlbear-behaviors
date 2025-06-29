import { compileObrFunction, type ObrFunction } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import {
    CONSTANT_BEHAVIOR_DEFINITION,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_ITEM_PROXY,
    PARAMETER_SELF_ID,
} from "../constants";
import type { BEHAVIORS_IMPL } from "./BehaviorImpl";
import type { ItemProxy } from "./ItemProxy";
import type { TriggerHandler } from "./TriggerHandler";

/**
 * Result of executing the compiled code from a Blockly workspace.
 */
export interface BehaviorDefinition {
    immediately: BehaviorFunction[];
    triggerHandlers: TriggerHandler[];
}

/**
 * Type of the compiled code from a Blockly workspace.
 */
export type BehaviorDefinitionFunction = ObrFunction<
    [
        self: BehaviorItem["id"],
        behaviors: typeof BEHAVIORS_IMPL,
        ItemProxy: ItemProxy,
    ],
    BehaviorDefinition
>;

/**
 * Function that actually executes behavior.
 */
export type BehaviorFunction = (
    signal: AbortSignal,
    /**
     * Other item for collisions.
     */
    other?: BehaviorItem["id"],
) => Promise<void>;

export function compileBehavior(code: string): BehaviorDefinitionFunction {
    const behaviorDefinitionCode = `
const ${CONSTANT_BEHAVIOR_DEFINITION} /*: BehaviorDefinition */ = {
    immediately: [],
    triggerHandlers: [],
}
${code}
return ${CONSTANT_BEHAVIOR_DEFINITION};`;
    // console.log("compiling", behaviorDefinitionCode);

    return compileObrFunction(behaviorDefinitionCode, [
        PARAMETER_SELF_ID,
        PARAMETER_BEHAVIOR_IMPL,
        PARAMETER_ITEM_PROXY,
    ]);
}
