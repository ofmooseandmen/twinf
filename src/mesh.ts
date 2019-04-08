import { CoordinateSystems } from "./coordinate-systems"
import { Colour } from "./colour"
import { LatLong } from "./latlong"
import { Length } from "./length"
import * as S from "./shapes"
import { Geometry2d, Vector2d } from "./space2d"
import { InternalGeodetics, Vector3d } from "./space3d"
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

    private readonly _prevGeos: ReadonlyArray<number>
    private readonly _nextGeos: ReadonlyArray<number>
    private readonly _halfWidths: ReadonlyArray<number>

    constructor(prevGeos: ReadonlyArray<number>, nextGeos: ReadonlyArray<number>,
        halfWidths: ReadonlyArray<number>) {
        this._prevGeos = prevGeos
        this._nextGeos = nextGeos
        this._halfWidths = halfWidths
    }

    static fromLiteral(data: any): Extrusion {
        const prevGeos = data["_prevGeos"]
        const nextGeos = data["_nextGeos"]
        const halfWidths = data["__halfWidths"]
        return new Extrusion(prevGeos, nextGeos, halfWidths)
    }

    prevGeos(): ReadonlyArray<number> {
        return this._prevGeos
    }

    nextGeos(): ReadonlyArray<number> {
        return this._nextGeos
    }

    halfWidths(): ReadonlyArray<number> {
        return this._halfWidths
    }

}

/**
 * A mesh is defined by geocentric positions, extrusion, offsets, colours and a draw mode.
 */
export class Mesh {

    private readonly _geos: ReadonlyArray<number>
    private readonly _extrusion: Extrusion | undefined
    private readonly _offsets: ReadonlyArray<number>
    private readonly _colours: ReadonlyArray<number>
    private readonly _drawMode: DrawMode

    constructor(geos: ReadonlyArray<number>, extrusion: Extrusion | undefined,
        offsets: ReadonlyArray<number>, colours: ReadonlyArray<number>, drawMode: DrawMode) {
        this._geos = geos
        this._extrusion = extrusion
        this._offsets = offsets
        this._colours = colours
        this._drawMode = drawMode
    }

    static fromLiteral(data: any): Mesh {
        const geos = data["_geos"]
        const extrusion = data.hasOwnProperty("_extrusion")
            ? Extrusion.fromLiteral(data["_extrusion"])
            : undefined
        const offsets = data["_offsets"]
        const colours = data["_colours"]
        const drawMode = data["_drawMode"]
        return new Mesh(geos, extrusion, offsets, colours, drawMode)
    }

    /**
     * Array of geocentric vertices (3 components each) or empty. If not empty
     * this determines the number of indices to be rendered. If empty the VBO must
     * be disabled.
     */
    geos(): ReadonlyArray<number> {
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
    offsets(): ReadonlyArray<number> {
        return this._offsets
    }

    /**
     * Array of colours (1 component each), never empty.
     */
    colours(): ReadonlyArray<number> {
        return this._colours
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

}

export class MeshingParameters {

    private readonly _earthRadius: Length
    private readonly _circlePositions: number
    private readonly _miterLimit: number

    constructor(earthRadius: Length, circlePositions: number, miterLimit: number) {
        this._earthRadius = earthRadius
        this._circlePositions = circlePositions
        this._miterLimit = miterLimit
    }

    static fromLiteral(data: any): MeshingParameters {
        const earthRadius = Length.fromLiteral(data["_earthRadius"])
        const circlePositions = data["_circlePositions"]
        const miterLimit = data["_miterLimit"]
        return new MeshingParameters(earthRadius, circlePositions, miterLimit)
    }

    earthRadius(): Length {
        return this._earthRadius
    }

    /**
     * See RenderingOptions#circlePositions.
     */
    circlePositions(): number {
        return this._circlePositions
    }
    /**
     * See RenderingOptions#miterLimit.
     */
    miterLimit(): number {
        return this._miterLimit
    }

}

export class MeshGenerator {

    private readonly params: MeshingParameters

    constructor(params: MeshingParameters) {
        this.params = params
    }

    mesh(s: S.Shape): ReadonlyArray<Mesh> {
        switch (s.type) {
            case S.ShapeType.GeoCircle:
                return MeshGenerator.fromGeoCircle(s,
                    this.params.earthRadius(), this.params.circlePositions())
            case S.ShapeType.GeoPolygon:
                return MeshGenerator.fromGeoPolygon(s)
            case S.ShapeType.GeoPolyline:
                return MeshGenerator.fromGeoPolyline(s)
            case S.ShapeType.GeoRelativeCircle:
                return MeshGenerator.fromGeoRelativeCircle(s,
                    this.params.circlePositions(), this.params.miterLimit())
            case S.ShapeType.GeoRelativePolygon:
                return MeshGenerator.fromGeoRelativePoygon(s, this.params.miterLimit())
            case S.ShapeType.GeoRelativePolyline:
                return MeshGenerator.fromGeoRelativePoyline(s, this.params.miterLimit())
        }
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: Length,
        circlePositions: number): ReadonlyArray<Mesh> {
        const gs = InternalGeodetics.discretiseCircle(c.centre(), c.radius(), earthRadius, circlePositions)
        const paint = c.paint()
        return MeshGenerator._fromGeoPolygon(gs, paint)
    }

    private static fromGeoPolyline(l: S.GeoPolyline): ReadonlyArray<Mesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        return [MeshGenerator._fromGeoPoyline(gs, l.stroke(), false)]
    }

    private static fromGeoPolygon(p: S.GeoPolygon): ReadonlyArray<Mesh> {
        const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric)
        const paint = p.paint()
        return MeshGenerator._fromGeoPolygon(gs, paint)
    }

    private static _fromGeoPolygon(gs: ReadonlyArray<Vector3d>, paint: S.Paint): ReadonlyArray<Mesh> {
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

    private static _fromGeoPoyline(points: ReadonlyArray<Vector3d>, stroke: S.Stroke,
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
        circlePositions: number, miterLimit: number): ReadonlyArray<Mesh> {
        const ref = c.centreRef()
        const centre = new Vector2d(c.centreOffset().x(), c.centreOffset().y())
        const ps = Geometry2d.discretiseCircle(centre, c.radius(), circlePositions)
        const paint = c.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit)
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon,
        miterLimit: number): ReadonlyArray<Mesh> {
        const ref = p.ref()
        const ps = p.vertices().map(v => new Vector2d(v.x(), v.y()))
        const paint = p.paint()
        return MeshGenerator._fromGeoRelativePoygon(ref, ps, paint, miterLimit)
    }

    private static _fromGeoRelativePoygon(ref: LatLong, vertices: ReadonlyArray<Vector2d>,
        paint: S.Paint, miterLimit: number): ReadonlyArray<Mesh> {
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
        miterLimit: number): ReadonlyArray<Mesh> {
        const ps = l.points().map(p => new Vector2d(p.x(), p.y()))
        return [
            MeshGenerator._fromGeoRelativePoyline(l.ref(), ps, l.stroke(), false, miterLimit)
        ]
    }

    private static _fromGeoRelativePoyline(ref: LatLong, points: ReadonlyArray<Vector2d>,
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

    private static geoTrianglesToArray(ts: ReadonlyArray<Triangle<Vector3d>>): ReadonlyArray<number> {
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

    private static offsetTrianglesToArray(ts: ReadonlyArray<Triangle<Vector2d>>): ReadonlyArray<number> {
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

    private static geoPointsToArray(ps: ReadonlyArray<Vector3d>, closed: boolean): ReadonlyArray<number> {
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

    private static offsetPointsToArray(ps: ReadonlyArray<Vector2d>,
        closed: boolean): ReadonlyArray<number> {
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

    private static closedExtrusion(vs: ReadonlyArray<Vector3d>,
        width: number): [ReadonlyArray<number>, Extrusion] {
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

    private static openedExtrusion(vs: ReadonlyArray<Vector3d>,
        width: number): [ReadonlyArray<number>, Extrusion] {
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
    private static colours(colour: Colour, vs: ReadonlyArray<number>, n: number): ReadonlyArray<number> {
        const rgba = colour.rgba()
        const len = vs.length / n
        return new Array(len).fill(rgba)
    }

    private static reference(v: Vector3d, offsets: ReadonlyArray<number>): ReadonlyArray<number> {
        const n = offsets.length / 2
        let arr = new Array<number>()
        for (let i = 0; i < n; i++) {
            arr.push(v.x(), v.y(), v.z())
        }
        return arr
    }

}
