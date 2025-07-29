import type { Metadata } from "@owlbear-rodeo/sdk";
import { isObject } from "owlbear-utils";

interface PhaseDefinition {
    readonly name: string;
    readonly currentPhase: number;
}

type PhaseDefinitions = readonly PhaseDefinition[];

function isPhaseDefinitions(value: unknown): value is PhaseDefinitions {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                isObject(item) &&
                "name" in item &&
                typeof item.name === "string" &&
                "currentPhase" in item &&
                typeof item.currentPhase === "number",
        )
    );
}

export const Phases = {
    /**
     * @returns map of phase name to phase. Unnamed automations are named
     *          like 'Automation N', where they're the Nth automation.
     */
    getPhases: (metadata: Metadata): Record<string, number> => {
        const results: Record<string, number> = {};
        const phaseDefinitions = metadata["com.phases-automated/automations"];
        if (isPhaseDefinitions(phaseDefinitions)) {
            phaseDefinitions.forEach(({ name, currentPhase }, i) => {
                const uiName = name === "" ? `Automation ${i + 1}` : name;
                results[uiName] = currentPhase;
            });
        }
        return results;
    },
};
