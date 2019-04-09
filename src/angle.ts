/**
 * An angle with a resolution of a milliseconds of a degree.
 * When used as a latitude/longitude this roughly translate to a precision
 * of 30 millimetres at the equator.
 */
export class Angle {

    static readonly ZERO: Angle = Angle.ofDegrees(0)

    static readonly HALF_CIRCLE: Angle = Angle.ofDegrees(180)

    static readonly FULL_CIRCLE: Angle = Angle.ofDegrees(360)

    private readonly milliseconds: number

    private constructor(milliseconds: number) {
        this.milliseconds = milliseconds
    }

    static ofDegrees(degs: number): Angle {
        const ms = Math.round(degs * 3600000.0)
        return new Angle(ms)
    }

    static ofRadians(rads: number): Angle {
        const degs = rads / Math.PI * 180.0
        return Angle.ofDegrees(degs)
    }

    /**
     * Angle from object literal.
     */
    static fromLiteral(data: any): Angle {
        return new Angle(data['milliseconds'])
    }

    /**
     * Computes the central angle from the given arc length and given radius.gle
     */
    static central(l: number, r: number): Angle {
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

    /**
     * Normalises the given angle to [0, n].
     */
    static normalise(a: Angle, n: Angle): Angle {
        const degs = (a.degrees() + n.degrees()) % 360.0
        return Angle.ofDegrees(degs)
    }

    degrees(): number {
        return this.milliseconds / 3600000.0
    }

    radians(): number {
        return this.degrees() * Math.PI / 180.0
    }

}
