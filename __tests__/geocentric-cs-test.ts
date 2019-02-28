import { CoordinateSystems } from "../src/coordinate-systems"
import { LatLong } from "../src/latlong"
import { Math3d, Vector3d } from "../src/space3d"

import { assertLLEquals, assertV3Equals } from "./util"

describe("geocentric coordinate system", () => {

    test("North pole <=> geocentric", () => {
        const ll = LatLong.ofDegrees(90, 0)
        const nv = new Vector3d(0, 0, 1)
        assertV3Equals(nv, CoordinateSystems.latLongToGeocentric(ll))
        expect(CoordinateSystems.geocentricToLatLong(nv)).toEqual(ll)
    })

    test("South pole <=> geocentric", () => {
        const ll = LatLong.ofDegrees(-90, 0)
        const nv = new Vector3d(0, 0, -1)
        assertV3Equals(nv, CoordinateSystems.latLongToGeocentric(ll))
        expect(CoordinateSystems.geocentricToLatLong(nv)).toEqual(ll)
    })

    test("45N45E <=> geocentric", () => {
        const ll = LatLong.ofDegrees(45, 45)
        const nv = new Vector3d(0.5, 0.5, Math.sin(Math.PI / 4.0))
        assertV3Equals(nv, CoordinateSystems.latLongToGeocentric(ll))
        expect(CoordinateSystems.geocentricToLatLong(nv)).toEqual(ll)
    })

    test("latLongToGeocentric(geocentricToLatLong(nv)) === nv", () => {
        const nv = Math3d.unit(new Vector3d(1, 5, 4))
        assertV3Equals(nv,
            CoordinateSystems.latLongToGeocentric(CoordinateSystems.geocentricToLatLong(nv)))
    })

    test("geocentricToLatLong(latLongToGeocentric(ll)) === ll", () => {
        const ll = LatLong.ofDegrees(48.6921, 6.1844)
        assertLLEquals(ll,
            CoordinateSystems.geocentricToLatLong(CoordinateSystems.latLongToGeocentric(ll)))
    })

})
