import { Angle } from "./angle"
import { CoordinateSystems } from "./coordinate-systems"
import { Duration } from "./duration"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { Math3d, Vector3d } from "./space3d"
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
 * Kinematics calculations assuming a spherical earth model.
 */
// TODO: add closed point of approach and intercept
export class Kinematics {

    /**
     * Computes the position of given track after given duration has elapsed and using
     * the given earth radius.
     */
    static position(track: Track, duration: Duration, earthRadius: Length): LatLong {
        const c = Kinematics.course(track.pos(), track.bearing())
        const a = track.speed().metresPerSecond() / earthRadius.metres() * duration.seconds()
        const p0 = CoordinateSystems.latLongToGeocentric(track.pos())
        const pt = Math3d.add(Math3d.scale(p0, Math.cos(a)), Math3d.scale(c, Math.sin(a)))
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

    private static rx(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(1, 0, 0),
            new Vector3d(0, c, s),
            new Vector3d(0, -s, c)
        ]
    }

    private static ry(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, 0, -s),
            new Vector3d(0, 1, 0),
            new Vector3d(s, 0, c)
        ]
    }

    private static rz(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, s, 0),
            new Vector3d(-s, c, 0),
            new Vector3d(0, 0, 1)
        ]
    }

}
