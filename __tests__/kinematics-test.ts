import { Angle } from "../src/angle"
import { Duration } from "../src/duration"
import { LatLong } from "../src/latlong"
import { Length } from "../src/length"
import { Kinematics, Track } from "../src/kinematics"
import { Speed } from "../src/speed"

describe("Kinematics", () => {

    const earthRadius = Length.ofMetres(6371008.7714)

    describe("position", () => {
        test("computes position at t from p0, bearing and speed", () => {
            const p0 = LatLong.ofDegrees(53.32055556, -1.72972222)
            const p1 = LatLong.ofDegrees(53.1882691, 0.1332741)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(124.8))
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p1)
        })

        test("handles poles", () => {
            /*
             * distance between poles assuming a spherical earth (WGS84) = 20015.114352200002km
             * track at north pole travelling at 20015.114352200002km/h and true north reaches the
             * south pole after 1 hour.
             */
            const t = new Track(
                LatLong.ofDegrees(90, 0),
                Angle.ofDegrees(0),
                Speed.ofKilometresPerHour(20015.114352200002))
            const p1 = LatLong.ofDegrees(-90, 180)
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p1)
        })

        test("return p0 if speed is 0", () => {
            const p0 = LatLong.ofDegrees(53.32055556, 53.32055556)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(0))
            expect(Kinematics.position(t, Duration.ofHours(1), earthRadius)).toEqual(p0)
        })

        test("return p0 if duration is 0", () => {
            const p0 = LatLong.ofDegrees(53.32055556, 53.32055556)
            const t = new Track(p0, Angle.ofDegrees(96.0217), Speed.ofKilometresPerHour(500))
            expect(Kinematics.position(t, Duration.ofSeconds(0), earthRadius)).toEqual(p0)
        })
    })

})
