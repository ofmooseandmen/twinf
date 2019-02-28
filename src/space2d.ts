export class Vector2d {

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

export class Geometry2d {

    private constructor() { }

    /**
     * Determines whether p0 is right of the line from p1 to p2.
     */
    static right(p0: Vector2d, p1: Vector2d, p2: Vector2d): boolean {
        return false
    }

    /**
     * Determines whether the given position is inside the polygon defined by
     * the given list of positions.
     *
     * Notes:
     * - the polygon can be closed or opened, i.e. first and last given positions
     *   can be equal.
     * - this method always returns false if the list contains less than 3 positions.
     */
    static insideSurface(p: Vector2d, ps: Array<Vector2d>): boolean {
        return false
    }

}
