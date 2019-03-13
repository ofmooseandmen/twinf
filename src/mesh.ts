import { CoordinateSystems } from "./coordinate-systems"
import { Colour } from "./colour"
import { Geodetics } from "./geodetics"
import { Length } from "./length"
import * as S from "./shape"
import { Triangle, Triangulator } from "./triangles"
import { Vector2d } from "./space2d"
import { Vector3d } from "./space3d"

export enum DrawMode {
    LINES,
    TRIANGLES
}

/**
 * A mesh is defined by geocentric positions, offsets, colours and a draw mode.
 *
 * If a geocentric position is (0, 0, 0) the offset is relative to the top-left
 * corner of the canvas, otherwise the offset is relative to that geocentric position.
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

    geos(): Array<number> {
        return this._geos
    }

    offsets(): Array<number> {
        return this._offsets
    }

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
            case S.ShapeType.GeoRelativePolygon: return MeshGenerator.fromGeoRelativePoygon(s)
            case S.ShapeType.GeoRelativePolyline: return MeshGenerator.fromGeoRelativePoyline(s)
        }
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: Length): Array<Mesh> {
        const gs = Geodetics.discretiseCircle(c.centre(), c.radius(), earthRadius, 100)
        const paint = c.painting()
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (stroke !== undefined) {
            const vs = MeshGenerator.geoPointsToArray(gs, true)
            const cs = MeshGenerator.colours(stroke, vs, 3)
            res.push(new Mesh(vs, MeshGenerator.noOffsets(vs), cs, DrawMode.LINES))
        }
        if (fill !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = MeshGenerator.geoTrianglesToArray(ts)
            const cs = MeshGenerator.colours(fill, vs, 3)
            res.push(new Mesh(vs, MeshGenerator.noOffsets(vs), cs, DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoPolyline(l: S.GeoPolyline): Array<Mesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        const vs = MeshGenerator.geoPointsToArray(gs, false)
        const cs = MeshGenerator.colours(l.colour(), vs, 3)
        return [new Mesh(vs, MeshGenerator.noOffsets(vs), cs, DrawMode.LINES)]
    }

    private static fromGeoPolygon(p: S.GeoPolygon): Array<Mesh> {
        const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric)
        const paint = p.painting()
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (stroke !== undefined) {
            const vs = MeshGenerator.geoPointsToArray(gs, true)
            const cs = MeshGenerator.colours(stroke, vs, 3)
            res.push(new Mesh(vs, MeshGenerator.noOffsets(vs), cs, DrawMode.LINES))
        }
        if (fill !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = MeshGenerator.geoTrianglesToArray(ts)
            const cs = MeshGenerator.colours(fill, vs, 3)
            res.push(new Mesh(vs, MeshGenerator.noOffsets(vs), cs, DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon): Array<Mesh> {
        const paint = p.painting()
        const stroke = paint.stroke()
        const fill = paint.fill()
        let res = new Array<Mesh>()
        if (stroke !== undefined) {
            const os = MeshGenerator.offsetPointsToArray(p.vertices(), true)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(p.ref()), os)
            const cs = MeshGenerator.colours(stroke, os, 2)
            res.push(new Mesh(vs, os, cs, DrawMode.LINES))
        }
        if (fill !== undefined) {
            const ts = Triangulator.PLANAR.triangulate(p.vertices())
            const os = MeshGenerator.offsetTrianglesToArray(ts)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(p.ref()), os)
            const cs = MeshGenerator.colours(fill, os, 2)
            res.push(new Mesh(vs, os, cs, DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoRelativePoyline(l: S.GeoRelativePolyline): Array<Mesh> {
        const os = MeshGenerator.offsetPointsToArray(l.points(), false)
        const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(l.ref()), os)
        const cs = MeshGenerator.colours(l.colour(), os, 2)
        return [new Mesh(vs, os, cs, DrawMode.LINES)]
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

    /** vs is array of geocentric vertices. */
    private static noOffsets(vs: Array<number>): Array<number> {
        // vertices have 3 components each, offsets only 2
        const len = (vs.length / 3) * 2
        return new Array(len).fill(0)
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
