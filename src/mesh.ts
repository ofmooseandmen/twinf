import { CoordinateSystems } from "./coordinate-systems"
import { Geodetics } from "./geodetics"
import * as S from "./shape"
import { Triangle, Triangulator } from "./triangles"
import { Vector2d } from "./space2d"
import { Vector3d } from "./space3d"

export enum DrawMode {
    LINES,
    TRIANGLES
}

/**
 * A mesh defined by vertices in the geocentric coordinate system and offsets.
 */
export class GeoMesh {

    private readonly _vertices: Array<number>
    private readonly _offsets: Array<number>
    private readonly _drawMode: DrawMode

    constructor(vertices: Array<number>, offsets: Array<number>, drawMode: DrawMode) {
        this._vertices = vertices
        this._offsets = offsets
        this._drawMode = drawMode
    }

    vertices(): Array<number> {
        return this._vertices
    }

    offsets(): Array<number> {
        return this._offsets
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

}

export class MeshGenerator {

    private constructor() { }

    static mesh(s: S.Shape, earthRadius: number): Array<GeoMesh> {
        switch (s.type) {
            case S.ShapeType.GeoCircle: return MeshGenerator.fromGeoCircle(s, earthRadius)
            case S.ShapeType.GeoPolygon: return MeshGenerator.fromGeoPolygon(s)
            case S.ShapeType.GeoPolyline: return MeshGenerator.fromGeoPolyline(s)
            case S.ShapeType.GeoRelativePolygon: return MeshGenerator.fromGeoRelativePoygon(s)
            case S.ShapeType.GeoRelativePolyline: return MeshGenerator.fromGeoRelativePoyline(s)
        }
    }

    private static fromGeoCircle(c: S.GeoCircle, earthRadius: number): Array<GeoMesh> {
        const gs = Geodetics.discretiseCircle(c.centre(), c.radius(), earthRadius, 100)
        const paint = c.painting()
        let res = new Array<GeoMesh>()
        if (paint.stroke() !== undefined) {
            const vs = MeshGenerator.geoPointsToArray(gs, true)
            res.push(new GeoMesh(vs, MeshGenerator.noOffsets(vs), DrawMode.LINES))
        }
        if (paint.fill() !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = MeshGenerator.geoTrianglesToArray(ts)
            res.push(new GeoMesh(vs, MeshGenerator.noOffsets(vs), DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoPolyline(l: S.GeoPolyline): Array<GeoMesh> {
        const gs = l.points().map(CoordinateSystems.latLongToGeocentric)
        const vs = MeshGenerator.geoPointsToArray(gs, false)
        return [new GeoMesh(vs, MeshGenerator.noOffsets(vs), DrawMode.LINES)]
    }

    private static fromGeoPolygon(p: S.GeoPolygon): Array<GeoMesh> {
        const gs = p.vertices().map(CoordinateSystems.latLongToGeocentric)
        const paint = p.painting()
        let res = new Array<GeoMesh>()
        if (paint.stroke() !== undefined) {
            const vs = MeshGenerator.geoPointsToArray(gs, true)
            res.push(new GeoMesh(vs, MeshGenerator.noOffsets(vs), DrawMode.LINES))
        }
        if (paint.fill() !== undefined) {
            const ts = Triangulator.SPHERICAL.triangulate(gs)
            const vs = MeshGenerator.geoTrianglesToArray(ts)
            res.push(new GeoMesh(vs, MeshGenerator.noOffsets(vs), DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoRelativePoygon(p: S.GeoRelativePolygon): Array<GeoMesh> {
        const paint = p.painting()
        let res = new Array<GeoMesh>()
        if (paint.stroke() !== undefined) {
            const os = MeshGenerator.offsetPointsToArray(p.vertices(), true)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(p.ref()), os)
            res.push(new GeoMesh(vs, os, DrawMode.LINES))
        }
        if (paint.fill() !== undefined) {
            const ts = Triangulator.PLANAR.triangulate(p.vertices())
            const os = MeshGenerator.offsetTrianglesToArray(ts)
            const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(p.ref()), os)
            res.push(new GeoMesh(vs, os, DrawMode.TRIANGLES))
        }
        return res
    }

    private static fromGeoRelativePoyline(l: S.GeoRelativePolyline): Array<GeoMesh> {
        const os = MeshGenerator.offsetPointsToArray(l.points(), false)
        const vs = MeshGenerator.reference(CoordinateSystems.latLongToGeocentric(l.ref()), os)
        return [new GeoMesh(vs, os, DrawMode.LINES)]
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

    private static noOffsets(vs: Array<number>): Array<number> {
        return new Array(MeshGenerator.offsetArrayLength(vs)).fill(0)
    }

    private static offsetArrayLength(vs: Array<number>): number {
        // vertices have 3 components each, offsets only 2
        return (vs.length / 3) * 2
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
