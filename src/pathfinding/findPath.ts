import { Math2, type Vector2 } from "@owlbear-rodeo/sdk";
import { lineIntersect } from "@turf/line-intersect";
import type { Position } from "geojson";
import * as martinez from "martinez-polygon-clipping";
import type { Node } from "ngraph.graph";
import { nba } from "ngraph.path";
import {
    toPosition,
    toVector2Unchecked,
    type Position as Position2,
} from "owlbear-utils";
import Offset from "polygon-offset";
import simplify from "simplify-js";
import VisibilityGraph from "visibility-graph.js";

function toXY(points: Vector2[]): Position2[] {
    return points.map(toPosition);
}

function fromXY(positions: Position[]): Vector2[] {
    return positions.map(toVector2Unchecked);
}

function inflateAndUnion(
    walls: Vector2[][],
    radius: number,
    arcSegments = 3,
): martinez.MultiPolygon | null {
    const unioned = walls
        .map(toXY)
        .map((wall) =>
            new Offset().arcSegments(arcSegments).data(wall).offsetLine(radius),
        )
        .map((w) =>
            w
                .map(fromXY)
                .map((r) => simplify(r, 5))
                .map(toXY),
        )
        .reduce(
            (accum: martinez.Geometry | null, inflated: martinez.Geometry) =>
                accum === null ? inflated : martinez.union(accum, inflated),
            null,
        );

    return unioned === null
        ? null
        : Array.isArray(unioned[0]![0]![0])
        ? (unioned as martinez.MultiPolygon)
        : [unioned as martinez.Polygon];
}

export function findPath(
    walls: Vector2[][],
    start: Vector2,
    end: Vector2,
    radius: number,
): Vector2[] | null {
    const unioned = inflateAndUnion(walls, radius);

    if (!unioned || unioned.length === 0) {
        return [start, end];
    }

    // visibility-graph.js has a bug where it won't check if the start and
    // end points are visible from each other, so check that manually.
    const straightLineString = {
        type: "LineString" as const,
        coordinates: [
            [start.x, start.y],
            [end.x, end.y],
        ],
    };
    const blocked =
        lineIntersect(straightLineString, {
            type: "MultiPolygon",
            coordinates: unioned,
        }).features.length != 0;
    if (!blocked) {
        return [start, end];
    }

    // for (const poly of unioned) {
    //     for (const ring of poly.map(fromXY)) {
    //         debugLineString(ring);
    //     }
    // }

    // https://www.npmjs.com/package/visibility-graph.js
    // alternate: https://www.npmjs.com/package/visibility-polygon
    const visibilityGraph = new VisibilityGraph({
        type: "Feature",
        geometry: {
            type: "MultiPolygon",
            coordinates: unioned,
        },
        properties: {},
    });

    // Use visibility graph to
    const { startNode, endNode } = visibilityGraph.addStartAndEndPointsToGraph(
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [start.x, start.y],
            },
            properties: {},
        },
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [end.x, end.y],
            },
            properties: {},
        },
    );

    // https://github.com/anvaka/ngraph.path
    const finder = nba<Vector2, undefined>(visibilityGraph.graph, {
        heuristic: (from, to) => Math2.distance(from.data, to.data),
        distance: (from: Node<Vector2>, to: Node<Vector2>) =>
            Math2.distance(from.data, to.data),
    });

    const path = finder
        .find(startNode.nodeId, endNode.nodeId)
        .map((node) => node.data);

    if (path.length < 2) {
        return null;
    } else {
        return path;
    }
}
