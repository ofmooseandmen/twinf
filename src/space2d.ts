import { Triangle } from "./triangle"

export class Vector2d {

    private readonly _x: number
    private readonly _y: number

    constructor(x: number, y: number) {
        this._x = x
        this._y = y
    }

    x(): number {
        return this._x
    }
    y(): number {
        return this._y
    }

}

export class Math2d {

    private constructor() { }

    /**
     * Adds the 2 given vectors.
     */
    static add(v1: Vector2d, v2: Vector2d): Vector2d {
        return new Vector2d(v1.x() + v2.x(), v1.y() + v2.y())
    }

    /**
     * Subtracts the 2 given vectors.
     */
    static sub(v1: Vector2d, v2: Vector2d): Vector2d {
        return new Vector2d(v1.x() - v2.x(), v1.y() - v2.y())
    }

    /**
     * Computes the dot product of 2 vectors.
     */
    static dot(v1: Vector2d, v2: Vector2d): number {
        return v1.x() * v2.x() + v1.y() * v2.y()
    }

    /**
     * Computes the norm of the given vector.
     */
    static norm(v: Vector2d): number {
        return Math.sqrt(v.x() * v.x() + v.y() * v.y())
    }

    /**
     * Multiplies each component of the given vector by the given number.
     */
    static scale(v: Vector2d, s: number): Vector2d {
        return new Vector2d(s * v.x(), s * v.y())
    }

    /**
     * Normalises the given vector (norm of return vector is 1).
     */
    static unit(v: Vector2d): Vector2d {
        const s = 1.0 / Math2d.norm(v)
        return s == 1.0 ? v : Math2d.scale(v, s)
    }
}

export class Geometry2d {

    private constructor() { }

    /**
     * Determines whether p0 is right of the line from p1 to p2.
     */
    static right(p0: Vector2d, p1: Vector2d, p2: Vector2d): boolean {
        return (p2.x() - p1.x()) * (p0.y() - p1.y()) - (p2.y() - p1.y()) * (p0.x() - p1.x()) <= 0
    }

    /**
     * Determines whether the given position is inside the polygon defined by
     * the given list of positions.
     *
     * Notes:
     * - the polygon can be closedd or opened, i.e. first and last given positions
     *   can be equal.
     * - this method always returns false if the list contains less than 3 positions.
     */
    static insideSurface(p: Vector2d, ps: Array<Vector2d>): boolean {
        const len = ps.length
        if (len < 3) {
            return false
        }
        // ray casting
        const x = p.x();
        const y = p.y();
        let inside = false;
        for (let i = 0, j = len - 1; i < len; j = i++) {
            const xi = ps[i].x();
            const yi = ps[i].y();
            const xj = ps[j].x();
            const yj = ps[j].y();
            const intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Computes the 2D points that represent the circle defined
     * by the given centre and radius in pixels.
     */
    static discretiseCircle(centre: Vector2d, radius: number,
        nbPositions: number): Array<Vector2d> {
        return Array.from(new Array(nbPositions), (_, i) => i)
            .map(i => 2 * i * Math.PI / nbPositions)
            /* circle at (0, 0), translated to centre */
            .map(a => new Vector2d(
                radius * Math.cos(a) + centre.x(),
                radius * Math.sin(a) + centre.y()
            ))
    }

    /**
     * Extrudes the given polyline to a triangle strip of the given width.
     */
    static extrude(points: Array<Vector2d>, width: number, closed: boolean): Array<Triangle<Vector2d>> {
        const len = points.length
        let ts = new Array<Triangle<Vector2d>>()
        if (len < 2) {
            return ts
        }
        const halfWidth = width / 2.0
        const extruded = new Array<Vector2d>()
        if (closed) {
            Geometry2d.extrudeUsingAdjs(points[0], points[len - 1], points[1], halfWidth, extruded)
        } else {
            Geometry2d.extrudeUsingAdj(points[0], points[1], halfWidth, extruded)
        }
        for (let i = 1; i < len - 1; i++) {
            Geometry2d.extrudeUsingAdjs(points[i], points[i - 1], points[i + 1], halfWidth, extruded)
        }
        if (closed) {
            Geometry2d.extrudeUsingAdjs(points[len - 1], points[len - 2], points[0], halfWidth, extruded)
        } else {
            Geometry2d.extrudeUsingAdj(points[len - 1], points[len - 2], -halfWidth, extruded)
        }
        const el = extruded.length
        for (let i = 0; i < el - 2; i++) {
            ts.push(new Triangle<Vector2d>(extruded[i], extruded[i + 1], extruded[i + 2]));
        }
        if (closed) {
            ts.push(new Triangle<Vector2d>(extruded[el - 2], extruded[el - 1], extruded[0]));
            ts.push(new Triangle<Vector2d>(extruded[el - 1], extruded[0], extruded[1]));
        }
        return ts
    }

    private static extrudeUsingAdjs(pt: Vector2d, prev: Vector2d, next: Vector2d,
        halfWidth: number, res: Array<Vector2d>) {
        /* line from prev to pt. */
        const lineTo = Geometry2d.direction(pt, prev)
        const normal = Geometry2d.normal(lineTo)
        /* line from pt to next. */
        const lineFrom = Geometry2d.direction(next, pt)
        /* miter. */
        const tangent = Math2d.unit(Math2d.add(lineTo, lineFrom))
        const miter = Geometry2d.normal(tangent)
        const miterLength = halfWidth / Math2d.dot(miter, normal)
        res.push(Math2d.add(pt, Math2d.scale(miter, miterLength)))
        res.push(Math2d.add(pt, Math2d.scale(miter, -miterLength)))
    }

    private static extrudeUsingAdj(pt: Vector2d, adj: Vector2d,
        halfWidth: number, res: Array<Vector2d>) {
        const normal = Geometry2d.normal(Geometry2d.direction(adj, pt))
        res.push(Math2d.add(pt, Math2d.scale(normal, halfWidth)))
        res.push(Math2d.add(pt, Math2d.scale(normal, -halfWidth)))
    }

    private static normal(direction: Vector2d) {
        return new Vector2d(-direction.y(), direction.x())
    }

    private static direction(a: Vector2d, b: Vector2d) {
        return Math2d.unit(Math2d.sub(a, b))
    }

}
