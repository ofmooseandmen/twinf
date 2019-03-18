import { Colour } from "./colour"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { Vector2d } from "./space2d"

export class Painting {

    private readonly _stroke: Colour | undefined
    private readonly _fill: Colour | undefined

    private constructor(stroke: Colour | undefined, fill: Colour | undefined) {
        this._stroke = stroke
        this._fill = fill
    }

    static stroked(stroke: Colour) {
        return new Painting(stroke, undefined)
    }

    static filled(fill: Colour) {
        return new Painting(undefined, fill)
    }

    static strokedAndFilled(stroke: Colour, fill: Colour) {
        return new Painting(stroke, fill)
    }

    stroke(): Colour | undefined {
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
    private readonly _painting: Painting

    constructor(centre: LatLong, radius: Length, painting: Painting) {
        this._centre = centre
        this._radius = radius
        this._painting = painting
    }

    centre(): LatLong {
        return this._centre
    }

    radius(): Length {
        return this._radius
    }

    painting(): Painting {
        return this._painting
    }

}

/**
 * Polygon whose vertices are latitude/longitude.
 */
export class GeoPolygon {

    readonly type: ShapeType.GeoPolygon = ShapeType.GeoPolygon;
    private readonly _vertices: Array<LatLong>
    private readonly _painting: Painting

    constructor(vertices: Array<LatLong>, painting: Painting) {
        this._vertices = vertices
        this._painting = painting
    }

    vertices(): Array<LatLong> {
        return this._vertices
    }

    painting(): Painting {
        return this._painting
    }

}

/**
 * Polyline whose points are latitude/longitude
 */
export class GeoPolyline {

    readonly type: ShapeType.GeoPolyline = ShapeType.GeoPolyline;
    private readonly _points: Array<LatLong>
    private readonly _colour: Colour

    constructor(points: Array<LatLong>, colour: Colour) {
        this._points = points
        this._colour = colour
    }

    points(): Array<LatLong> {
        return this._points
    }

    colour(): Colour {
        return this._colour
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
    private readonly _painting: Painting

    constructor(centreRef: LatLong, centreOffset: Vector2d, radius: number,
        painting: Painting) {
        this._centreRef = centreRef
        this._centreOffset = centreOffset
        this._radius = radius
        this._painting = painting
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

    painting(): Painting {
        return this._painting
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
    private readonly _painting: Painting

    constructor(ref: LatLong, vertices: Array<Vector2d>, painting: Painting) {
        this._ref = ref
        this._vertices = vertices
        this._painting = painting
    }

    ref(): LatLong {
        return this._ref
    }

    vertices(): Array<Vector2d> {
        return this._vertices
    }

    painting(): Painting {
        return this._painting
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
    private readonly _colour: Colour

    constructor(ref: LatLong, points: Array<Vector2d>, colour: Colour) {
        this._ref = ref
        this._points = points
        this._colour = colour
    }

    ref(): LatLong {
        return this._ref
    }

    points(): Array<Vector2d> {
        return this._points
    }

    colour(): Colour {
        return this._colour
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
