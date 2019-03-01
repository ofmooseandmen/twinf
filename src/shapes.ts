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
export class GeoRelativePolygon {

    readonly type: ShapeType.GeoRelativePolygon = ShapeType.GeoRelativePolygon;
    readonly ref: LatLong
    readonly vertices: Array<Offset>

    // FIXME private?
    constructor(ref: LatLong, vertices: Array<Offset>) {
        this.ref = ref
        this.vertices = vertices
    }

    static new(ref: LatLong, vertices: Array<Offset>): GeoRelativePolygon {
        return new GeoRelativePolygon(ref, vertices)
    }

}

/**
 * Polyline whose points are latitude/longitude
 */
export class GeoPolyline {

    readonly type: ShapeType.GeoPolyline = ShapeType.GeoPolyline;
    readonly points: Array<LatLong>

    // FIXME private?
    constructor(points: Array<LatLong>) {
        this.points = points
    }

    static new(points: Array<LatLong>): GeoPolyline {
        return new GeoPolyline(points)
    }

}

/**
 * Polyline whose points are defined as pixels offsets from a reference
 * latitude/longitude.
 */
export class GeoRelativePolyline {

    readonly type: ShapeType.GeoRelativePolyline = ShapeType.GeoRelativePolyline;
    readonly ref: LatLong
    readonly points: Array<Offset>

    // FIXME private?
    constructor(ref: LatLong, points: Array<Offset>) {
        this.ref = ref
        this.points = points
    }

    static new(ref: LatLong, points: Array<Offset>): GeoRelativePolyline {
        return new GeoRelativePolyline(ref, points)
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
    GeoRelativePolyline,
}

export enum RenderableShapeType {
    WorldTriangles,
    WorldRelativeTriangles,
    WorldPolyline,
    WorldRelativePolyline,
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
export class WorldRelativeTriangles {

    readonly type: RenderableShapeType.WorldRelativeTriangles = RenderableShapeType.WorldRelativeTriangles;
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
export class WorldPolyline {

    readonly type: RenderableShapeType.WorldPolyline = RenderableShapeType.WorldPolyline;
    readonly points: Array<Vector2d>

    constructor(points: Array<Vector2d>) {
        this.points = points
    }

}

/**
 * Polyline whose points are defined as pixel offsets from a reference stereographic positions.
 */
export class WorldRelativePolyline {

    readonly type: RenderableShapeType.WorldRelativePolyline = RenderableShapeType.WorldRelativePolyline;
    readonly ref: Vector2d
    readonly points: Array<Vector2d>

    constructor(ref: Vector2d, points: Array<Vector2d>) {
        this.ref = ref
        this.points = points
    }

}

export type RenderableShape =
    WorldTriangles
    | WorldRelativeTriangles
    | WorldPolyline
    | WorldRelativePolyline

export const RenderableShape = {
    RenderableShapeType,
    WorldTriangles,
    WorldRelativeTriangles,
    WorldPolyline,
    WorldRelativePolyline,
}

export class ShapeConverter {

    private constructor() { }

    static toRenderableShape(s: Shape, sp: StereographicProjection): RenderableShape {
        switch (s.type) {
            case ShapeType.GeoCircle: return ShapeConverter.fromGeoCircle(s, sp)
            case ShapeType.GeoPolygon: return ShapeConverter.fromGeoPolygon(s, sp)
            case ShapeType.GeoPolyline: return ShapeConverter.fromGeoPolyline(s, sp)
            case ShapeType.GeoRelativePolyline: return ShapeConverter.fromGeoRelativePolyline(s, sp)
            case ShapeType.GeoRelativePolygon: return ShapeConverter.fromGeoRelativePolygon(s, sp)
        }
    }

    private static fromGeoCircle(c: GeoCircle, sp: StereographicProjection): RenderableShape {
        const vs = Geodetics.discretiseCircle(c.centre, c.radius, sp.earthRadius(), 100)
        const ts = Triangulator.SPHERICAL.triangulateSimple(vs)
            .map(t => ShapeConverter.toStereo(t, sp))
        return new WorldTriangles(ts)
    }

    private static fromGeoPolyline(l: GeoPolyline, sp: StereographicProjection): RenderableShape {
        const pts = l.points
            .map(CoordinateSystems.latLongToGeocentric)
            .map(g => CoordinateSystems.geocentricToStereographic(g, sp))
        return new WorldPolyline(pts)
    }

    private static fromGeoPolygon(p: GeoPolygon, sp: StereographicProjection): RenderableShape {
        const vs = Triangulator.SPHERICAL.triangulate(
            p.vertices.map(CoordinateSystems.latLongToGeocentric)
        ).map(t => ShapeConverter.toStereo(t, sp))
        return new WorldTriangles(vs)
    }

    private static fromGeoRelativePolyline(l: GeoRelativePolyline, sp: StereographicProjection): RenderableShape {
        const pts = l.points.map(p => new Vector2d(p.x, p.y))
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(l.ref), sp)
        return new WorldRelativePolyline(ref, pts)
    }

    private static fromGeoRelativePolygon(p: GeoRelativePolygon, sp: StereographicProjection): RenderableShape {
        const vs = Triangulator.PLANAR.triangulate(p.vertices.map(v => new Vector2d(v.x, v.y)))
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(p.ref), sp)
        return new WorldRelativeTriangles(ref, vs)
    }

    private static toStereo(t: Triangle<Vector3d>, sp: StereographicProjection): Triangle<Vector2d> {
        return new Triangle
            (CoordinateSystems.geocentricToStereographic(t.v1(), sp),
            CoordinateSystems.geocentricToStereographic(t.v2(), sp),
            CoordinateSystems.geocentricToStereographic(t.v3(), sp))
    }

}
