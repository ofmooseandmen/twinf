/**
 * A speed with a resolution of 1 millimetre per hour.
 */
export class Speed {

    private readonly mmPerHour: number

    private constructor(mmPerHour: number) {
        this.mmPerHour = mmPerHour
    }

    /**
     * Speed from given amount of metres per second.
     */
    static ofMetresPerSecond(mps: number): Speed {
        return new Speed(Math.round(mps * 3600000.0))
    }

    /**
     * Speed from given amount of kilometres per hour.
     */
    static ofKilometresPerHour(kph: number): Speed {
        return new Speed(Math.round(kph * 1e+6))
    }

    /**
     * Speed from given amount of miles per hour.
     */
    static ofMilesPerHour(mph: number): Speed {
        return new Speed(Math.round(mph * 1609344.0))
    }

    /**
     * Speed from given amount of knots.
     */
    static ofKnots(kt: number): Speed {
        return new Speed(Math.round(kt * 1852000.0))
    }

    /**
     * Speed from given amount feet per second.
     */
    static feetPerSecond(fps: number): Speed {
        return new Speed(Math.round(fps * 1097280.0))
    }

    /**
     * Speed to metres per second.
     */
    metresPerSecond(): number {
        return this.mmPerHour / 3600000.0
    }

    /**
     * Speed to kilometres per hour.
     */
    kilometresPerHour(): number {
        return this.mmPerHour / 1e+6
    }

    /**
     * Speed to miles per hour.
     */
    milesPerHour(): number {
        return this.mmPerHour / 1609344.0
    }

    /**
     * Speed to knots.
     */
    knots(): number {
        return this.mmPerHour / 1852000.0
    }

    /**
     * Speed to feet per second.
     */
    feetPerSecond(): number {
        return this.mmPerHour / 1097280.0
    }

}
