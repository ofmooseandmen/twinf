import { CoordinateSystems } from "./coordinate-systems"
import { Colour } from "./colour"
import { Geodetics } from "./geodetics"
import { LatLong } from "./latlong"
import { Length } from "./length"
import * as S from "./shape"
import { Triangle } from "./triangle"
import { Triangulator } from "./triangulation"
import { Geometry2d, Vector2d } from "./space2d"
import { Vector3d } from "./space3d"

export enum DrawMode {
    LINES,
    TRIANGLES
}

/**
 * A mesh is defined by geocentric positions, offsets, colours and a draw mode.
 */
export class Mesh {

    private readonly _geos: Array<number>
    private readonly _offsets: Array<number>
    private readonly _colours: Array<number>
    private readonly _drawMode: DrawMode

    constructor(geos: Array<number>, offsets: Array<number>,
        colours: Array<number>, drawMode: DrawMode) {
        this._geos = geos
        this._offsets = offsets
        this._colours = colours
        this._drawMode = drawMode
    }

    /**
     * Array of geocentric vertices (3 components each) or empty. If not empty
     * this determines the number of indices to be rendered. If empty the VBO must
     * be disabled.
     */
    geos(): Array<number> {
        return this._geos
    }

    /**
     * Array of offsets vertices (2 components each) or empty. If geos is empty
     * this determines the number of indices to be rendered. If empty the VBO must
     * be disabled.
     */
    offsets(): Array<number> {
        return this._offsets
    }

    /**
     * Array of colours (1 component each), never empty.
     */
    colours(): Array<number> {
        return this._colours
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

}

export class MeshGenerator {

    private constructor() { }

    static mesh(s: S.Shape, earthRadius: Length): Array<Mesh> {
        switch (s.type) {
            case S.ShapeType.GeoCircle: return MeshGenerator.fromGeoCircle(s, earthRadius)
            case S.ShapeType.GeoPolygon: return MeshGenerator.fromGeoPolygon(s)
            case S.ShapeType.GeoPolyline: return MeshGenerator.fromGeoPolyline(s)
            case S.ShapeType.GeoRelativeCircle: return MeshGenerator.fromGeoRelativeCircle(s)
            case S.ShapeType.GeoRelativePolygon: return MeshGenerator.fromGeoRelativePoygon(s)
            case S.ShapeType.GeoRelativePolyline: return MeshGenerator.fromGeoRelativePoyline(s)
        }
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: Length): Array<Mesh> {
        const gs = Geodetics.discretiseCircle(c.centre(), c.radius(), earthRadius, 100)
        const paint = c.paint()
        return MeshGenerator._fromGeoPolygon(gs, paint)
    }

    private static fromGeoPolyline(l: S.GeoPolyline): Array<Mesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        const vs = MeshGenerator.geoPointsToArray(gs, false)
        const cs = MeshGenerator.colours(l.stroke().colour(), vs, 3)
        return [new Mesh(vs, [], cs, DrawMode.LINES)]
    }

    private static fromGeoPolygon(p: S.GeoPolygon): Array<Mesh> {
        const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric)
        const paint = p.paint()
        return MeshGenerator._fromGeoPolygon(gs, paint)
    }

    private static _fromGeoPolygon(gs: Array<Vector3d>, paint: S.Paint): Array<Mesh> {
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (fill !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = MeshGenerator.geoTrianglesToArray(ts)
            const cs = MeshGenerator.colours(fill, vs, 3)
            res.push(new Mesh(vs, [], cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            const vs = MeshGenerator.geoPointsToArray(gs, true)
            const cs = MeshGenerator.colours(stroke.colour(), vs, 3)
            res.push(new Mesh(vs, [], cs, DrawMode.LINES))
        }
        return res
    }

    private static fromGeoRelativeCircle(c: S.GeoRelativeCircle): Array<Mesh> {
        const ref = c.centreRef()
        const ps = Geometry2d.discretiseCircle(c.centreOffset(), c.radius(), 100)
        const paint = c.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint)
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon): Array<Mesh> {
        const ref = p.ref()
        const ps = p.vertices()
        const paint = p.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint)
    }

    private static _fromGeoRelativePoygon(ref: LatLong, vertices: Array<Vector2d>, paint: S.Paint): Array<Mesh> {
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (fill !== undefined) {
            const ts = Triangulator.PLANAR.triangulate(vertices)
            const os = MeshGenerator.offsetTrianglesToArray(ts)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = MeshGenerator.colours(fill, os, 2)
            res.push(new Mesh(vs, os, cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            res.push(MeshGenerator._fromGeoRelativePoyline(ref, vertices, stroke, true))
        }
        return res
    }

    private static fromGeoRelativePoyline(l: S.GeoRelativePolyline): Array<Mesh> {
        return [MeshGenerator._fromGeoRelativePoyline(l.ref(), l.points(), l.stroke(), false)]
    }

    private static _fromGeoRelativePoyline(ref: LatLong, points: Array<Vector2d>,
        stroke: S.Stroke, close: boolean): Mesh {
        if (stroke.width() === 1) {
            const os = MeshGenerator.offsetPointsToArray(points, close)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = MeshGenerator.colours(stroke.colour(), os, 2)
            return new Mesh(vs, os, cs, DrawMode.LINES)
        }
        let pts: Array<Vector2d>
        if (close) {
            pts = points.slice(0)
            pts.push(pts[0])
        } else {
            pts = points
        }
        const ts = Geometry2d.extrude(pts, stroke.width())
        const os = MeshGenerator.offsetTrianglesToArray(ts)
        const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
        const cs = MeshGenerator.colours(stroke.colour(), os, 2)
        return new Mesh(vs, os, cs, DrawMode.TRIANGLES)
    }


    private static geoTrianglesToArray(ts: Array<Triangle<Vector3d>>): Array<number> {
        let res = new Array<number>()
        const len = ts.length
        for (let i = 0; i < len; i++) {
            const t = ts[i];
            res.push(t.v1().x(), t.v1().y(), t.v1().z(),
                t.v2().x(), t.v2().y(), t.v2().z(),
                t.v3().x(), t.v3().y(), t.v3().z())
        }
        return res
    }

    private static offsetTrianglesToArray(ts: Array<Triangle<Vector2d>>): Array<number> {
        let res = new Array<number>()
        const len = ts.length
        for (let i = 0; i < len; i++) {
            const t = ts[i];
            res.push(t.v1().x(), t.v1().y(),
                t.v2().x(), t.v2().y(),
                t.v3().x(), t.v3().y())
        }
        return res
    }

    private static geoPointsToArray(ps: Array<Vector3d>, close: boolean): Array<number> {
        /*
         * since we draw with LINES we need to repeat each intermediate point.
         * drawing with LINE_STRIP would not require this but would not allow
         * to draw multiple polylines at once.
         */
        let res = new Array<number>()
        const len = ps.length
        const last = len - 1
        for (let i = 0; i < len; i++) {
            const p = ps[i]
            res.push(p.x(), p.y(), p.z())
            if (i !== 0 && i !== last) {
                res.push(p.x(), p.y(), p.z())
            }
        }
        if (close) {
            res.push(ps[last].x(), ps[last].y(), ps[last].z())
            res.push(ps[0].x(), ps[0].y(), ps[0].z())
        }
        return res
    }

    private static offsetPointsToArray(ps: Array<Vector2d>, close: boolean): Array<number> {
        /*
         * since we draw with LINES we need to repeat each intermediate point.
         * drawing with LINE_STRIP would not require this but would not allow
         * to draw multiple polylines at once.
         */
        let res = new Array<number>()
        const len = ps.length
        const last = len - 1
        for (let i = 0; i < len; i++) {
            const p = ps[i]
            res.push(p.x(), p.y())
            if (i !== 0 && i !== last) {
                res.push(p.x(), p.y())
            }
        }
        if (close) {
            res.push(ps[last].x(), ps[last].y())
            res.push(ps[0].x(), ps[0].y())
        }
        return res
    }

    /** vs is array of vertices, n is number of component per vertex. */
    private static colours(colour: Colour, vs: Array<number>, n: number): Array<number> {
        const rgba = colour.rgba()
        const len = vs.length / n
        return new Array(len).fill(rgba)
    }

    private static reference(v: Vector3d, offsets: Array<number>): Array<number> {
        const n = offsets.length / 2
        let arr = new Array<number>()
        for (let i = 0; i < n; i++) {
            arr.push(v.x(), v.y(), v.z())
        }
        return arr
    }

}
