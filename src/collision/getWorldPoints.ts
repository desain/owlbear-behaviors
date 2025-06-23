import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    isWall,
    Math2,
    MathM,
    type Curve,
    type Image,
    type Item,
    type Line,
    type Path,
    type Shape,
    type ShapeType,
    type Vector2,
    type Wall,
} from "@owlbear-rodeo/sdk";
import { matrixMultiply, PI_6, type GridParams } from "owlbear-utils";
import simplify from "simplify-js";
import { parseSubpath } from "./bezierUtils";

export function getLineWorldPoints(line: Line): Vector2[] {
    const transform = MathM.fromItem(line);
    return [
        matrixMultiply(transform, line.startPosition),
        matrixMultiply(transform, line.endPosition),
    ];
}

/**
 * @param radius center to corner distance
 * @param angleOffset 0 for flat-top, pi/6 for pointy top
 */
function getHexagonPoints(radius: number, angleOffset = 0): Vector2[] {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = angleOffset + (Math.PI / 3) * i;
        return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
        };
    });
}

function getCurveWallWorldPoints(curve: Curve | Wall): Vector2[] {
    const transform = MathM.fromItem(curve);
    return curve.points.map((point) => matrixMultiply(transform, point));
}

type NonCircleShape = Shape & { shapeType: Exclude<ShapeType, "CIRCLE"> };
function isNonCircleShape(shape: Item): shape is NonCircleShape {
    return isShape(shape) && shape.shapeType !== "CIRCLE";
}

function getShapeWorldPoints(shape: NonCircleShape): Vector2[] {
    let points: Vector2[];
    switch (shape.shapeType) {
        case "RECTANGLE":
            points = [
                { x: 0, y: 0 }, // top left
                { x: shape.width, y: 0 }, // top right
                { x: shape.width, y: shape.height }, // bottom right
                { x: 0, y: shape.height }, // bottom left
            ];
            break;
        case "HEXAGON":
            points = getHexagonPoints(
                Math.max(shape.width, shape.height) / 2,
                PI_6,
            );
            break;
        case "TRIANGLE":
            points = [
                { x: 0, y: 0 }, // top
                { x: -shape.height / 2, y: shape.height }, // bottom left
                { x: shape.height / 2, y: shape.height }, // bottom right
            ];
            break;
    }
    const transform = MathM.fromItem(shape);
    return points.map((point) => matrixMultiply(transform, point));
}

/**
 * @returns Points tracing the bounding box for an image.
 *          Does not return a closed polygon.
 */
function getImageWorldPoints(item: Image, grid: GridParams): Vector2[] {
    const transform = MathM.fromItem(item);

    const dpiScaling = grid.dpi / item.grid.dpi;
    return [
        { x: 0, y: 0 }, // top left
        { x: 0, y: item.image.height }, // bottom left
        { x: item.image.width, y: item.image.height }, // bottom right
        { x: item.image.width, y: 0 }, // top right
    ].map((point) =>
        matrixMultiply(
            transform,
            Math2.multiply(Math2.subtract(point, item.grid.offset), dpiScaling),
        ),
    );
}

function getPathWorldPoints(path: Path): Vector2[][] {
    const lineStrings: Vector2[][] = [];
    let idx = 0;
    while (idx < path.commands.length) {
        const [points, newIdx] = parseSubpath(path.commands, idx);
        lineStrings.push(points);
        idx = newIdx;
    }

    const transform = MathM.fromItem(path);
    return lineStrings.map((lineString) =>
        simplify(lineString, 5.0).map((point) =>
            matrixMultiply(transform, point),
        ),
    );
}

type WorldPointsItem = Line | NonCircleShape | Curve | Path | Wall | Image;
export function isWorldPointsItem(item: Item): item is WorldPointsItem {
    return (
        isLine(item) ||
        isNonCircleShape(item) ||
        isCurve(item) ||
        isPath(item) ||
        isWall(item) ||
        isImage(item)
    );
}

export function getWorldPoints(
    item: WorldPointsItem,
    grid: GridParams,
): Vector2[] {
    if (isLine(item)) {
        return getLineWorldPoints(item);
    } else if (isImage(item)) {
        return getImageWorldPoints(item, grid);
    } else if (isCurve(item) || isWall(item)) {
        return getCurveWallWorldPoints(item);
    } else if (isPath(item)) {
        return getPathWorldPoints(item).flat();
    } else {
        return getShapeWorldPoints(item);
    }
}
