import { Angle } from "./angle"
import { CoordinateSystems } from "./coordinate-systems"
import { Duration } from "./duration"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { Math3d, InternalGeodetics, Vector3d } from "./space3d"
import { Speed } from "./speed"

/**
 * A track represents the state of a vehicle by its current position, bearing and speed.
 */
export class Track {

    private readonly _pos: LatLong
    private readonly _bearing: Angle
    private readonly _speed: Speed

    constructor(pos: LatLong, bearing: Angle, speed: Speed) {
        this._pos = pos
        this._bearing = bearing
        this._speed = speed
    }
    /**
     * position of the track.
     */
    pos(): LatLong {
        return this._pos
    }

    /**
     * bearing of the track.
     */
    bearing(): Angle {
        return this._bearing
    }

    /**
     * speed of the track.
     */
    speed(): Speed {
        return this._speed
    }

}

/**
 * Time to, and distance at, closest point of approach(CPA) as well as position of both tracks at CPA.
 */
export class Cpa {
    private readonly _time: Duration
    private readonly _distance: Length
    private readonly _position1: LatLong
    private readonly _position2: LatLong

    constructor(time: Duration, distance: Length,
        position1: LatLong, position2: LatLong) {
        this._time = time
        this._distance = distance
        this._position1 = position1
        this._position2 = position2
    }

    /**
     * Time to closest point of approach between the two tracks.
     */
    time(): Duration {
        return this._time
    }

    /**
     * Distance from either track position to the closest point of approach.
     */
    distance(): Length {
        return this._distance
    }

    /**
     * Position of the first track at the closest point of approach.
     */
    position1(): LatLong {
        return this._position1
    }

    /**
     * Position of the second track at the closest point of approach.
     */
    position2(): LatLong {
        return this._position2
    }

}


/**
 * Kinematics calculations assuming a spherical earth model.
 */
// TODO: intercept
export class Kinematics {

    private constructor() { }

    /**
     * Computes the closest point of approach between the given tracks and using
     * the given earth radius. Returns undefined if closest point of approach is in
     * the past (i.e. the two tracks are diverging away - note that if they keep travelling
     * they will converge again since they are following great circles).
     */
    static cpa(track1: Track, track2: Track, earthRadius: Length): Cpa | undefined {
        const c1 = Kinematics.course(track1.pos(), track1.bearing())
        const c2 = Kinematics.course(track2.pos(), track2.bearing())
        const earthRadiusMetres = earthRadius.metres()
        const p1 = CoordinateSystems.latLongToGeocentric(track1.pos())
        const p2 = CoordinateSystems.latLongToGeocentric(track2.pos())
        const s1 = track1.speed().metresPerSecond()
        const s2 = track2.speed().metresPerSecond()
        const t = Kinematics.timeToCpa(p1, c1, s1, p2, c2, s2, earthRadiusMetres)
        if (t === undefined) {
            return undefined
        }
        const cp1 = Kinematics._position(p1, s1, c1, t, earthRadiusMetres)
        const cp2 = Kinematics._position(p2, s2, c2, t, earthRadiusMetres)
        const d = InternalGeodetics.surfaceDistance(cp1, cp2, earthRadius)
        return new Cpa(
            Duration.ofSeconds(t),
            d,
            CoordinateSystems.geocentricToLatLong(cp1),
            CoordinateSystems.geocentricToLatLong(cp2))
    }

    /**
     * Computes the position of given track after given duration has elapsed and using
     * the given earth radius.
     */
    static position(track: Track, duration: Duration, earthRadius: Length): LatLong {
        const course = Kinematics.course(track.pos(), track.bearing())
        const p0 = CoordinateSystems.latLongToGeocentric(track.pos())
        const pt = Kinematics._position(p0, track.speed().metresPerSecond(), course,
            duration.seconds(), earthRadius.metres())
        return CoordinateSystems.geocentricToLatLong(pt)
    }

    private static course(p: LatLong, b: Angle): Vector3d {
        const lat = p.latitude()
        const lon = p.longitude()
        const _rx = Kinematics.rx(b)
        const _ry = Kinematics.ry(lat)
        const _rz = Kinematics.rz(Angle.ofDegrees(-lon.degrees()))
        const r = Math3d.multmm(Math3d.multmm(_rz, _ry), _rx)
        return new Vector3d(r[0].z(), r[1].z(), r[2].z())
    }

    private static rx(a: Angle): ReadonlyArray<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(1, 0, 0),
            new Vector3d(0, c, s),
            new Vector3d(0, -s, c)
        ]
    }

    private static ry(a: Angle): ReadonlyArray<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, 0, -s),
            new Vector3d(0, 1, 0),
            new Vector3d(s, 0, c)
        ]
    }

    private static rz(a: Angle): ReadonlyArray<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, s, 0),
            new Vector3d(-s, c, 0),
            new Vector3d(0, 0, 1)
        ]
    }

    private static _position(p0: Vector3d, speedMs: number, course: Vector3d,
        durSecs: number, earthRadiusMetres: number): Vector3d {
        const a = speedMs / earthRadiusMetres * durSecs
        return Math3d.add(Math3d.scale(p0, Math.cos(a)), Math3d.scale(course, Math.sin(a)))
    }

    /** time to CPA in milliseconds or undefined if in the past. */
    private static timeToCpa(p1: Vector3d, c1: Vector3d, s1: number,
        p2: Vector3d, c2: Vector3d, s2: number, er: number): number | undefined {
        const w1 = s1 / er
        const w2 = s2 / er
        const t = Kinematics.cpaNrRec(p1, c1, w1, p2, c2, w2, 0, 0)
        if (t < 0) {
            return undefined
        }
        return t
    }

    private static cpaA(v10: Vector3d, c10: Vector3d, w1: number, v20: Vector3d, c20: Vector3d, w2: number): number {
        return -(Math3d.dot(Math3d.scale(v10, w1), c20) + Math3d.dot(Math3d.scale(v20, w2), c10))
    }

    private static cpaB(v10: Vector3d, c10: Vector3d, w1: number, v20: Vector3d, c20: Vector3d, w2: number): number {
        return Math3d.dot(Math3d.scale(c10, w1), v20) + Math3d.dot(Math3d.scale(c20, w2), v10)
    }

    private static cpaC(v10: Vector3d, c10: Vector3d, w1: number, v20: Vector3d, c20: Vector3d, w2: number): number {
        return -(Math3d.dot(Math3d.scale(v10, w1), v20) - Math3d.dot(Math3d.scale(c20, w2), c10))
    }

    private static cpaD(v10: Vector3d, c10: Vector3d, w1: number, v20: Vector3d, c20: Vector3d, w2: number): number {
        return Math3d.dot(Math3d.scale(c10, w1), c20) - Math3d.dot(Math3d.scale(v20, w2), v10)
    }

    private static cpaFt(cw1t: number, cw2t: number, sw1t: number, sw2t: number,
        a: number, b: number, c: number, d: number): number {
        return a * sw1t * sw2t + b * cw1t * cw2t + c * sw1t * cw2t + d * cw1t * sw2t
    }

    private static cpaDft(w1: number, w2: number, cw1t: number, cw2t: number,
        sw1t: number, sw2t: number, a: number, b: number, c: number, d: number): number {
        return -((c * w2 + d * w1) * sw1t * sw2t) + (d * w2 + c * w1) * cw1t * cw2t +
            (a * w2 - b * w1) * sw1t * cw2t -
            (b * w2 - a * w1) * cw1t * sw2t
    }

    private static cpaStep(v10: Vector3d, c10: Vector3d, w1: number,
        v20: Vector3d, c20: Vector3d, w2: number, t: number): number {
        const cw1t = Math.cos(w1 * t)
        const cw2t = Math.cos(w2 * t)
        const sw1t = Math.sin(w1 * t)
        const sw2t = Math.sin(w2 * t)
        const a = Kinematics.cpaA(v10, c10, w1, v20, c20, w2)
        const b = Kinematics.cpaB(v10, c10, w1, v20, c20, w2)
        const c = Kinematics.cpaC(v10, c10, w1, v20, c20, w2)
        const d = Kinematics.cpaD(v10, c10, w1, v20, c20, w2)
        return Kinematics.cpaFt(cw1t, cw2t, sw1t, sw2t, a, b, c, d)
            / Kinematics.cpaDft(w1, w2, cw1t, cw2t, sw1t, sw2t, a, b, c, d)
    }

    /**
     * Newton-Raphson for CPA time, returned value is in milliseconds,
     * negative if in the past.
     */
    private static cpaNrRec(v10: Vector3d, c10: Vector3d, w1: number,
        v20: Vector3d, c20: Vector3d, w2: number, ti: number, i: number): number {
        if (i === 50) {
            /* no convergence */
            return -1
        }
        const fi = Kinematics.cpaStep(v10, c10, w1, v20, c20, w2, ti)
        const ti1 = ti - fi

        if (Math.abs(fi) < 1e-11) {
            return ti
        }
        return Kinematics.cpaNrRec(v10, c10, w1, v20, c20, w2, ti1, (i + 1))
    }

}
