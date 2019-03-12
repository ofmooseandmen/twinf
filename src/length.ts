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
