import { Geodetics } from "./geodetics"
import { Geometry2d } from "./space2d"

/**
 * Triangle defined by 3 vertices.
 */
export class Triangle<T> {

    private readonly _v1: T
    private readonly _v2: T
    private readonly _v3: T

    constructor(v1: T, v2: T, v3: T) {
        this._v1 = v1
        this._v2 = v2
        this._v3 = v3
    }

    v1(): T {
        return this._v1
    }

    v2(): T {
        return this._v2
    }

    v3(): T {
        return this._v3
    }

}

/**
 * Polygon triangulation.
 */
export class Triangulator<T>  {

    private readonly isRight: (p0: T, p1: T, p2: T) => boolean

    private readonly isInsideSurface: (p: T, t: Array<T>) => boolean

    private constructor(isRight: (p0: T, p1: T, p2: T) => boolean,
        isInsideSurface: (p: T, t: Array<T>) => boolean) {
        this.isRight = isRight
        this.isInsideSurface = isInsideSurface
    }

    /**
     * Triangulator that handles spherical polygons whose vertices are defined as
     * geocentric positions.
     */
    static readonly SPHERICAL = new Triangulator(Geodetics.right, Geodetics.insideSurface)

    /**
     * Triangulator that handles polygons whose vertices are defined as 2D positions.
     */
    static readonly PLANAR = new Triangulator(Geometry2d.right, Geometry2d.insideSurface)

    /**
     * Triangulates the given polygon which can be
     * convex or concave, self-intersecting or simple.
     */
    triangulate(polygon: Array<T>): Array<Triangle<T>> {
        if (polygon.length < 3) {
            throw new RangeError("A polygon must contain at least 3 vertices")
        }
        if (polygon.length == 3) {
            return [new Triangle(polygon[0], polygon[1], polygon[2])]
        }
        var r = new Array
        const sps = this.simplePolygons(polygon)
        // 'flatMap' the result of the triangulation of each simple polygon
        sps.forEach(sp => r = r.concat(this.triangulateSimple(sp), r))
        return r
    }

    /**
     * Triangulates the given simple polygon which can be
     * convex or concave. Use this method if you the Polygon
     * is simple (i.e. not self-intersecting): this skips the
     * determination of the self-interection(s) which can be
     * costly.
     */
    triangulateSimple(vs: Array<T>): Array<Triangle<T>> {
        if (vs.length < 3) {
            throw new RangeError("A polygon must contain at least 3 vertices")
        }
        if (vs.length == 3) {
            return [new Triangle(vs[0], vs[1], vs[2])]
        }
        if (vs.length == 4) {
            return [new Triangle(vs[0], vs[1], vs[2]), new Triangle(vs[2], vs[3], vs[0])]
        }
        return this.earClipping(vs)
    }

    /**
     * Splits the given polygon to a list of simple polygon - i.e. not self-intersecting.
     */
    private simplePolygons(polygon: Array<T>): Array<Array<T>> {
        // TODO implement
        return [polygon]
    }

    private earClipping(vs: Array<T>): Array<Triangle<T>> {
        const ovs = this.orient(vs)
        var triangles = new Array
        while (true) {
            if (ovs.length == 3) {
                triangles.push(new Triangle(ovs[0], ovs[1], ovs[2]))
                return triangles
            }
            const ei = this.findEar(ovs)
            if (ei === -1) {
                throw new RangeError("Triangulation error, remaining vertices:\n" + ovs.length + "\ntriangles:\n" + triangles.length)
            }
            const pi = Triangulator.prev(ei, ovs.length)
            const ni = Triangulator.next(ei, ovs.length)
            triangles.push(new Triangle(ovs[pi], ovs[ei], ovs[ni]))
            ovs.splice(ei, 1);
        }
    }

    /**
     * Finds the index of the next ear in the given polygon (oriented clockwise).
     * Returns -1 if none found.
     */
    private findEar(vs: Array<T>): number {
        const len = vs.length
        const c = this.classify(vs)
        for (let i = 0; i < len; i++) {
            const v = vs[i]
            if (!c[i]) {
                /*
                 * i is a convex vertex, then i is an ear if
                 * triangle pi, i, ni contains no reflex.
                 */
                const t = [vs[Triangulator.prev(i, len)], v, vs[Triangulator.next(i, len)]]
                const ear = vs
                    .filter((_, j) => c[j])
                    .every(r => !this.isInsideSurface(r, t))
                if (ear) {
                    return i
                }
            }
        }
        return -1
    }

    /**
     * Classifies every vertex as either a reflex (true)
     * or a convex vertex (false) of the given polygon (oriented clockwise).
     * A reflex is a vertex where the polygon is concave.
     */
    private classify(vs: Array<T>): Array<boolean> {
        /* a vertex is a reflex if previous vertex is left
         * (assuming a clockwise polygon), otherwise it is a convex
         * vertex. */
        const len = vs.length
        return vs
            .map((v, i) => this.isRight(vs[Triangulator.prev(i, len)], v, vs[(i + 1) % len]))
    }

    /**
     * Orients the given polygon in clockwise order. A new array is returned.
     */
    private orient(vs: Array<T>): Array<T> {
        // compute orientation of each vertex
        const len = vs.length
        const vos = vs
            .map((v, i) => this.isRight(v, vs[(i + 1) % len], vs[(i + 2) % len]))
        // if more right than left then polygon is clockwise, otherwise counterclockwise
        const cw = vos.filter(o => o).length >= vos.filter(o => !o).length
        const res = vs.slice(0)
        // if counterclockwise reverse
        if (cw) {
            res.reverse()
        }
        return res
    }

    private static prev(i: number, len: number) {
        return i === 0 ? len - 1 : i - 1
    }

    private static next(i: number, len: number) {
        return i === len - 1 ? 0 : i + 1
    }

}
