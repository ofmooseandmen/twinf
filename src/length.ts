/**
 * A length with a resolution of 0.1 millimetre.
 */
export class Length {

    private readonly tenthOfMm: number

    private constructor(tenthOfMm: number) {
        this.tenthOfMm = tenthOfMm
    }

    static ofFeet(feet: number): Length {
        return new Length(Math.round(feet * 3048.0))
    }

    static ofMetres(metres: number): Length {
        return new Length(Math.round(metres * 10000.0))
    }

    static ofKilometres(kilometres: number): Length {
        return new Length(Math.round(kilometres * 10000000.0))
    }

    static ofNauticalMiles(nauticalMiles: number): Length {
        return new Length(Math.round(nauticalMiles * 18520000.0))
    }

    /**
     * Length from object literal.
     */
    static fromLiteral(data: any): Length {
        return new Length(data["tenthOfMm"])
    }

    feet(): number {
        return this.tenthOfMm / 3048.0
    }

    metres(): number {
        return this.tenthOfMm / 10000.0
    }

    kilometres(): number {
        return this.tenthOfMm / 10000000.0
    }

    nauticalMiles(): number {
        return this.tenthOfMm / 18520000.0
    }

    scale(n: number): Length {
        return new Length(this.tenthOfMm * n)
    }

}
