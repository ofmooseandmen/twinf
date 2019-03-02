import { Angle } from "./angle"
import { LatLong } from "./latlong"
import { Vector3d, Math3d } from "./space3d"

/**
 * Geodetic calculations assuming a spherical earth model.
 */
export class Geodetics {

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
     * Computes the destination position from given positio having
     * travelled the given distance on the given initial bearing (compass angle) (bearing will normally vary
     * before destination is reached) and using the given earth radius.
     */
    static destination(p: Vector3d, b: Angle, d: number, r: number) {
        if (d === 0.0) {
            return p
        }
        /* east direction vector at p */
        const ed = Math3d.unit(Math3d.cross(Geodetics.NORTH_POLE, p))
        /* north direction vector at */
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
            return Geodetics.insideSurface(p, ps.slice(0, len - 1))
        }
        if (len < 3) {
            return false
        }

        /* all vectors from p to each vertex */
        const edges = Geodetics.edges(ps.map(pp => Math3d.sub(p, pp)))

        /* sum subtended angles of each edge (using vector p to determine sign) */
        const sum = edges
            .map(e => Geodetics.signedAngleBetween(e[0], e[1], p))
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
    static discretiseCircle(centre: LatLong, radius: number,
        earthRadius: number, nbPositions: number): Array<Vector3d> {

        const z = Math.sqrt(earthRadius * earthRadius - radius * radius)

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
            .map(a => new Vector3d(radius * Math.cos(a), radius * Math.sin(a), z))
            /* rotate each point to circle centre */
            .map(v => Math3d.multmv(rz, Math3d.multmv(ry, v)))
            /* unit. */
            .map(Math3d.unit)
    }

    /**
     * Computes the surface distance (length of geodesic) between the given positions.
     */
    static surfaceDistance(p1: Vector3d, p2: Vector3d, earthRadius: number): number {
        return Geodetics.signedAngleBetween(p1, p2, undefined) * earthRadius
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
