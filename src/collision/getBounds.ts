import {
    isCurve,
    isImage,
    isLine,
    isPath,
    isShape,
    isWall,
    Math2,
    MathM,
    type BoundingBox,
    type Curve,
    type Image,
    type Item,
    type Line,
    type Path,
    type Shape,
    type Wall,
} from "@owlbear-rodeo/sdk";
import { assertItem, matrixMultiply, type GridParams } from "owlbear-utils";
import { getWorldPoints, isWorldPointsItem } from "./getWorldPoints";

type BoundableItem = Image | Shape | Line | Curve | Path | Wall;
export function isBoundableItem(item: Item): item is BoundableItem {
    return (
        isImage(item) ||
        isShape(item) ||
        isLine(item) ||
        isCurve(item) ||
        isPath(item) ||
        isWall(item)
    );
}

export interface Circle extends Shape {
    shapeType: "CIRCLE";
}
export function isCircle(item: Item): item is Circle {
    return isShape(item) && item.shapeType === "CIRCLE";
}

function getCircleBounds(circle: Circle): BoundingBox {
    const transform = MathM.fromItem(circle);

    const halfWidth = circle.width / 2;
    const halfHeight = circle.height / 2;
    const points = [
        { x: -halfWidth, y: -halfHeight }, // top left
        { x: -halfWidth, y: halfHeight }, // bottom left
        { x: halfWidth, y: halfHeight }, // bottom right
        { x: halfWidth, y: -halfHeight }, // top right
    ].map((point) => matrixMultiply(transform, point));

    return Math2.boundingBox(points);
}

export function getBounds(item: BoundableItem, grid: GridParams): BoundingBox {
    if (isWorldPointsItem(item)) {
        return Math2.boundingBox(getWorldPoints(item, grid));
    } else {
        // circle
        assertItem(item, isCircle);
        return getCircleBounds(item);
    }
}
