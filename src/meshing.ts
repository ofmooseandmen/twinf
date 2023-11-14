import { CoordinateSystems } from './coordinate-systems'
import { Colour } from './colour'
import { LatLong } from './latlong'
import { Length } from './length'
import * as S from './shapes'
import { Geometry2d, Vector2d } from './space2d'
import { InternalGeodetics, Vector3d } from './space3d'
import { Triangle } from './triangle'
import { Triangulator } from './triangulation'
import { Sprites } from './rendering'
import { Offset } from './pixels'

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
        const prevGeos = data['_prevGeos']
        const nextGeos = data['_nextGeos']
        const halfWidths = data['_halfWidths']
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
    private readonly _texcoord: ReadonlyArray<number> | undefined

    constructor(geos: ReadonlyArray<number>, extrusion: Extrusion | undefined,
        offsets: ReadonlyArray<number>, colours: ReadonlyArray<number>,
        drawMode: DrawMode, texcoord:ReadonlyArray<number> | undefined = undefined) {
        this._geos = geos
        this._extrusion = extrusion
        this._offsets = offsets
        this._colours = colours
        this._drawMode = drawMode
        this._texcoord = texcoord
    }

    static fromLiteral(data: any): Mesh {
        const geos = data['_geos']
        const extrusion = data.hasOwnProperty('_extrusion')
            ? Extrusion.fromLiteral(data['_extrusion'])
            : undefined
        const offsets = data['_offsets']
        const colours = data['_colours']
        const drawMode = data['_drawMode']
        const texcoord = data['_texcoord']
        return new Mesh(geos, extrusion, offsets, colours, drawMode, texcoord)
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

    texcoord(): ReadonlyArray<number> | undefined {
        return this._texcoord
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

}

export class Mesher {

    private readonly earthRadius: Length
    private readonly circlePositions: number
    private readonly miterLimit: number
    private readonly sprites: Sprites

    constructor(earthRadius: Length, circlePositions: number, miterLimit: number,
        sprites: Sprites) {
        this.earthRadius = earthRadius
        this.circlePositions = circlePositions
        this.miterLimit = miterLimit
        this.sprites = sprites
    }

    static fromLiteral(data: any): Mesher {
        const earthRadius = Length.fromLiteral(data['earthRadius'])
        const circlePositions = data['circlePositions']
        const miterLimit = data['miterLimit']
        const sprites = Sprites.fromLiteral(data['sprites'])
        return new Mesher(earthRadius, circlePositions, miterLimit, sprites)
    }

    meshShape(s: S.Shape): ReadonlyArray<Mesh> {
        switch (s.type) {
            case S.ShapeType.GeoCircle:
                return Mesher.fromGeoCircle(s, this.earthRadius, this.circlePositions)
            case S.ShapeType.GeoPolygon:
                return Mesher.fromGeoPolygon(s)
            case S.ShapeType.GeoPolyline:
                return Mesher.fromGeoPolyline(s)
            case S.ShapeType.GeoRelativeCircle:
                return Mesher.fromGeoRelativeCircle(s, this.circlePositions, this.miterLimit)
            case S.ShapeType.GeoRelativeText:
                return Mesher.fromGeoRelativeText(s, this.sprites)
            case S.ShapeType.GeoRelativePolygon:
                return Mesher.fromGeoRelativePoygon(s, this.miterLimit)
            case S.ShapeType.GeoRelativePolyline:
                return Mesher.fromGeoRelativePoyline(s, this.miterLimit)
        }
    }

    private static fromGeoRelativeText(t: S.GeoRelativeText, sprites: Sprites): ReadonlyArray<Mesh> {
        let res = new Array<Mesh>()
        let offset = 0
        for (const char of t.text()) {
            const geom = sprites.char(char)
            const tl = t.offset()
            const vertices = [
                new Offset(tl.x(), tl.y()),
                new Offset(tl.x(), tl.y() + geom.height()),
                new Offset(tl.x() + geom.width(), tl.y() + geom.height()),
                new Offset(tl.x() + geom.width(), tl.y()),
            ].map(v => new Vector2d(v.x() + offset, v.y()))
            const ts = Triangulator.PLANAR.triangulate(vertices)
            const os = Mesher.offsetTrianglesToArray(ts)
            const vs = Mesher.reference(CoordinateSystems.latLongToGeocentric(t.ref()), os)
            const cs = Mesher.colours(t.colour(), os, 2)

            /*
             * Mesh is formed with two triangles.
             * Essentially a closedExtrusion with 4 vertices, filled with a texture.
             *
             * For the fragment shader texture signalling, vec3.x = 1.0 is used, pushing:
             * - x coords to vec3.y
             * - y coords to vec3.z
             */
            const ttl = new Offset(geom.topleft().x(), geom.topleft().y())
            const tex = [
                /* tl */ 1.0, ttl.x(), ttl.y(),
                /* bl */ 1.0, ttl.x(), ttl.y() + geom.height(),
                /* br */ 1.0, ttl.x() + geom.width(), ttl.y() + geom.height(),
                /* br */ 1.0, ttl.x() + geom.width(), ttl.y() + geom.height(),
                /* tr */ 1.0, ttl.x() + geom.width(), ttl.y(),
                /* tl */ 1.0, ttl.x(), ttl.y(),
            ]
            res.push(new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES, tex))
            offset += geom.width()
        }
        return res
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: Length,
        circlePositions: number): ReadonlyArray<Mesh> {
        const gs = InternalGeodetics.discretiseCircle(c.centre(), c.radius(), earthRadius, circlePositions)
        const paint = c.paint()
        return Mesher._fromGeoPolygon(gs, paint)
    }

    private static fromGeoPolyline(l: S.GeoPolyline): ReadonlyArray<Mesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        return [Mesher._fromGeoPoyline(gs, l.stroke(), false)]
    }

    private static fromGeoPolygon(p: S.GeoPolygon): ReadonlyArray<Mesh> {
        const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric)
        const paint = p.paint()
        return Mesher._fromGeoPolygon(gs, paint)
    }

    private static _fromGeoPolygon(gs: ReadonlyArray<Vector3d>, paint: S.Paint): ReadonlyArray<Mesh> {
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (fill !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = Mesher.geoTrianglesToArray(ts)
            const cs = Mesher.colours(fill, vs, 3)
            res.push(new Mesh(vs, undefined, [], cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            res.push(Mesher._fromGeoPoyline(gs, stroke, true))
        }
        return res
    }

    private static _fromGeoPoyline(points: ReadonlyArray<Vector3d>, stroke: S.Stroke,
        closed: boolean): Mesh {
        if (stroke.width() === 1) {
            const vs = Mesher.geoPointsToArray(points, closed)
            const cs = Mesher.colours(stroke.colour(), vs, 3)
            return new Mesh(vs, undefined, [], cs, DrawMode.LINES)
        }
        const e = closed
            ? Mesher.closedExtrusion(points, stroke.width())
            : Mesher.openedExtrusion(points, stroke.width())
        const vs = e[0]
        const cs = Mesher.colours(stroke.colour(), vs, 3)
        return new Mesh(vs, e[1], [], cs, DrawMode.TRIANGLES)
    }

    private static fromGeoRelativeCircle(c: S.GeoRelativeCircle,
        circlePositions: number, miterLimit: number): ReadonlyArray<Mesh> {
        const ref = c.centreRef()
        const centre = new Vector2d(c.centreOffset().x(), c.centreOffset().y())
        const ps = Geometry2d.discretiseCircle(centre, c.radius(), circlePositions)
        const paint = c.paint()
        return Mesher._fromGeoRelativePolygon(ref, ps, paint, miterLimit)
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon,
        miterLimit: number): ReadonlyArray<Mesh> {
        const ref = p.ref()
        const ps = p.vertices().map(v => new Vector2d(v.x(), v.y()))
        const paint = p.paint()
        return Mesher._fromGeoRelativePolygon(ref, ps, paint, miterLimit)
    }

    private static _fromGeoRelativePolygon(ref: LatLong, vertices: ReadonlyArray<Vector2d>,
        paint: S.Paint, miterLimit: number): ReadonlyArray<Mesh> {
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (fill !== undefined) {
            const ts = Triangulator.PLANAR.triangulate(vertices)
            const os = Mesher.offsetTrianglesToArray(ts)
            const vs = Mesher.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = Mesher.colours(fill, os, 2)
            res.push(new Mesh(vs, undefined, os, cs, DrawMode.TRIANGLES))
        }
        if (stroke !== undefined) {
            res.push(Mesher._fromGeoRelativePoyline(ref, vertices, stroke, true, miterLimit))
        }
        return res
    }

    private static fromGeoRelativePoyline(l: S.GeoRelativePolyline,
        miterLimit: number): ReadonlyArray<Mesh> {
        const ps = l.points().map(p => new Vector2d(p.x(), p.y()))
        return [
            Mesher._fromGeoRelativePoyline(l.ref(), ps, l.stroke(), false, miterLimit)
        ]
    }

    private static _fromGeoRelativePoyline(ref: LatLong, points: ReadonlyArray<Vector2d>,
        stroke: S.Stroke, closed: boolean, miterLimit: number): Mesh {
        if (stroke.width() === 1) {
            const os = Mesher.offsetPointsToArray(points, closed)
            const vs = Mesher.reference(CoordinateSystems.latLongToGeocentric(ref), os)
            const cs = Mesher.colours(stroke.colour(), os, 2)
            return new Mesh(vs, undefined, os, cs, DrawMode.LINES)
        }
        const ts = Geometry2d.extrude(points, stroke.width(), miterLimit, closed)
        const os = Mesher.offsetTrianglesToArray(ts)
        const vs = Mesher.reference(CoordinateSystems.latLongToGeocentric(ref), os)
        const cs = Mesher.colours(stroke.colour(), os, 2)
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
            Mesher.pushV3(start, curs)
            Mesher.pushV3(start, curs)
            Mesher.pushV3(end, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(start, prevs)

            Mesher.pushV3(end, nexts)
            Mesher.pushV3(end, nexts)
            Mesher.pushV3(next, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)

            /* second triangle. */
            Mesher.pushV3(start, curs)
            Mesher.pushV3(end, curs)
            Mesher.pushV3(end, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(start, prevs)
            Mesher.pushV3(start, prevs)

            Mesher.pushV3(end, nexts)
            Mesher.pushV3(next, nexts)
            Mesher.pushV3(next, nexts)

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
            Mesher.pushV3(start, curs)
            Mesher.pushV3(start, curs)
            Mesher.pushV3(end, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(start, prevs)

            Mesher.pushV3(end, nexts)
            Mesher.pushV3(end, nexts)
            Mesher.pushV3(next, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(halfWidth)

            /* second triangle. */
            Mesher.pushV3(start, curs)
            Mesher.pushV3(end, curs)
            Mesher.pushV3(end, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(start, prevs)
            Mesher.pushV3(start, prevs)

            Mesher.pushV3(end, nexts)
            Mesher.pushV3(next, nexts)
            Mesher.pushV3(next, nexts)

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
            Mesher.pushV3(penultimate, curs)
            Mesher.pushV3(penultimate, curs)
            Mesher.pushV3(last, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(penultimate, prevs)

            Mesher.pushV3(last, nexts)
            Mesher.pushV3(last, nexts)
            Mesher.pushV3(zero, nexts)

            halfWidths.push(halfWidth)
            halfWidths.push(-halfWidth)
            halfWidths.push(-halfWidth)

            /* second triangle. */
            Mesher.pushV3(penultimate, curs)
            Mesher.pushV3(last, curs)
            Mesher.pushV3(last, curs)

            Mesher.pushV3(prev, prevs)
            Mesher.pushV3(penultimate, prevs)
            Mesher.pushV3(penultimate, prevs)

            Mesher.pushV3(last, nexts)
            Mesher.pushV3(zero, nexts)
            Mesher.pushV3(zero, nexts)

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
