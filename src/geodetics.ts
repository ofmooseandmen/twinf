import { Angle } from "./angle"
import { Length } from "./length"
import { CoordinateSystems } from "./coordinate-systems"
import { LatLong } from "./latlong"
import { InternalGeodetics, Math3d } from "./space3d"

/**
 * Geodetic calculations assuming a spherical earth model.
 */
export class Geodetics {

    private constructor() { }


    /**
     * Antipode of given position: the horizontal position on the surface of
     * the Earth which is diametrically opposite to given position.
     */
    static antipode(pos: LatLong): LatLong {
        return CoordinateSystems.geocentricToLatLong(
            InternalGeodetics.antipode(CoordinateSystems.latLongToGeocentric(pos))
        )
    }

    /**
     * Computes the destination position from given position having
     * travelled the given distance on the given initial bearing (compass angle) (bearing will normally vary
     * before destination is reached) and using the given earth radius.
     */
    static destination(pos: LatLong, bearing: Angle, distance: Length, earthRadius: Length): LatLong {
        if (distance.metres() === 0.0) {
            return pos
        }
        return CoordinateSystems.geocentricToLatLong(
            InternalGeodetics.destination(CoordinateSystems.latLongToGeocentric(pos), bearing, distance, earthRadius))
    }

    /**
     * Computes the final bearing arriving at p2 from p1 in compass angle.
     * Compass angles are clockwise angles from true north: 0 = north, 90 = east, 180 = south, 270 = west.
     * The final bearing will differ from the 'initialBearing' by varying degrees according to distance and latitude.
     * Returns undefined if both horizontal positions are equal.
     */
    static finalBearing(p1: LatLong, p2: LatLong): Angle | undefined {
        const ib = Geodetics.initialBearing(p2, p1)
        if (ib === undefined) {
            return undefined
        }
        return Angle.normalise(ib, Angle.HALF_CIRCLE)
    }

    /**
     * Computes the initial bearing from p1 to p2 in compass angle.
     * Compass angles are clockwise angles from true north: 0 = north, 90 = east, 180 = south, 270 = west.
     * Returns undefined in both positions are equal.
     */
    static initialBearing(p1: LatLong, p2: LatLong): Angle | undefined {
        if (LatLong.equals(p1, p2)) {
            return undefined
        }
        const v1 = CoordinateSystems.latLongToGeocentric(p1)
        const v2 = CoordinateSystems.latLongToGeocentric(p2)
        /*  great circle through p1 & p2 */
        const gc1 = Math3d.cross(v1, v2)
        /* great circle through p1 & north pole */
        const gc2 = Math3d.cross(v1, InternalGeodetics.NORTH_POLE)
        const signedAng = InternalGeodetics.signedAngleBetween(gc1, gc2, v1)
        return Angle.normalise(Angle.ofRadians(signedAng), Angle.FULL_CIRCLE)
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
    static insideSurface(p: LatLong, ps: ReadonlyArray<LatLong>): boolean {
        return InternalGeodetics.insideSurface(
            CoordinateSystems.latLongToGeocentric(p),
            ps.map(p => CoordinateSystems.latLongToGeocentric(p)))
    }

    /**
     * Computes the position at given fraction between the given positions.
     * Returns p0 if f === 0 and p1 if f === 1
     */
    static interpolate(p0: LatLong, p1: LatLong, f: number): LatLong {
        if (f < 0 || f > 1) {
            throw new Error("fraction must be in range [0..1], was " + f)
        }
        if (f === 0) { return p0 }
        if (f === 1) { return p1 }
        const v0 = CoordinateSystems.latLongToGeocentric(p0)
        const v1 = CoordinateSystems.latLongToGeocentric(p1)
        const res = Math3d.unit(Math3d.add(v0, Math3d.scale(Math3d.sub(v1, v0), f)))
        return CoordinateSystems.geocentricToLatLong(res)
    }

    /**
     * Computes the surface distance (length of geodesic) between the given positions.
     */
    static surfaceDistance(p1: LatLong, p2: LatLong, earthRadius: Length): Length {
        return InternalGeodetics.surfaceDistance(
            CoordinateSystems.latLongToGeocentric(p1),
            CoordinateSystems.latLongToGeocentric(p2),
            earthRadius)
    }

}
