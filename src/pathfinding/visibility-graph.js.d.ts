declare module "visibility-graph.js" {
    import type { Feature, MultiPolygon, Point } from "geojson";
    import type { Graph } from "ngraph.graph";

    export default class VisibilityGraph {
        constructor(polygons: Feature<MultiPolygon>);
        addStartAndEndPointsToGraph(
            start: Feature<Point>,
            end: Feature<Point>,
        ): {
            startNode: { nodeId: number };
            endNode: { nodeId: number };
        };
        _points: { x: number; y: number }[];
        graph: Graph<{ x: number; y: number }, undefined>;
    }
}
