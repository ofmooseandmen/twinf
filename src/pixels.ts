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

    x(): number {
        return this._x
    }

    y(): number {
        return this._y
    }

}
