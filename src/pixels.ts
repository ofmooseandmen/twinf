/**
 * Offset in pixels from a point on the canvas.
 * x axis is right and y axis is down.
 */
export class Offset {

    private readonly _x: number
    private readonly _y: number

    constructor(x: number, y: number) {
        this._x = x
        this._y = y
    }

    /**
     * Offset from object literal.
     */
    static fromLiteral(data: any): Offset {
        const x = data["_x"]
        const y = data["_y"]
        return new Offset(x, y)
    }

    x(): number {
        return this._x
    }

    y(): number {
        return this._y
    }

}
