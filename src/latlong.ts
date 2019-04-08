import { Angle } from "./angle"

export class LatLong {

    private readonly _latitude: Angle
    private readonly _longitude: Angle

    constructor(latitude: Angle, longitude: Angle) {
        this._latitude = latitude
        this._longitude = longitude
    }

    static ofDegrees(latitude: number, longitude: number): LatLong {
        return new LatLong(Angle.ofDegrees(latitude), Angle.ofDegrees(longitude))
    }

    /**
     * LatLong from object literal.
     */
    static fromLiteral(data: any): LatLong {
        const lat = Angle.fromLiteral(data["_latitude"])
        const lon = Angle.fromLiteral(data["_longitude"])
        return new LatLong(lat, lon)
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
