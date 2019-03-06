import { CoordinateSystems } from "./coordinate-systems"
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

export enum DrawMode {
    LINES,
    TRIANGLES
}

/**
 * A shape defined by vertices in the geocentric coordinate system and offsets.
 */
export class GeoShape {

    private readonly _vertices: Array<number>
    private readonly _drawMode: DrawMode

    constructor(vertices: Array<number>, drawMode: DrawMode) {
        this._vertices = vertices
        this._drawMode = drawMode
    }

    vertices(): Array<number> {
        return this._vertices
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

}

export class ShapeConverter {

    private constructor() { }

    static toRenderableShape(s: Shape, earthRadius: number): GeoShape {
        switch (s.type) {
            case ShapeType.GeoCircle: return ShapeConverter.fromGeoCircle(s, earthRadius)
            case ShapeType.GeoPolygon: return ShapeConverter.fromGeoPolygon(s)
            case ShapeType.GeoPolyline: return ShapeConverter.fromGeoPolyline(s)
            default: throw new Error("Unsupported yet")
        }
    }

    private static fromGeoCircle(c: GeoCircle, earthRadius: number): GeoShape {
        const ts = Triangulator.SPHERICAL.triangulate(
            Geodetics.discretiseCircle(c.centre, c.radius, earthRadius, 100))
        const vs = ShapeConverter.geoTrianglesToArray(ts)
        return new GeoShape(vs, DrawMode.TRIANGLES)
    }

    private static fromGeoPolyline(l: GeoPolyline): GeoShape {
        const gs = l.points.map(CoordinateSystems.latLongToGeocentric)
        const vs = ShapeConverter.geoPointsToArray(gs)
        return new GeoShape(vs, DrawMode.LINES)
    }

    private static fromGeoPolygon(p: GeoPolygon): GeoShape {
        const ts = Triangulator.SPHERICAL.triangulate(
            p.vertices.map(CoordinateSystems.latLongToGeocentric))
        const vs = ShapeConverter.geoTrianglesToArray(ts)
        return new GeoShape(vs, DrawMode.TRIANGLES)
    }

    private static geoTrianglesToArray(ts: Array<Triangle<Vector3d>>): Array<number> {
        // FIMXE: pass length to array
        let res = new Array<number>()
        ts.forEach(t =>
            res.push(t.v1().x(), t.v1().y(), t.v1().z(),
                t.v2().x(), t.v2().y(), t.v2().z(),
                t.v3().x(), t.v3().y(), t.v3().z())
        )
        return res
    }

    private static geoPointsToArray(ps: Array<Vector3d>): Array<number> {
        /*
         * since we draw with LINES we need to repeat each intermediate point.
         * drawing with LINE_STRIP would not require this but would not allow
         * to draw multiple polyline at once.
         */
        // FIMXE: pass length to array
        let res = new Array<number>()
        const last = ps.length - 1
        ps.forEach((p, i) => {
            res.push(p.x(), p.y(), p.z())
            if (i !== 0 && i !== last) {
                res.push(p.x(), p.y(), p.z())
            }
        })
        return res
    }

}
