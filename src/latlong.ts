import { Angle } from "./angle"

export class LatLong {

    private readonly _latitude: Angle
    private readonly _longitude: Angle

    constructor(latitude: Angle, longitude: Angle) {
        this._latitude = latitude
        this._longitude = longitude
    }

    static ofDegrees(latitude: number, longitude: number) {
        return new LatLong(Angle.ofDegrees(latitude), Angle.ofDegrees(longitude))
    }

    latitude(): Angle {
        return this._latitude
    }

    longitude(): Angle {
        return this._longitude
    }

}
