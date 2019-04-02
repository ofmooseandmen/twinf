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

    /**
     * Determines whether both given lat/long are equals.
     */
    static equals(ll1: LatLong, ll2: LatLong): boolean {
        return ll1.latitude().degrees() === ll2.latitude().degrees()
            && ll1.longitude().degrees() === ll2.longitude().degrees()
    }

}
