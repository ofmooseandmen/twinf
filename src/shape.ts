import { Colour } from "./colour"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { Vector2d } from "./space2d"

export class Stroke {

    private readonly _colour: Colour
    private readonly _width: number

    constructor(colour: Colour, width: number) {
        this._colour = colour
        this._width = width
    }

    colour(): Colour {
        return this._colour
    }

    width(): number {
        return this._width
    }
}

export class Paint {

    private readonly _stroke: Stroke | undefined
    private readonly _fill: Colour | undefined

    private constructor(stroke: Stroke | undefined, fill: Colour | undefined) {
        this._stroke = stroke
        this._fill = fill
    }

    static stroke(stroke: Stroke) {
        return new Paint(stroke, undefined)
    }

    static fill(fill: Colour) {
        return new Paint(undefined, fill)
    }

    /**
     * Paint with both a fill and stroke.
     */
    static complete(stroke: Stroke, fill: Colour) {
        return new Paint(stroke, fill)
    }

    stroke(): Stroke | undefined {
        return this._stroke
    }

    fill(): Colour | undefined {
        return this._fill
    }

}

// FIXME: add
// - GeoArc
// - GeoText
// - GeoSymbol
// - GeoRelativeArc
// - GeoRelativeText
// - GeoRelativeSymbol
// - CanvasArc
// - CanvasCircle
// - CanvasPolygon
// - CanvasPolyline
// - CanvasText
// - CanvasSymbol
export enum ShapeType {
    GeoCircle,
    GeoPolygon,
    GeoPolyline,
    GeoRelativeCircle,
    GeoRelativePolygon,
    GeoRelativePolyline,
}

/**
 * Circle whose centre is defined by latitude/longitude.
 */
export class GeoCircle {

    readonly type: ShapeType.GeoCircle = ShapeType.GeoCircle;
    private readonly _centre: LatLong
    private readonly _radius: Length
    private readonly _paint: Paint

    constructor(centre: LatLong, radius: Length, paint: Paint) {
        this._centre = centre
        this._radius = radius
        this._paint = paint
    }

    centre(): LatLong {
        return this._centre
    }

    radius(): Length {
        return this._radius
    }

    paint(): Paint {
        return this._paint
    }

}

/**
 * Polygon whose vertices are latitude/longitude.
 */
export class GeoPolygon {

    readonly type: ShapeType.GeoPolygon = ShapeType.GeoPolygon;
    private readonly _vertices: Array<LatLong>
    private readonly _paint: Paint

    constructor(vertices: Array<LatLong>, paint: Paint) {
        this._vertices = vertices
        this._paint = paint
    }

    vertices(): Array<LatLong> {
        return this._vertices
    }

    paint(): Paint {
        return this._paint
    }

}

/**
 * Polyline whose points are latitude/longitude
 */
export class GeoPolyline {

    readonly type: ShapeType.GeoPolyline = ShapeType.GeoPolyline;
    private readonly _points: Array<LatLong>
    private readonly _stroke: Stroke

    constructor(points: Array<LatLong>, stroke: Stroke) {
        this._points = points
        this._stroke = stroke
    }

    points(): Array<LatLong> {
        return this._points
    }

    stroke(): Stroke {
        return this._stroke
    }

}

/**
 * Circle whose centre is defined as an offset in pixels from a
 * reference latitude/longitude and radius is in pixels.
 */
export class GeoRelativeCircle {

    readonly type: ShapeType.GeoRelativeCircle = ShapeType.GeoRelativeCircle;
    private readonly _centreRef: LatLong
    private readonly _centreOffset: Vector2d
    private readonly _radius: number
    private readonly _paint: Paint

    constructor(centreRef: LatLong, centreOffset: Vector2d, radius: number,
        paint: Paint) {
        this._centreRef = centreRef
        this._centreOffset = centreOffset
        this._radius = radius
        this._paint = paint
    }

    centreRef(): LatLong {
        return this._centreRef
    }

    centreOffset(): Vector2d {
        return this._centreOffset
    }

    radius(): number {
        return this._radius
    }

    paint(): Paint {
        return this._paint
    }

}

/**
 * Polygon whose vertices are defined as pixels offsets from a reference
 * latitude/longitude.
 *
 * Offset is in pixels (x axis is right and y axis is down).
 */
export class GeoRelativePolygon {

    readonly type: ShapeType.GeoRelativePolygon = ShapeType.GeoRelativePolygon;
    private readonly _ref: LatLong
    private readonly _vertices: Array<Vector2d>
    private readonly _paint: Paint

    constructor(ref: LatLong, vertices: Array<Vector2d>, paint: Paint) {
        this._ref = ref
        this._vertices = vertices
        this._paint = paint
    }

    ref(): LatLong {
        return this._ref
    }

    vertices(): Array<Vector2d> {
        return this._vertices
    }

    paint(): Paint {
        return this._paint
    }

}

/**
 * Polyline whose points are defined as pixels offsets from a reference
 * latitude/longitude.
 *
 * Offset is in pixels (x axis is right and y axis is down).
 */
export class GeoRelativePolyline {

    readonly type: ShapeType.GeoRelativePolyline = ShapeType.GeoRelativePolyline;
    private readonly _ref: LatLong
    private readonly _points: Array<Vector2d>
    private readonly _stroke: Stroke

    constructor(ref: LatLong, points: Array<Vector2d>, stroke: Stroke) {
        this._ref = ref
        this._points = points
        this._stroke = stroke
    }

    ref(): LatLong {
        return this._ref
    }

    points(): Array<Vector2d> {
        return this._points
    }

    stroke(): Stroke {
        return this._stroke
    }

}

/**
 * Sum type of every supported shape.
 */
export type Shape =
    GeoCircle
    | GeoPolygon
    | GeoPolyline
    | GeoRelativeCircle
    | GeoRelativePolygon
    | GeoRelativePolyline

export const Shape = {
    ShapeType,
    GeoCircle,
    GeoPolygon,
    GeoPolyline,
    GeoRelativeCircle,
    GeoRelativePolygon,
    GeoRelativePolyline
}
