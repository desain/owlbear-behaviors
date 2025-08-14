declare module "polygon-offset" {
    import type { Polygon, Position } from "martinez-polygon-clipping";
    // Result will be array of linear rings.
    export default class Offset {
        constructor();
        arcSegments(segments: number): this;
        data(pts: Position[]): this;
        margin(radius: number): Polygon;
        offsetLine(radius: number): Polygon;
    }
}
