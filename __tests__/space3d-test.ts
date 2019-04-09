import { CoordinateSystems } from '../src/coordinate-systems'
import { LatLong } from '../src/latlong'
import { Length } from '../src/length'
import { InternalGeodetics, Math3d, Vector3d } from '../src/space3d'

import * as U from './util'

describe('Math3d', () => {

    test('Add 2 vectors', () => {
        const v1 = new Vector3d(1, 2, 3)
        const v2 = new Vector3d(4, 5, 6)
        expect(Math3d.add(v1, v2)).toEqual(new Vector3d(5, 7, 9))
    })

    test('Subtract 2 vectors', () => {
        const v1 = new Vector3d(1, 2, 3)
        const v2 = new Vector3d(3, 2, 1)
        expect(Math3d.sub(v1, v2)).toEqual(new Vector3d(-2, 0, 2))
    })

    test('Cross product of 2 vectors', () => {
        const v1 = new Vector3d(1, 5, 4)
        const v2 = new Vector3d(2, 6, 5)
        expect(Math3d.cross(v1, v2)).toEqual(new Vector3d(1, 3, -4))
    })

    test('Dot product of 2 vectors', () => {
        const v1 = new Vector3d(1, 5, 4)
        const v2 = new Vector3d(2, 6, 5)
        expect(Math3d.dot(v1, v2)).toEqual(52)
    })

    test('Norm of vector', () => {
        expect(Math3d.norm(new Vector3d(2, 6, 5))).toBeCloseTo(8.06)
    })

    test('Multiplication of 3*3 matrix by vector', () => {
        const m = [
            new Vector3d(1, 2, 3),
            new Vector3d(4, 5, 6),
            new Vector3d(7, 8, 9)
        ]
        const v = new Vector3d(10, 20, 30)
        expect(Math3d.multmv(m, v)).toEqual(new Vector3d(140, 320, 500))
    })

    test('Multiplication of 2 3*3 matrices', () => {
        const m1 = [
            new Vector3d(1, 2, 3),
            new Vector3d(4, 5, 6),
            new Vector3d(7, 8, 9)
        ]
        const m2 = [
            new Vector3d(10, 11, 12),
            new Vector3d(13, 14, 15),
            new Vector3d(16, 17, 18)
        ]
        const e = [
            new Vector3d(84, 90, 96),
            new Vector3d(201, 216, 231),
            new Vector3d(318, 342, 366)
        ]
        expect(Math3d.multmm(m1, m2)).toEqual(e)
    })

    test('Scale vector by number', () => {
        expect(Math3d.scale(new Vector3d(1, 5, 4), 2)).toEqual(new Vector3d(2, 10, 8))
    })

    test('Unit vector', () => {
        expect(Math3d.norm(Math3d.unit(new Vector3d(1, 5, 4)))).toEqual(1)
    })

    test('Transpose 3*3 matrix', () => {
        const m = [new Vector3d(1, 2, 3), new Vector3d(4, 5, 6), new Vector3d(7, 8, 9)]
        const e = [new Vector3d(1, 4, 7), new Vector3d(2, 5, 8), new Vector3d(3, 6, 9)]
        expect(Math3d.transpose(m)).toEqual(e)
    })

})

describe('InternalGeodetics', () => {

    const earthRadius = Length.ofMetres(6371000)

    test('right returns true if position is right of line, false otherwise',
        () => {
            expect(InternalGeodetics.right(U.ystad, U.helsingborg, U.kristianstad)).toBe(true)
            expect(InternalGeodetics.right(U.ystad, U.kristianstad, U.helsingborg)).toBe(false)
            expect(InternalGeodetics.right(U.malmo, U.lund, U.helsingborg)).toBe(false)
            expect(InternalGeodetics.right(U.malmo, U.helsingborg, U.lund)).toBe(true)
        })

    test('discretiseCircle returns the list of n-vectors representing the circle',
        () => {
            const r = Length.ofMetres(2000)
            const centre = LatLong.ofDegrees(55.6050, 13.0038)
            const vc = CoordinateSystems.latLongToGeocentric(centre)
            const distances = InternalGeodetics.discretiseCircle(centre, r, earthRadius, 10)
                .map(v => InternalGeodetics.surfaceDistance(vc, v, earthRadius))
            /* assert distance up to 0.001 metres. */
            distances.forEach(d => expect(d.metres()).toBeCloseTo(r.metres(), 3))
        })

})
