import { CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { LatLong } from "./latlong"
import { Geodetics } from "./geodetics"
import { Triangle, Triangulator } from "./triangles"
import { Vector2d } from "./space2d"
import { Vector3d } from "./space3d"

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
 *
 * Offset is in pixels (x axis is down and y axis is right).
 */
export class GeoRelativePolygon {

    readonly type: ShapeType.GeoRelativePolygon = ShapeType.GeoRelativePolygon;
    readonly ref: LatLong
    readonly vertices: Array<Vector2d>

    // FIXME private?
    constructor(ref: LatLong, vertices: Array<Vector2d>) {
        this.ref = ref
        this.vertices = vertices
    }

    static new(ref: LatLong, vertices: Array<Vector2d>): GeoRelativePolygon {
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
 *
 * Offset is in pixels (x axis is down and y axis is right).
 */
export class GeoRelativePolyline {

    readonly type: ShapeType.GeoRelativePolyline = ShapeType.GeoRelativePolyline;
    readonly ref: LatLong
    readonly points: Array<Vector2d>

    // FIXME private?
    constructor(ref: LatLong, points: Array<Vector2d>) {
        this.ref = ref
        this.points = points
    }

    static new(ref: LatLong, points: Array<Vector2d>): GeoRelativePolyline {
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
    GeoRelativePolyline
}

/**
 * A point in space with additional attributes.
 */
export class Vertex<T> {

    private readonly _position: T
    private readonly _offset: Vector2d

    constructor(position: T, offset: Vector2d) {
        this._position = position
        this._offset = offset
    }

    /**
     * Position of this vertex.
     */
    position(): T {
        return this._position
    }

    /**
     * Offset in pixels from the position.
     *
     * The vertex shall be rendered at position (transformed in pixels) + offset
     */
    offset(): Vector2d {
        return this._offset
    }


}

export enum RenderableShapeType {
    StereoPolygon,
    StereoPolyline,
}

/**
 * A renderable shape representing a polygon described by a set of triangles
 * whose vertices are stereographic position (with or without offset)
 */
export class StereoPolygon {

    readonly type: RenderableShapeType.StereoPolygon = RenderableShapeType.StereoPolygon;
    readonly triangles: Array<Triangle<Vertex<Vector2d>>>

    constructor(triangles: Array<Triangle<Vertex<Vector2d>>>) {
        this.triangles = triangles
    }

}

/**
 * A renderable shape representing a polyline whose points are
 * are stereographic positions (with or without offset)
 */
export class StereoPolyline {

    readonly type: RenderableShapeType.StereoPolyline = RenderableShapeType.StereoPolyline;
    readonly points: Array<Vertex<Vector2d>>

    constructor(points: Array<Vertex<Vector2d>>) {
        this.points = points
    }

}

export type RenderableShape =
    StereoPolyline
    | StereoPolygon

export const RenderableShape = {
    RenderableShapeType,
    StereoPolyline,
    StereoPolygon
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
        return new StereoPolygon(ts)
    }

    private static fromGeoPolyline(l: GeoPolyline, sp: StereographicProjection): RenderableShape {
        const vs = l.points
            .map(CoordinateSystems.latLongToGeocentric)
            .map(g => CoordinateSystems.geocentricToStereographic(g, sp))
            .map(p => new Vertex(p, Vector2d.ZERO))
        return new StereoPolyline(vs)
    }

    private static fromGeoPolygon(p: GeoPolygon, sp: StereographicProjection): RenderableShape {
        const vs = Triangulator.SPHERICAL.triangulate(
            p.vertices.map(CoordinateSystems.latLongToGeocentric)
        ).map(t => ShapeConverter.toStereo(t, sp))
        return new StereoPolygon(vs)
    }

    private static fromGeoRelativePolyline(l: GeoRelativePolyline, sp: StereographicProjection): RenderableShape {
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(l.ref), sp)
        const vs = l.points.map(p => new Vertex(ref, p))
        return new StereoPolyline(vs)
    }

    private static fromGeoRelativePolygon(p: GeoRelativePolygon, sp: StereographicProjection): RenderableShape {
        const ref = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(p.ref), sp)
        const vs = Triangulator.PLANAR.triangulate(p.vertices)
            .map(t => new Triangle(
                new Vertex(ref, t.v1()),
                new Vertex(ref, t.v2()),
                new Vertex(ref, t.v3())
            ))
        return new StereoPolygon(vs)
    }

    private static toStereo(t: Triangle<Vector3d>, sp: StereographicProjection): Triangle<Vertex<Vector2d>> {
        return new Triangle(
            new Vertex(CoordinateSystems.geocentricToStereographic(t.v1(), sp), Vector2d.ZERO),
            new Vertex(CoordinateSystems.geocentricToStereographic(t.v2(), sp), Vector2d.ZERO),
            new Vertex(CoordinateSystems.geocentricToStereographic(t.v3(), sp), Vector2d.ZERO)
        )
    }

}
