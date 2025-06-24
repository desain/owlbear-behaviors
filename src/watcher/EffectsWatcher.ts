import {
    buildEffect,
    isCurve,
    isEffect,
    isPath,
    isShape,
    type BlendMode,
    type Curve,
    type Effect,
    type Item,
    type Path,
    type Shape,
} from "@owlbear-rodeo/sdk";
import {
    assertItem,
    hexToRgb,
    isObject,
    type HasParameterizedMetadata,
} from "owlbear-utils";
import { EFFECT_OPTIONS } from "../blockly/blocks";
import { METADATA_KEY_EFFECT } from "../constants";
import type { Patcher } from "./Patcher";
import type { ItemWatcher } from "./Watcher";

export type EffectType = (typeof EFFECT_OPTIONS)[number][0];

const COLOR_UNIFORM = "color";
const OPACITY_UNIFORM = "opacity";

/**
 * Maps effect type to intensity from 0 to 1
 */
type EffectConfig = Partial<Record<EffectType, number>>;
function isEffectConfig(obj: unknown): obj is EffectConfig {
    const validOptions: string[] = EFFECT_OPTIONS.map((opts) => opts[1]);
    return (
        isObject(obj) &&
        Object.entries(obj).every(
            ([effectType, intensity]) =>
                validOptions.includes(effectType) &&
                typeof intensity === "number",
        )
    );
}

type EffectTarget = (Shape | Curve | Path) &
    HasParameterizedMetadata<
        typeof METADATA_KEY_EFFECT,
        EffectConfig | undefined
    >;
export function isEffectTarget(item: Item): item is EffectTarget {
    return (
        (isShape(item) || isCurve(item) || isPath(item)) &&
        (item.metadata[METADATA_KEY_EFFECT] === undefined ||
            isEffectConfig(item.metadata[METADATA_KEY_EFFECT]))
    );
}

function getBlendMode(effect: EffectType): BlendMode {
    return effect === "invert" ? "DIFFERENCE" : "COLOR";
}

function createEffect(
    globalItem: EffectTarget,
    effectType: EffectType,
    intensity: number,
) {
    return buildEffect()
        .name(`${globalItem.name} ${effectType} fx`)
        .effectType("ATTACHMENT")
        .attachedTo(globalItem.id)
        .layer(globalItem.layer)
        .uniforms([
            {
                name: COLOR_UNIFORM,
                value: hexToRgb(globalItem.style.fillColor)!,
            },
            {
                name: OPACITY_UNIFORM,
                value: intensity,
            },
        ])
        .sksl(
            [
                `uniform vec3 ${COLOR_UNIFORM};`,
                `uniform float ${OPACITY_UNIFORM};`,
                "vec4 main(in vec2 coord) {",
                `\treturn vec4(${COLOR_UNIFORM}, ${OPACITY_UNIFORM});`,
                "}",
            ].join("\n"),
        )
        .blendMode(getBlendMode(effectType))
        .locked(true)
        .disableHit(true)
        .build();
}
export class EffectsWatcher implements ItemWatcher<EffectTarget> {
    static isTarget = (item: Item): item is EffectTarget =>
        (isShape(item) || isCurve(item) || isPath(item)) &&
        (!(METADATA_KEY_EFFECT in item.metadata) ||
            isEffectConfig(item.metadata[METADATA_KEY_EFFECT]));

    readonly #effectIds: Partial<Record<EffectType, Effect["id"]>> = {};

    readonly #fix = (globalItem: EffectTarget, patcher: Patcher) => {
        const effectConfig = globalItem.metadata[METADATA_KEY_EFFECT] ?? {};

        for (const [effectType] of EFFECT_OPTIONS) {
            const newIntensity = effectConfig[effectType];
            const effectId = this.#effectIds[effectType];

            if (!newIntensity && effectId) {
                // removed effect
                patcher.deleteLocal(effectId);
                delete this.#effectIds[effectType];
            } else if (newIntensity && !effectId) {
                const effect = createEffect(
                    globalItem,
                    effectType,
                    newIntensity,
                );
                this.#effectIds[effectType] = effect.id;
                patcher.addLocal(effect);
            } else if (newIntensity && effectId) {
                patcher.updateLocal(effectId, (effect) => {
                    assertItem(effect, isEffect);
                    effect.layer = globalItem.layer;
                    for (const uniform of effect.uniforms) {
                        if (uniform.name === COLOR_UNIFORM) {
                            uniform.value = hexToRgb(
                                globalItem.style.fillColor,
                            )!;
                        } else if (uniform.name === OPACITY_UNIFORM) {
                            uniform.value = newIntensity;
                        }
                    }
                });
            }
        }
    };

    constructor(globalItem: EffectTarget, patcher: Patcher) {
        this.#fix(globalItem, patcher);
    }

    handleItemUpdate = (globalItem: EffectTarget, patcher: Patcher) => {
        this.#fix(globalItem, patcher);
    };

    handleItemDelete = (patcher: Patcher) => {
        Object.entries(this.#effectIds).forEach(([effectType, effectId]) => {
            patcher.deleteLocal(effectId);
            delete this.#effectIds[effectType as EffectType];
        });
    };
}
