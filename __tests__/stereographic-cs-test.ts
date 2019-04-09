import { LatLong } from '../src/latlong'
import { Length } from '../src/length'
import { Vector2d } from '../src/space2d'
import { CoordinateSystems } from '../src/coordinate-systems'

import { assertV2Equals, assertV3Equals } from './util'

describe('stereographic coordinate system', () => {

    const c = LatLong.ofDegrees(-45.8788, 170.5028)
    const r = Length.ofMetres(1000)
    const sp = CoordinateSystems.computeStereographicProjection(c, r)

    test('geocentric to stereographic at projection centre', () => {
        const actual = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(c), sp)
        expect(actual).toEqual(new Vector2d(0, 0))
    })

    test('stereographic to geocentric at projection centre', () => {
        const actual = CoordinateSystems.stereographicToGeocentric(new Vector2d(0, 0), sp)
        expect(actual).toEqual(CoordinateSystems.latLongToGeocentric(c))
    })

    test('geocentric to stereographic', () => {
        const c2 = LatLong.ofDegrees(-27.0, 138.0)
        const r2 = Length.ofMetres(6371008.8)
        const sp2 = CoordinateSystems.computeStereographicProjection(c2, r2)
        const p = LatLong.ofDegrees(-37.8136, 144.9631)
        const actual = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(p), sp2)
        // value from reference implementation
        const expected = new Vector2d(617252.8002717352, -1226216.8406236775)
        expect(actual).toEqual(expected)
    })

    test('geocentricToStereographic(stereographicToGeocentric(st)) == st', () => {
        const pt = new Vector2d(154.0, 451.0)
        const actual = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.stereographicToGeocentric(pt, sp), sp)
        assertV2Equals(pt, actual)
    })

    test('stereographicToGeocentric(geocentricToStereographic(nv)) == nv', () => {
        const nv = CoordinateSystems.latLongToGeocentric(LatLong.ofDegrees(63.8258, 20.2630))
        const actual = CoordinateSystems.stereographicToGeocentric(
            CoordinateSystems.geocentricToStereographic(nv, sp), sp)
        assertV3Equals(nv, actual)
    })

})
