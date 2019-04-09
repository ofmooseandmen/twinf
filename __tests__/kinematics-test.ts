import { Angle } from '../src/angle'
import { Duration } from '../src/duration'
import { Geodetics } from '../src/geodetics'
import { LatLong } from '../src/latlong'
import { Length } from '../src/length'
import { Kinematics, Track } from '../src/kinematics'
import { Speed } from '../src/speed'

describe('Kinematics', () => {

    const earthRadius = Length.ofMetres(6371008.7714)

    describe('closest point of approach', () => {
        test('handles trailing tracks', () => {
            const p1 = LatLong.ofDegrees(20, 30)
            const px = Geodetics.destination(
                p1, Angle.ofDegrees(20), Length.ofKilometres(1), earthRadius)
            const p2 = Geodetics.interpolate(p1, px, 0.25)
            const b1 = Geodetics.initialBearing(p1, px)
            const b2 = Geodetics.initialBearing(p2, px)
            if (b1 === undefined || b2 === undefined) {
                fail('Could not compute either track bearing')
            }
            const t1 = new Track(p1, b1, Speed.ofKnots(400))
            const t2 = new Track(p2, b2, Speed.ofKnots(400))
            const cpa = Kinematics.cpa(t1, t2, earthRadius)
            /*
             * any time is correct but it should be close to zero since that's
             * our initial value
             */
            if (cpa === undefined) {
                fail('Could not compute CPA')
            }
            expect(cpa.time().milliseconds()).toBeLessThan(5000)
            expect(cpa.distance().metres()).toEqual(250.0074)
        })

        test('handles heading tracks', () => {
            const p1 = LatLong.ofDegrees(20, 30)
            const p2 = LatLong.ofDegrees(21, 31)
            const b1 = Geodetics.initialBearing(p1, p2)
            const b2 = Geodetics.initialBearing(p2, p1)
            if (b1 === undefined || b2 === undefined) {
                fail('Could not compute either track bearing')
            }
            const t1 = new Track(p1, b1, Speed.ofKnots(400))
            const t2 = new Track(p2, b2, Speed.ofKnots(400))
            const cpa = Kinematics.cpa(t1, t2, earthRadius)
            if (cpa === undefined) {
                fail('Could not compute CPA')
            }
            /*
             * distance between p1 and p2 = 152.354309 km
             * speed = 740.8 km/h
             * time = 152.354309 / 740.8 / 2
             */
            expect(cpa.time().milliseconds()).toEqual(370191)
            expect(cpa.distance().metres()).toBeCloseTo(0, 3)
        })

        test('handles tracks at the same position', () => {
            const p = LatLong.ofDegrees(20, 30)
            const t1 = new Track(p, Angle.ofDegrees(45), Speed.ofKnots(300))
            const t2 = new Track(p, Angle.ofDegrees(133), Speed.ofKnots(500))
            const cpa = Kinematics.cpa(t1, t2, earthRadius)
            if (cpa === undefined) {
                fail('Could not compute CPA')
            }
            expect(cpa.time().milliseconds()).toEqual(0)
            expect(cpa.distance().metres()).toEqual(0)
        })

        test('computes time to CPA, positions and distance at CPA', () => {
            const p1 = LatLong.ofDegrees(20, -60)
            const b1 = Angle.ofDegrees(10)
            const s1 = Speed.ofKnots(15)
            const p2 = LatLong.ofDegrees(34, -50)
            const b2 = Angle.ofDegrees(220)
            const s2 = Speed.ofKnots(300)
            const t1 = new Track(p1, b1, s1)
            const t2 = new Track(p2, b2, s2)
            const cpa = Kinematics.cpa(t1, t2, earthRadius)
            if (cpa === undefined) {
                fail('Could not compute CPA')
            }
            expect(cpa.time().milliseconds()).toEqual(11396155)
            expect(cpa.distance().kilometres()).toEqual(124.2317308)
        })

        test('returns undefined if time to CPA is in the past', () => {
            const t1 = new Track(
                LatLong.ofDegrees(30, 30),
                Angle.ofDegrees(45),
                Speed.ofKnots(400))
            const t2 = new Track(
                LatLong.ofDegrees(30.01, 29.99),
                Angle.ofDegrees(315),
                Speed.ofKnots(400))
            expect(Kinematics.cpa(t1, t2, earthRadius)).toBeUndefined()
        })

    })

    describe('position', () => {
        test('computes position at t from p0, bearing and speed', () => {
            const p0 = LatLong.ofDegrees(53.32055556, -1.72972222)
            const p1 = LatLong.ofDegrees(53.1882691, 0.1332741)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(124.8))
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p1)
        })

        test('handles poles', () => {
            /*
             * distance between poles assuming a spherical earth (WGS84) = 20015.114352200002km
             * track at north pole travelling at 20015.114352200002km/h and true north reaches the
             * south pole after 1 hour.
             */
            const t = new Track(
                LatLong.ofDegrees(90, 0),
                Angle.ZERO,
                Speed.ofKilometresPerHour(20015.114352200002))
            const p1 = LatLong.ofDegrees(-90, 180)
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p1)
        })

        test('return p0 if speed is 0', () => {
            const p0 = LatLong.ofDegrees(53.32055556, 53.32055556)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(0))
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p0)
        })

        test('return p0 if duration is 0', () => {
            const p0 = LatLong.ofDegrees(53.32055556, 53.32055556)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(500))
            expect(Kinematics.position(t, Duration.ZERO, earthRadius)).toEqual(p0)
        })
    })

})
