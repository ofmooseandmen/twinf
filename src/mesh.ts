import { CoordinateSystems } from "./coordinate-systems"
import { Colour } from "./colour"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { RenderingOptions } from "./options"
import * as S from "./shapes"
import { Geometry2d, Vector2d } from "./space2d"
import { Geometry3d, Vector3d } from "./space3d"
import { Triangle } from "./triangle"
import { Triangulator } from "./triangulation"

export enum DrawMode {
    LINES,
    TRIANGLES
}

/**
 * Provides previous positions, next positions and signed half-width
 * to be used by the vertex shader to extrude geocentric positions when
 * drawing wide lines.
 */
export class Extrusion {

    private readonly _prevGeos: Array<number>
    private readonly _nextGeos: Array<number>
    private readonly _halfWidths: Array<number>

    constructor(prevGeos: Array<number>, nextGeos: Array<number>,
        halfWidths: Array<number>) {
        this._prevGeos = prevGeos
        this._nextGeos = nextGeos
        this._halfWidths = halfWidths
    }

    prevGeos(): Array<number> {
        return this._prevGeos
    }

    nextGeos(): Array<number> {
        return this._nextGeos
    }

    halfWidths(): Array<number> {
        return this._halfWidths
    }

}

/**
 * A mesh is defined by geocentric positions, extrusion, offsets, colours and a draw mode.
 */
export class Mesh {

    private readonly _geos: Array<number>
    private readonly _extrusion: Extrusion | undefined
    private readonly _offsets: Array<number>
    private readonly _colours: Array<number>
    private readonly _drawMode: DrawMode

    constructor(geos: Array<number>, extrusion: Extrusion | undefined,
        offsets: Array<number>, colours: Array<number>, drawMode: DrawMode) {
        this._geos = geos
        this._extrusion = extrusion
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
     * Extrusion data to be used when drawing wide lines or undefined
     */
    extrusion(): Extrusion | undefined {
        return this._extrusion
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

    static mesh(s: S.Shape, earthRadius: Length, options: RenderingOptions): Array<Mesh> {
        switch (s.type) {
            case S.ShapeType.GeoCircle:
                return MeshGenerator.fromGeoCircle(s, earthRadius, options.circlePositions())
            case S.ShapeType.GeoPolygon:
                return MeshGenerator.fromGeoPolygon(s)
            case S.ShapeType.GeoPolyline:
                return MeshGenerator.fromGeoPolyline(s)
            case S.ShapeType.GeoRelativeCircle:
                return MeshGenerator.fromGeoRelativeCircle(s, options.circlePositions(), options.miterLimit())
            case S.ShapeType.GeoRelativePolygon:
                return MeshGenerator.fromGeoRelativePoygon(s, options.miterLimit())
            case S.ShapeType.GeoRelativePolyline:
                return MeshGenerator.fromGeoRelativePoyline(s, options.miterLimit())
        }
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: Length,
        circlePositions: number): Array<Mesh> {
        const gs = Geometry3d.discretiseCircle(c.centre(), c.radius(), earthRadius, circlePositions)
        const paint = c.paint()
        return MeshGenerator._fromGeoPolygon(gs, paint)
    }

    private static fromGeoPolyline(l: S.GeoPolyline): Array<Mesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        return [MeshGenerator._fromGeoPoyline(gs, l.stroke(), false)]
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
            res.push(new Mesh(vs, undefined, [], cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            res.push(MeshGenerator._fromGeoPoyline(gs, stroke, true))
        }
        return res
    }

    private static _fromGeoPoyline(points: Array<Vector3d>, stroke: S.Stroke,
        closed: boolean): Mesh {
        if (stroke.width() === 1) {
            const vs = MeshGenerator.geoPointsToArray(points, closed)
            const cs = MeshGenerator.colours(stroke.colour(), vs, 3)
            return new Mesh(vs, undefined, [], cs, DrawMode.LINES)
        }
        const e = closed
            ? MeshGenerator.closedExtrusion(points, stroke.width())
            : MeshGenerator.openedExtrusion(points, stroke.width())
        const vs = e[0]
        const cs = MeshGenerator.colours(stroke.colour(), vs, 3)
        return new Mesh(vs, e[1], [], cs, DrawMode.TRIANGLES)
    }

    private static fromGeoRelativeCircle(c: S.GeoRelativeCircle,
        circlePositions: number, miterLimit: number): Array<Mesh> {
        const ref = c.centreRef()
        const centre = new Vector2d(c.centreOffset().x(), c.centreOffset().y())
        const ps = Geometry2d.discretiseCircle(centre, c.radius(), circlePositions)
        const paint = c.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit)
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon,
        miterLimit: number): Array<Mesh> {
        const ref = p.ref()
        const ps = p.vertices().map(v => new Vector2d(v.x(), v.y()))
        const paint = p.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit)
    }

    private static _fromGeoRelativePoygon(ref: LatLong, vertices: Array<Vector2d>,
        paint: S.Paint, miterLimit: number): Array<Mesh> {
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (fill !== undefined) {
            const ts = Triangulator.PLANAR.triangulate(vertices)
            const os = MeshGenerator.offsetTrianglesToArray(ts)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = MeshGenerator.colours(fill, os, 2)
            res.push(new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            res.push(MeshGenerator._fromGeoRelativePoyline(ref, vertices, stroke, true, miterLimit))
        }
        return res
    }

    private static fromGeoRelativePoyline(l: S.GeoRelativePolyline,
        miterLimit: number): Array<Mesh> {
        const ps = l.points().map(p => new Vector2d(p.x(), p.y()))
        return [
            MeshGenerator._fromGeoRelativePoyline(l.ref(), ps, l.stroke(), false, miterLimit)
        ]
    }

    private static _fromGeoRelativePoyline(ref: LatLong, points: Array<Vector2d>,
        stroke: S.Stroke, closed: boolean, miterLimit: number): Mesh {
        if (stroke.width() === 1) {
            const os = MeshGenerator.offsetPointsToArray(points, closed)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = MeshGenerator.colours(stroke.colour(), os, 2)
            return new Mesh(vs, undefined, os, cs, DrawMode.LINES)
        }
        const ts = Geometry2d.extrude(points, stroke.width(), miterLimit, closed)
        const os = MeshGenerator.offsetTrianglesToArray(ts)
        const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(ref), os)
        const cs = MeshGenerator.colours(stroke.colour(), os, 2)
        return new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES)
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

    private static geoPointsToArray(ps: Array<Vector3d>, closed: boolean): Array<number> {
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
        if (closed) {
            res.push(ps[last].x(), ps[last].y(), ps[last].z())
            res.push(ps[0].x(), ps[0].y(), ps[0].z())
        }
        return res
    }

    private static offsetPointsToArray(ps: Array<Vector2d>, closed: boolean): Array<number> {
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
        if (closed) {
            res.push(ps[last].x(), ps[last].y())
            res.push(ps[0].x(), ps[0].y())
        }
        return res
    }

    private static closedExtrusion(vs: Array<Vector3d>, width: number): [Array<number>, Extrusion] {
        const halfWidth = width / 2.0
        const len = vs.length

        const curs = new Array()
        const prevs = new Array()
        const nexts = new Array()
        const halfWidths = new Array()

        for (let i = 0; i < len; i++) {
            const start = vs[i]
            const ei = i === len - 1 ? 0 : i + 1
            const end = vs[ei]
            const pi = i === 0 ? len - 1 : i - 1
            const prev = vs[pi]
            const ni = ei === len - 1 ? 0 : ei + 1
            const next = vs[ni]

            /* first triangle. */
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(end, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(start, prevs)

            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(next, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)

            /* second triangle. */
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(end, curs)
            MeshGenerator.pushV3(end, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(start, prevs)
            MeshGenerator.pushV3(start, prevs)

            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(next, nexts)
            MeshGenerator.pushV3(next, nexts)

            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
        }

        return [curs, new Extrusion(prevs, nexts, halfWidths)]
    }

    private static openedExtrusion(vs: Array<Vector3d>, width: number): [Array<number>, Extrusion] {
        const halfWidth = width / 2.0
        const len = vs.length

        const curs = new Array()
        const prevs = new Array()
        const nexts = new Array()
        const halfWidths = new Array()
        const zero = new Vector3d(0, 0, 0)

        for (let i = 0; i < len - 1; i++) {
            const start = vs[i]
            const end = vs[i + 1]
            const prev = i === 0 ? zero : vs[i - 1]
            const next = i + 1 === len - 1 ? zero : vs[i + 2]

            /* first triangle. */
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(end, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(start, prevs)

            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(next, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)

            /* second triangle. */
            MeshGenerator.pushV3(start, curs)
            MeshGenerator.pushV3(end, curs)
            MeshGenerator.pushV3(end, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(start, prevs)
            MeshGenerator.pushV3(start, prevs)

            MeshGenerator.pushV3(end, nexts)
            MeshGenerator.pushV3(next, nexts)
            MeshGenerator.pushV3(next, nexts)

            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
        }

        if (len > 2) {
            /* 2 last triangles. */
            /* first triangle. */
            const last = vs[len - 1]
            const penultimate = vs[len - 2]
            const prev = vs[len - 3]
            MeshGenerator.pushV3(penultimate, curs)
            MeshGenerator.pushV3(penultimate, curs)
            MeshGenerator.pushV3(last, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(penultimate, prevs)

            MeshGenerator.pushV3(last, nexts)
            MeshGenerator.pushV3(last, nexts)
            MeshGenerator.pushV3(zero, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(-halfWidth)

            /* second triangle. */
            MeshGenerator.pushV3(penultimate, curs)
            MeshGenerator.pushV3(last, curs)
            MeshGenerator.pushV3(last, curs)

            MeshGenerator.pushV3(prev, prevs)
            MeshGenerator.pushV3(penultimate, prevs)
            MeshGenerator.pushV3(penultimate, prevs)

            MeshGenerator.pushV3(last, nexts)
            MeshGenerator.pushV3(zero, nexts)
            MeshGenerator.pushV3(zero, nexts)

            halfWidths.push(-halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(+halfWidth)
        }
        return [curs, new Extrusion(prevs, nexts, halfWidths)]
    }

    private static pushV3(v: Vector3d, vs: Array<number>) {
        vs.push(v.x(), v.y(), v.z())
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
