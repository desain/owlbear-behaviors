import { Command, type PathCommand, type Vector2 } from "@owlbear-rodeo/sdk";

// TODO: Use Skia path iterator instead, like Dynamic Fog does?
// https://github.com/owlbear-rodeo/dynamic-fog/blob/main/src/background/util/PathHelpers.ts

// Source: https://github.com/ManuelLovell/smoke/blob/87a5472f83d396060fe7b41e59fdd090228f75b8/src/utilities/bsUtilities.ts
const quadraticBezier = (
    t: number,
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
): Vector2 => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    return {
        x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
        y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y,
    };
};

// Source: https://github.com/ManuelLovell/smoke/blob/87a5472f83d396060fe7b41e59fdd090228f75b8/src/utilities/bsUtilities.ts
const cubicBezier = (
    t: number,
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    p3: Vector2,
): Vector2 => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    };
};

// Source: https://github.com/ManuelLovell/smoke/blob/87a5472f83d396060fe7b41e59fdd090228f75b8/src/utilities/bsUtilities.ts
const conicBezier = (
    t: number,
    p0: Vector2,
    p1: Vector2,
    p2: Vector2,
    w: number,
): Vector2 => {
    const u = 1 - t;
    const denom = u * u + 2 * u * t * w + t * t;
    return {
        x: (u * u * p0.x + 2 * u * t * w * p1.x + t * t * p2.x) / denom,
        y: (u * u * p0.y + 2 * u * t * w * p1.y + t * t * p2.y) / denom,
    };
};

const NUM_SEGMENTS = 10;
/**
 * @param commands Path commands.
 * @param startIdx Index that subpath starts at in command array.
 * @throws Error if the path command array is invalid.
 * @returns Points and index that next subpath starts at in command array.
 */
export function parseSubpath(
    commands: readonly PathCommand[],
    startIdx: number,
): [subpathPoints: Vector2[], index: number] {
    const firstCommand = commands[startIdx];
    if (!firstCommand || firstCommand[0] !== Command.MOVE) {
        throw Error("Invalid move command");
    }

    const points: Vector2[] = [];

    const firstPoint = { x: firstCommand[1], y: firstCommand[2] };
    points.push(firstPoint);

    let mostRecentPoint = firstPoint;
    for (let i = startIdx + 1; i < commands.length; i++) {
        const command = commands[i];
        if (!command) {
            throw Error("Commands array cannot be sparse");
        }
        switch (command[0]) {
            case Command.MOVE:
                // Next subpath starts here
                return [points, i];
            case Command.CLOSE:
                points.push(firstPoint);
                return [points, i + 1];
            case Command.LINE:
                mostRecentPoint = { x: command[1], y: command[2] };
                points.push(mostRecentPoint);
                break;
            case Command.QUAD: {
                const controlPoint = { x: command[1], y: command[2] };
                const quadEndPoint = { x: command[3], y: command[4] };
                for (let j = 1; j <= NUM_SEGMENTS; j++) {
                    const t = j / NUM_SEGMENTS;
                    points.push(
                        quadraticBezier(
                            t,
                            mostRecentPoint,
                            controlPoint,
                            quadEndPoint,
                        ),
                    );
                }
                mostRecentPoint = quadEndPoint;
                break;
            }
            case Command.CUBIC: {
                const controlPoint1 = { x: command[1], y: command[2] };
                const controlPoint2 = { x: command[3], y: command[4] };
                const cubicEndPoint = { x: command[5], y: command[6] };
                for (let j = 1; j <= NUM_SEGMENTS; j++) {
                    const t = j / NUM_SEGMENTS;
                    points.push(
                        cubicBezier(
                            t,
                            mostRecentPoint,
                            controlPoint1,
                            controlPoint2,
                            cubicEndPoint,
                        ),
                    );
                }
                mostRecentPoint = cubicEndPoint;
                break;
            }
            case Command.CONIC: {
                const controlPoint = { x: command[1], y: command[2] };
                const conicEndPoint = { x: command[3], y: command[4] };
                const w = command[5];
                for (let j = 1; j <= NUM_SEGMENTS; j++) {
                    const t = j / NUM_SEGMENTS;
                    points.push(
                        conicBezier(
                            t,
                            mostRecentPoint,
                            controlPoint,
                            conicEndPoint,
                            w,
                        ),
                    );
                }
                mostRecentPoint = conicEndPoint;
                break;
            }
        }
    }
    return [points, commands.length];
}
