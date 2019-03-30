import { Angle } from "./angle"
import { LatLong } from "./latlong"
import { Length } from "./length"

export class Vector3d {

    private readonly _x: number
    private readonly _y: number
    private readonly _z: number

    constructor(x: number, y: number, z: number) {
        this._x = x
        this._y = y
        this._z = z
    }

    x(): number {
        return this._x
    }

    y(): number {
        return this._y
    }

    z(): number {
        return this._z
    }

    /** origin: (0, 0, 0). */
    static readonly ZERO = new Vector3d(0, 0, 0)

}

export class Math3d {

    /**
     * Adds the 2 given vectors.
     */
    static add(v1: Vector3d, v2: Vector3d): Vector3d {
        return new Vector3d(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z())
    }

    /**
     * Subtracts the 2 given vectors.
     */
    static sub(v1: Vector3d, v2: Vector3d): Vector3d {
        return new Vector3d(v1.x() - v2.x(), v1.y() - v2.y(), v1.z() - v2.z())
    }

    /**
     * Computes the cross product of 2 vectors: the vector perpendicular to given vectors.
     */
    static cross(v1: Vector3d, v2: Vector3d): Vector3d {
        const x = v1.y() * v2.z() - v1.z() * v2.y()
        const y = v1.z() * v2.x() - v1.x() * v2.z()
        const z = v1.x() * v2.y() - v1.y() * v2.x()
        return new Vector3d(x, y, z)
    }

    /**
     * Computes the dot product of 2 vectors.
     */
    static dot(v1: Vector3d, v2: Vector3d): number {
        return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z()
    }

    /**
     * Computes the norm of the given vector.
     */
    static norm(v: Vector3d): number {
        return Math.sqrt(v.x() * v.x() + v.y() * v.y() + v.z() * v.z())
    }

    /**
     * Mutiplies given 3*3 matrix by given vector.
     */
    static multmv(m: Array<Vector3d>, v: Vector3d): Vector3d {
        if (m.length != 3) {
            throw new RangeError("Rotation matrix must be 3*3")
        }
        return Math3d.a2v(m.map(r => Math3d.dot(v, r)))
    }

    /**
     * Mutiplies given 3*3 matrix by given 3*3 matrix.
     */
    static multmm(m1: Array<Vector3d>, m2: Array<Vector3d>): Array<Vector3d> {
        if (m1.length != 3 || m2.length != 3) {
            throw new RangeError("Rotation matrix must be 3*3")
        }
        const t2 = Math3d.transpose(m2)
        return [
            Math3d.a2v(t2.map(t => Math3d.dot(m1[0], t))),
            Math3d.a2v(t2.map(t => Math3d.dot(m1[1], t))),
            Math3d.a2v(t2.map(t => Math3d.dot(m1[2], t)))
        ]
    }

    /**
     * Multiplies each component of the given vector by the given number.
     */
    static scale(v: Vector3d, s: number): Vector3d {
        return new Vector3d(s * v.x(), s * v.y(), s * v.z())
    }

    /**
     * Normalises the given vector (norm of return vector is 1).
     */
    static unit(v: Vector3d): Vector3d {
        const s = 1.0 / Math3d.norm(v)
        return s == 1.0 ? v : Math3d.scale(v, s)
    }

    /**
     * Transposes given 3*3 matrix.
     */
    static transpose(m: Array<Vector3d>): Array<Vector3d> {
        const xs = m.map(Math3d.v2a)
        return [
            new Vector3d(xs[0][0], xs[1][0], xs[2][0]),
            new Vector3d(xs[0][1], xs[1][1], xs[2][1]),
            new Vector3d(xs[0][2], xs[1][2], xs[2][2])
        ]
    }

    /**  vector to array of numbers. */
    private static v2a(v: Vector3d): Array<number> {
        return [v.x(), v.y(), v.z()]
    }

    /** array of numbers to vector. */
    private static a2v(a: Array<number>): Vector3d {
        if (a.length != 3) {
            throw new RangeError("Array must contain 3 elements")
        }
        return new Vector3d(a[0], a[1], a[2])
    }

}

/**
 * Geodetic calculations assuming a spherical earth model.
 */
export class Geometry3d {

    private constructor() { }

    private static readonly NORTH_POLE = new Vector3d(0, 0, 1)

    /**
     * Antipode of given position: the horizontal position on the surface of
     * the Earth which is diametrically opposite to given position.
     */
    static antipode(p: Vector3d): Vector3d {
        return Math3d.scale(p, -1)
    }

    /**
     * Computes the destination position from given position having
     * travelled the given distance on the given initial bearing (compass angle) (bearing will normally vary
     * before destination is reached) and using the given earth radius.
     */
    static destination(p: Vector3d, b: Angle, distance: Length, earthRadius: Length): Vector3d {
        const d = distance.metres()
        if (d === 0.0) {
            return p
        }
        const r = earthRadius.metres()
        /* east direction vector at p */
        const ed = Math3d.unit(Math3d.cross(Geometry3d.NORTH_POLE, p))
        /* north direction vector at p */
        const nd = Math3d.cross(p, ed)
        /* central angle */
        const ta = Angle.central(d, r)
        /* unit vector in the direction of the azimuth */
        const de = Math3d.add(Math3d.scale(nd, Angle.cos(b)), Math3d.scale(ed, Angle.sin(b)))
        return Math3d.add(Math3d.scale(p, Angle.cos(ta)), Math3d.scale(de, Angle.sin(ta)))
    }

    /**
     * Determines whether the given position is inside the polygon defined by
     * the given list of positions.
     *
     * Notes:
     * - the polygon can be closed or opened, i.e. first and last given positions
     *   can be equal.
     * - this method uses the angle summation test: on a sphere, due to spherical
     *   excess, enclosed point angles
     *   will sum to less than 360°, and exterior point angles will be small but
     *   non-zero.
     * - this method always returns false if the list contains less than 3 positions.
     */
    static insideSurface(p: Vector3d, ps: Array<Vector3d>): boolean {
        const len = ps.length;
        if (len == 0) {
            return false;
        }
        if (ps[0] === ps[len - 1]) {
            return Geometry3d.insideSurface(p, ps.slice(0, len - 1))
        }
        if (len < 3) {
            return false
        }

        /* all vectors from p to each vertex */
        const edges = Geometry3d.edges(ps.map(pp => Math3d.sub(p, pp)))

        /* sum subtended angles of each edge (using vector p to determine sign) */
        const sum = edges
            .map(e => Geometry3d.signedAngleBetween(e[0], e[1], p))
            .reduce((acc, cur) => acc + cur, 0)

        return Math.abs(sum) > Math.PI;
    }

    /**
     * Determines whether p0 is right of the great arc from p1 to p2.
     */
    static right(p0: Vector3d, p1: Vector3d, p2: Vector3d): boolean {
        return Math3d.dot(p0, Math3d.cross(p1, p2)) <= 0
    }

    /**
     * Computes the positions (n-vectors) that represent the circle defined
     * by the given centre and radius according to the given earth radius.
     */
    static discretiseCircle(centre: LatLong, radius: Length,
        earthRadius: Length, nbPositions: number): Array<Vector3d> {
        const rm = radius.metres()
        const erm = earthRadius.metres()
        const z = Math.sqrt(erm * erm - rm * rm)

        const rya = (Math.PI / 2.0) - centre.latitude().radians()
        const cy = Math.cos(rya)
        const sy = Math.sin(rya)
        const ry = [
            new Vector3d(cy, 0, sy),
            new Vector3d(0, 1, 0),
            new Vector3d(-sy, 0, cy)
        ]

        const rza = centre.longitude().radians()
        const cz = Math.cos(rza)
        const sz = Math.sin(rza)
        const rz = [
            new Vector3d(cz, -sz, 0),
            new Vector3d(sz, cz, 0),
            new Vector3d(0, 0, 1)
        ]

        return Array.from(new Array(nbPositions), (_, i) => i)
            .map(i => 2 * i * Math.PI / nbPositions)
            /* circle at north pole */
            .map(a => new Vector3d(rm * Math.cos(a), rm * Math.sin(a), z))
            /* rotate each point to circle centre */
            .map(v => Math3d.multmv(rz, Math3d.multmv(ry, v)))
            /* unit. */
            .map(Math3d.unit)
    }

    /**
     * Computes the surface distance (length of geodesic) between the given positions.
     */
    static surfaceDistance(p1: Vector3d, p2: Vector3d, earthRadius: Length): Length {
        const m = Geometry3d.signedAngleBetween(p1, p2, undefined) * earthRadius.metres()
        return Length.ofMetres(m)
    }

    /**
     * Computes the signed angle in radians between n-vectors p1 and p2.
     * If n is 'undefined', the angle is always in [0..pi], in [-pi, pi],
     * otherwise it is signed + if p1 is clockwise looking along n,
     * - in opposite direction.
     */
    private static signedAngleBetween(p1: Vector3d, p2: Vector3d, n: Vector3d | undefined): number {
        const p1xp2 = Math3d.cross(p1, p2)
        const sign = n === undefined ? 1 : Math.sign(Math3d.dot(p1xp2, n))
        const sinO = sign * Math3d.norm(p1xp2)
        const cosO = Math3d.dot(p1, p2)
        return Math.atan2(sinO, cosO)
    }

    /** [p1, p2, p3, p4] to [(p1, p2), (p2, p3), (p3, p4), (p4, p1)]. */
    private static edges(ps: Array<Vector3d>): Array<Array<Vector3d>> {
        const xs = ps.slice(0, ps.length - 1)
        const l = ps[ps.length - 1]
        xs.unshift(l)
        return ps.map((p, i) => [p, xs[i]])
    }

}
