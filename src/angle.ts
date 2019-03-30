/**
 * An angle with a resolution of a milliseconds of a degree.
 * When used as a latitude/longitude this roughly translate to a precision
 * of 30 millimetres at the equator.
 */
export class Angle {

    private readonly milliseconds: number

    private constructor(milliseconds: number) {
        this.milliseconds = milliseconds
    }

    static ofDegrees(degs: number) {
        const ms = Math.round(degs * 3600000.0)
        return new Angle(ms)
    }

    static ofRadians(rads: number) {
        const degs = rads / Math.PI * 180.0
        return Angle.ofDegrees(degs)
    }

    /**
     * Computes the central angle from the given arc length and given radius.gle
     */
    static central(l: number, r: number) {
        return Angle.ofRadians(l / r)
    }

    static cos(a: Angle): number {
        return Math.cos(a.radians())
    }

    static sin(a: Angle): number {
        return Math.sin(a.radians())
    }

    static atan2(y: number, x: number): Angle {
        return Angle.ofRadians(Math.atan2(y, x))
    }

    degrees(): number {
        return this.milliseconds / 3600000.0
    }

    radians(): number {
        return this.degrees() * Math.PI / 180.0
    }

}

export class Length {

    private readonly _metres: number

    private constructor(metres: number) {
        this._metres = metres
    }

    static ofMetres(metres: number) {
        return new Length(metres)
    }

    static ofKilometres(kilometres: number) {
        return Length.ofMetres(kilometres * 1000.0)
    }

    static ofNauticalMiles(nauticalMiles: number) {
        return Length.ofMetres(nauticalMiles * 1852.0)
    }

    metres(): number {
        return this._metres
    }

    kilometres(): number {
        return this._metres / 1000.0
    }

    nauticalMiles(): number {
        return this._metres / 1852.0
    }

    scale(n: number): Length {
        return new Length(this._metres * n)
    }

}
