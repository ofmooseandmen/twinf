import { CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { LatLong } from "./latlong"
import { Geodetics } from "./geodetics"
import { Triangle, Triangulator } from "./triangles"
import { Vector2d } from "./space2d"
import { Vector3d } from "./space3d"

/**
 * Offset in pixels (x axis is down and y axis is right).
 */
export class Offset {

    readonly x: number
    readonly y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

export enum ShapeType {
    GeoCircle,
    GeoPolygon,
    RelativeGeoPolygon,
    GeoLine,
    RelativeGeoLine,
}

/**
 * Circle whose centre is defined by latitude/longitude.
 */
export class GeoCircle {

    readonly type: ShapeType.GeoCircle = ShapeType.GeoCircle;
    readonly centre: LatLong
    readonly radius: number // FIXME Length

    // FIXME private?
    constructor(centre: LatLong, radius: number) {
        this.centre = centre
        this.radius = radius
    }

    static new(centre: LatLong, radius: number): GeoCircle {
        return new GeoCircle(centre, radius)
    }

}

/**
 * Polygon whose vertices are latitude/longitude.
 */
export class GeoPolygon {

    readonly type: ShapeType.GeoPolygon = ShapeType.GeoPolygon;
    readonly vertices: Array<LatLong>

    // FIXME private?
    constructor(vertices: Array<LatLong>) {
        this.vertices = vertices
    }

    static new(vertices: Array<LatLong>): GeoPolygon {
        return new GeoPolygon(vertices)
    }

}

/**
 * Polygon whose vertices are defined as pixels offsets from a reference
 * latitude/longitude.
 */
export class RelativeGeoPolygon {

    readonly type: ShapeType.RelativeGeoPolygon = ShapeType.RelativeGeoPolygon;
    readonly ref: LatLong
    readonly vertices: Array<Offset>

    // FIXME private?
    constructor(ref: LatLong, vertices: Array<Offset>) {
        this.ref = ref
        this.vertices = vertices
    }

    static new(ref: LatLong, vertices: Array<Offset>): RelativeGeoPolygon {
        return new RelativeGeoPolygon(ref, vertices)
    }

}

/**
 * Line whose points are latitude/longitude
 */
export class GeoLine {

    readonly type: ShapeType.GeoLine = ShapeType.GeoLine;
    readonly points: Array<LatLong>

    // FIXME private?
    constructor(points: Array<LatLong>) {
        this.points = points
    }

    static new(points: Array<LatLong>): GeoLine {
        return new GeoLine(points)
    }

}

/**
 * Line whose points are defined as pixels offsets from a reference
 * latitude/longitude.
 */
export class RelativeGeoLine {

    readonly type: ShapeType.RelativeGeoLine = ShapeType.RelativeGeoLine;
    readonly ref: LatLong
    readonly points: Array<Offset>

    // FIXME private?
    constructor(ref: LatLong, points: Array<Offset>) {
        this.ref = ref
        this.points = points
    }

    static new(ref: LatLong, points: Array<Offset>): RelativeGeoLine {
        return new RelativeGeoLine(ref, points)
    }

}

/**
 * Sum type of every supported shape.
 */
export type Shape =
    GeoCircle
    | GeoPolygon
    | RelativeGeoPolygon
    | GeoLine
    | RelativeGeoLine

export const Shape = {
    ShapeType,
    GeoCircle,
    GeoPolygon,
    RelativeGeoPolygon,
    GeoLine,
    RelativeGeoLine,
}

export enum RenderableShapeType {
    WorldTriangles,
    RelativeWorldTriangles,
    WorldLine,
    RelativeWorldLine,
}

/**
 * Triangles whose vertices are stereographic positions.
 */
export class WorldTriangles {

    readonly type: RenderableShapeType.WorldTriangles = RenderableShapeType.WorldTriangles;
    readonly triangles: Array<Triangle<Vector2d>>

    constructor(triangles: Array<Triangle<Vector2d>>) {
        this.triangles = triangles
    }

}

/**
 * Triangles whose vertices are defined as pixel offsets from a reference stereographic positions.
 */
export class RelativeWorldTriangles {

    readonly type: RenderableShapeType.RelativeWorldTriangles = RenderableShapeType.RelativeWorldTriangles;
    readonly ref: Vector2d
    readonly triangles: Array<Triangle<Vector2d>>

    constructor(ref: Vector2d, triangles: Array<Triangle<Vector2d>>) {
        this.ref = ref
        this.triangles = triangles
    }

}

/**
 * Line whose points are stereographic positions.
 */
export class WorldLine {

    readonly type: RenderableShapeType.WorldLine = RenderableShapeType.WorldLine;
    readonly points: Array<Vector2d>

    constructor(points: Array<Vector2d>) {
        this.points = points
    }

}

/**
 * Line whose points are defined as pixel offsets from a reference stereographic positions.
 */
export class RelativeWorldLine {

    readonly type: RenderableShapeType.RelativeWorldLine = RenderableShapeType.RelativeWorldLine;
    readonly ref: Vector2d
    readonly points: Array<Vector2d>

    constructor(ref: Vector2d, points: Array<Vector2d>) {
        this.ref = ref
        this.points = points
    }

}

export type RenderableShape =
    WorldTriangles
    | RelativeWorldTriangles
    | WorldLine
    | RelativeWorldLine

export const RenderableShape = {
    RenderableShapeType,
    WorldTriangles,
    RelativeWorldTriangles,
    WorldLine,
    RelativeWorldLine,
}

export class ShapeConverter {

    private constructor() { }

    static toRenderableShape(s: Shape, sp: StereographicProjection): RenderableShape {
        switch (s.type) {
            case ShapeType.GeoCircle: return ShapeConverter.fromGeoCircle(s, sp)
            case ShapeType.GeoPolygon: return ShapeConverter.fromGeoPolygon(s, sp)
            case ShapeType.GeoLine: return ShapeConverter.fromGeoLine(s, sp)
            case ShapeType.RelativeGeoLine: return ShapeConverter.fromRelativeGeoLine(s, sp)
            case ShapeType.RelativeGeoPolygon: return ShapeConverter.fromRelativeGeoPolygon(s, sp)
        }
    }

    private static fromGeoCircle(c: GeoCircle, sp: StereographicProjection): RenderableShape {
        const vs = Geodetics.discretiseCircle(c.centre, c.radius, sp.earthRadius(), 100)
        const ts = Triangulator.SPHERICAL.triangulateSimple(vs)
            .map(t => ShapeConverter.toStereo(t, sp))
        return new WorldTriangles(ts)
    }

    private static fromGeoLine(l: GeoLine, sp: StereographicProjection): RenderableShape {
        const pts = l.points
            .map(CoordinateSystems.latLongToGeocentric)
            .map(g => CoordinateSystems.geocentricToStereographic(g, sp))
        return new WorldLine(pts)
    }

    private static fromGeoPolygon(p: GeoPolygon, sp: StereographicProjection): RenderableShape {
        const vs = Triangulator.SPHERICAL.triangulate(
            p.vertices.map(CoordinateSystems.latLongToGeocentric)
        ).map(t => ShapeConverter.toStereo(t, sp))
        return new WorldTriangles(vs)
    }

    private static fromRelativeGeoLine(l: RelativeGeoLine, sp: StereographicProjection): RenderableShape {
        const pts = l.points.map(p => new Vector2d(p.x, p.y))
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(l.ref), sp)
        return new RelativeWorldLine(ref, pts)
    }

    private static fromRelativeGeoPolygon(p: RelativeGeoPolygon, sp: StereographicProjection): RenderableShape {
        const vs = Triangulator.PLANAR.triangulate(p.vertices.map(v => new Vector2d(v.x, v.y)))
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(p.ref), sp)
        return new RelativeWorldTriangles(ref, vs)
    }

    private static toStereo(t: Triangle<Vector3d>, sp: StereographicProjection): Triangle<Vector2d> {
        return new Triangle
            (CoordinateSystems.geocentricToStereographic(t.v1(), sp),
            CoordinateSystems.geocentricToStereographic(t.v2(), sp),
            CoordinateSystems.geocentricToStereographic(t.v3(), sp))
    }

}
