export class Angle {

    private readonly degs: number
    private readonly rads: number

    private constructor(degs: number, rads: number) {
        this.degs = degs
        this.rads = rads
    }

    static ofDegrees(degs: number) {
        const rads = degs * Math.PI / 180.0
        return new Angle(degs, rads)
    }

    static ofRadians(rads: number) {
        const degs = rads / Math.PI * 180.0
        return new Angle(degs, rads)
    }

    /**
     * Computes the central angle from the given arc length and given radius.gle
     */
    static central(l: number, r: number) {
        return Angle.ofRadians(l / r)
    }

    static cos(a: Angle): number {
        return Math.cos(a.rads)
    }

    static sin(a: Angle): number {
        return Math.sin(a.rads)
    }

    static atan2(y: number, x: number): Angle {
        return Angle.ofRadians(Math.atan2(y, x))
    }

    degrees(): number {
        return this.degs
    }

    radians(): number {
        return this.rads
    }

}
