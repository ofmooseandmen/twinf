import { Angle } from "./angle"
import { LatLong } from "./latlong"
import {
    CoordinateSystems,
    StereographicProjection,
    CanvasDimension,
    CanvasAffineTransform
} from "./coordinate-systems"
import { Renderer, Drawing, Animator } from "./renderer"
import { Vector2d } from "./space2d"
import { Shape, ShapeConverter } from "./shapes"

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

    private hrange: number
    private rotation: Angle
    private cd: CanvasDimension

    private sp: StereographicProjection
    private at: CanvasAffineTransform

    private graphics: Map<String, Graphic>
    private drawings: Map<String, Drawing>

    private readonly renderer: Renderer
    private readonly animator: Animator

    constructor(gl: WebGL2RenderingContext, centre: LatLong, hrange: number, rotation: Angle, fps: number) {
        this.hrange = hrange
        this.rotation = rotation
        this.cd = new CanvasDimension(gl.canvas.clientWidth, gl.canvas.clientHeight)
        this.sp = CoordinateSystems.computeStereographicProjection(centre, World.EARTH_RADIUS)
        this.at = CoordinateSystems.computeCanvasAffineTransform(centre, this.hrange, this.rotation, this.cd, this.sp)
        this.graphics = new Map<String, Graphic>()
        this.drawings = new Map<String, Drawing>()
        this.renderer = new Renderer(gl)
        this.animator = new Animator(() => this.renderer.draw(this.drawings.values(), this.sp, this.at), fps)
    }

    startRendering() {
        this.animator.start()
    }

    stoptRendering() {
        this.animator.stop()
    }

    putGraphic(graphic: Graphic) {
        const name = graphic.name()
        this.graphics.set(name, graphic)
        const rs = graphic.shapes().map(s => ShapeConverter.toRenderableShape(s, World.EARTH_RADIUS))
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
        const newCentreLatLong = CoordinateSystems.geocentricToLatLong(newCentreGeo)

        // recompute stereographic projection using new canvas centre
        this.sp = CoordinateSystems.computeStereographicProjection(newCentreLatLong, this.sp.earthRadius())

        // recompute affine transform
        this.at = CoordinateSystems.computeCanvasAffineTransform(newCentreLatLong,
            this.hrange, this.rotation, this.cd, this.sp)
    }

    setRange(hrange: number) {
        this.hrange = hrange
        const centre = CoordinateSystems.geocentricToLatLong(this.sp.centre())
        // recompute affine transform
        this.at = CoordinateSystems.computeCanvasAffineTransform(centre, this.hrange, this.rotation, this.cd, this.sp)
    }

    range(): number {
        return this.hrange
    }

}
