import { LatLong } from "./latlong"
import { Vector2d } from "./space2d"

export enum ShapeType {
    GeoCircle,
    GeoPolygon,
    GeoRelativePolygon,
    GeoPolyline,
    GeoRelativePolyline,
}

/**
 * Circle whose centre is defined by latitude/longitude.
 */
export class GeoCircle {

    readonly type: ShapeType.GeoCircle = ShapeType.GeoCircle;
    readonly centre: LatLong
    readonly radius: number // FIXME Length

    constructor(centre: LatLong, radius: number) {
        this.centre = centre
        this.radius = radius
    }

}

/**
 * Polygon whose vertices are latitude/longitude.
 */
export class GeoPolygon {

    readonly type: ShapeType.GeoPolygon = ShapeType.GeoPolygon;
    readonly vertices: Array<LatLong>

    constructor(vertices: Array<LatLong>) {
        this.vertices = vertices
    }

}

/**
 * Polygon whose vertices are defined as pixels offsets from a reference
 * latitude/longitude.
 *
 * Offset is in pixels (x axis is down and y axis is right).
 */
export class GeoRelativePolygon {

    readonly type: ShapeType.GeoRelativePolygon = ShapeType.GeoRelativePolygon;
    readonly ref: LatLong
    readonly vertices: Array<Vector2d>

    constructor(ref: LatLong, vertices: Array<Vector2d>) {
        this.ref = ref
        this.vertices = vertices
    }

}

/**
 * Polyline whose points are latitude/longitude
 */
export class GeoPolyline {

    readonly type: ShapeType.GeoPolyline = ShapeType.GeoPolyline;
    readonly points: Array<LatLong>

    constructor(points: Array<LatLong>) {
        this.points = points
    }

}

/**
 * Polyline whose points are defined as pixels offsets from a reference
 * latitude/longitude.
 *
 * Offset is in pixels (x axis is down and y axis is right).
 */
export class GeoRelativePolyline {

    readonly type: ShapeType.GeoRelativePolyline = ShapeType.GeoRelativePolyline;
    readonly ref: LatLong
    readonly points: Array<Vector2d>

    constructor(ref: LatLong, points: Array<Vector2d>) {
        this.ref = ref
        this.points = points
    }

}

/**
 * Sum type of every supported shape.
 */
export type Shape =
    GeoCircle
    | GeoPolygon
    | GeoRelativePolygon
    | GeoPolyline
    | GeoRelativePolyline

export const Shape = {
    ShapeType,
    GeoCircle,
    GeoPolygon,
    GeoRelativePolygon,
    GeoPolyline,
    GeoRelativePolyline
}
