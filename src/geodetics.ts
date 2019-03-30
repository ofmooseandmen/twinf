import { Angle } from "./angle"
import { Length } from "./length"
import { CoordinateSystems } from "./coordinate-systems"
import { LatLong } from "./latlong"
import { Geometry3d } from "./space3d"

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
            Geometry3d.antipode(CoordinateSystems.latLongToGeocentric(pos))
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
            Geometry3d.destination(CoordinateSystems.latLongToGeocentric(pos), bearing, distance, earthRadius))
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
        return Geometry3d.insideSurface(
            CoordinateSystems.latLongToGeocentric(p),
            ps.map(p => CoordinateSystems.latLongToGeocentric(p)))
    }

    /**
     * Computes the surface distance (length of geodesic) between the given positions.
     */
    static surfaceDistance(p1: LatLong, p2: LatLong, earthRadius: Length): Length {
        return Geometry3d.surfaceDistance(
            CoordinateSystems.latLongToGeocentric(p1),
            CoordinateSystems.latLongToGeocentric(p2),
            earthRadius)
    }

}
