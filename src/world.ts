import { Angle } from "./angle"
import { Colour } from "./colour"
import { LatLong } from "./latlong"
import {
    CoordinateSystems,
    StereographicProjection,
    CanvasDimension,
    CanvasAffineTransform
} from "./coordinate-systems"
import { MeshGenerator } from "../src/mesh"
import { Renderer, Drawing, Animator } from "./renderer"
import { Vector2d } from "./space2d"
import { Shape } from "./shape"

export class Graphic {

    private readonly _name: string
    private readonly _shapes: Array<Shape>

    constructor(name: string, shapes: Array<Shape>) {
        this._name = name
        this._shapes = shapes
    }

    name(): string {
        return this._name
    }

    shapes(): Array<Shape> {
        return this._shapes
    }

}

export class World {

    static readonly EARTH_RADIUS = 6_371_000

    private _centre: LatLong
    private _range: number
    private _rotation: Angle
    private bgColour: Colour
    private cd: CanvasDimension

    private sp: StereographicProjection
    private at: CanvasAffineTransform

    private graphics: Map<String, Graphic>
    private drawings: Map<String, Drawing>

    private readonly renderer: Renderer
    private readonly animator: Animator

    // FIXME range is Length
    // FIXME centre, range, rotation, bgColour, fps as one object
    constructor(gl: WebGL2RenderingContext, centre: LatLong, range: number,
        rotation: Angle, bgColour: Colour, fps: number) {
        this._centre = centre
        this._range = range
        this._rotation = rotation
        this.bgColour = bgColour
        this.cd = new CanvasDimension(gl.canvas.clientWidth, gl.canvas.clientHeight)
        this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS)
        this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp)
        this.graphics = new Map<String, Graphic>()
        this.drawings = new Map<String, Drawing>()
        this.renderer = new Renderer(gl)
        this.animator = new Animator(() =>
            this.renderer.draw(this.drawings.values(), this.bgColour, this.sp, this.at), fps)
    }

    startRendering() {
        this.animator.start()
    }

    stoptRendering() {
        this.animator.stop()
    }

    setBackground(colour: Colour) {
        this.bgColour = colour
    }

    putGraphic(graphic: Graphic) {
        const name = graphic.name()
        this.graphics.set(name, graphic)
        const rs = graphic.shapes().map(s => MeshGenerator.mesh(s, World.EARTH_RADIUS))
        const drawing = this.drawings.get(name)
        const drawingCtx = drawing === undefined ? this.renderer.newDrawing() : drawing.context()
        this.drawings.set(graphic.name(), this.renderer.setGeometry(drawingCtx, rs))
    }

    pan(deltaX: number, deltaY: number) {
        // pixels to stereographic
        const cd = CoordinateSystems.canvasOffsetToStereographic(new Vector2d(deltaX, deltaY), this.at)

        // new canvas centre in stereographic
        const newCentreStereo = new Vector2d(this.at.centre().x() + cd.x(), this.at.centre().y() + cd.y())

        // stereographic to geocentric
        const newCentreGeo = CoordinateSystems.stereographicToGeocentric(newCentreStereo, this.sp)

        // geocentric to latitude/longitude
        this._centre = CoordinateSystems.geocentricToLatLong(newCentreGeo)

        // recompute stereographic projection using new canvas centre
        this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS)

        // recompute affine transform
        this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre,
            this._range, this._rotation, this.cd, this.sp)
    }

    // FIXME range is Length
    setRange(range: number) {
        if (range <= 0) {
            return
        }
        this._range = range
        // recompute affine transform
        this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp)
    }

    // FIXME range is Length
    range(): number {
        return this._range
    }

    centre(): LatLong {
        return this._centre
    }

}
