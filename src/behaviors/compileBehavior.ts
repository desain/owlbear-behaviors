import { compileObrFunction, complain, type ObrFunction } from "owlbear-utils";
import type { BehaviorItem } from "../BehaviorItem";
import {
    CONSTANT_TRIGGER_HANDLERS,
    PARAMETER_BEHAVIOR_IMPL,
    PARAMETER_BEHAVIOR_REGISTRY,
    PARAMETER_GLOBALS,
    PARAMETER_ITEM_PROXY,
    PARAMETER_SELF_ID,
} from "../constants";
import type { BEHAVIORS_IMPL } from "./BehaviorImpl";
import type { BehaviorGlobals, BehaviorRegistry } from "./BehaviorRegistry";
import type { ItemProxy } from "./ItemProxy";
import type { TriggerHandler } from "./TriggerHandler";

/**
 * Type of the compiled code from a Blockly workspace.
 */
export type BehaviorDefinitionFunction = ObrFunction<
    [
        self: BehaviorItem["id"],
        behaviors: typeof BEHAVIORS_IMPL,
        ItemProxy: ItemProxy,
        globals: BehaviorGlobals,
        behaviorRegistry: BehaviorRegistry,
    ],
    TriggerHandler[]
>;

/**
 * Function that actually executes behavior.
 */
export type BehaviorFunction = (
    signal: AbortSignal,
    hatId: string,
    /**
     * Other item for collisions.
     */
    other?: BehaviorItem["id"],
) => Promise<void>;

export function compileBehavior(code: string): BehaviorDefinitionFunction {
    const behaviorDefinitionCode = `
const ${CONSTANT_TRIGGER_HANDLERS} = [];
${code}
return ${CONSTANT_TRIGGER_HANDLERS};`;
    if (import.meta.env.DEV) {
        console.debug(
            `[${import.meta.env.MODE}] compiling`,
            behaviorDefinitionCode,
        );
    }

    try {
        return compileObrFunction(behaviorDefinitionCode, [
            PARAMETER_SELF_ID,
            PARAMETER_BEHAVIOR_IMPL,
            PARAMETER_ITEM_PROXY,
            PARAMETER_GLOBALS,
            PARAMETER_BEHAVIOR_REGISTRY,
        ]);
    } catch (e) {
        complain(String(e));
        return () => [];
    }
}
