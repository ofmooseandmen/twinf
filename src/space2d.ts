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
        return (p2.x() - p1.x()) * (p0.y() - p1.y()) - (p2.y() - p1.y()) * (p0.x() - p1.x()) <= 0
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
        const len = ps.length
        if (len < 3) {
            return false
        }
        // ray casting
        const x = p.x();
        const y = p.y();
        let inside = false;
        for (let i = 0, j = len - 1; i < len; j = i++) {
            const xi = ps[i].x();
            const yi = ps[i].y();
            const xj = ps[j].x();
            const yj = ps[j].y();
            const intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Computes the 2D points that represent the circle defined
     * by the given centre and radius in pixels.
     */
    static discretiseCircle(centre: Vector2d, radius: number,
        nbPositions: number): Array<Vector2d> {
        return Array.from(new Array(nbPositions), (_, i) => i)
            .map(i => 2 * i * Math.PI / nbPositions)
            /* circle at (0, 0), translated to centre */
            .map(a => new Vector2d(
                radius * Math.cos(a) + centre.x(),
                radius * Math.sin(a) + centre.y()
            ))
    }

}
