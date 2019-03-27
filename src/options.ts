/**
 * Rendering options.
 */
export class RenderingOptions {

    private readonly _fps: number
    private readonly _circlePositions: number
    private readonly _miterLimit: number

    constructor(fps: number, circlePositions: number, miterLimit: number) {
        this._fps = fps
        this._circlePositions = circlePositions
        this._miterLimit = miterLimit
    }

    /**
     * Number of frame per seconds.
     */
    fps(): number {
        return this._fps
    }

    /**
     * Number of positions when discretising a circle.
     */
    circlePositions(): number {
        return this._circlePositions
    }
    /**
     * Value of the miter limit when rendering wide polylines. If the length
     * of the miter divide by the half width of the polyline is greater than this
     * value, the miter will be ignored and normal to the line segment is used.
     */
    miterLimit(): number {
        return this._miterLimit
    }

}
