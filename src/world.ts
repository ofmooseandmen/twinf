import { Angle } from "./angle"
import { Colour } from "./colour"
import {
    CoordinateSystems,
    StereographicProjection,
    CanvasDimension,
    CanvasAffineTransform
} from "./coordinate-systems"
import { LatLong } from "./latlong"
import { Length } from "./length"
import { Mesh, MeshGenerator } from "../src/mesh"
import { Animator, Drawing, Renderer, Scene } from "./renderer"
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

/**
 * Initial definition of the world to be rendered.
 */
export class WorldDefinition {

    private readonly _centre: LatLong
    private readonly _range: Length
    private readonly _rotation: Angle
    private readonly _bgColour: Colour

    constructor(centre: LatLong, range: Length,
        rotation: Angle, bgColour: Colour) {
        this._centre = centre
        this._range = range
        this._rotation = rotation
        this._bgColour = bgColour
    }

    centre(): LatLong {
        return this._centre
    }

    range(): Length {
        return this._range
    }

    rotation(): Angle {
        return this._rotation
    }

    bgColour(): Colour {
        return this._bgColour
    }

}

export class World {

    // earth radius in metres: WGS-84 ellipsoid, mean radius of semi-axis (R1). */
    static readonly EARTH_RADIUS = Length.ofMetres(6_371_008.7714)

    private _centre: LatLong
    private _range: Length
    private _rotation: Angle
    private bgColour: Colour
    private cd: CanvasDimension

    private sp: StereographicProjection
    private at: CanvasAffineTransform

    private drawings: Map<String, Drawing>

    private readonly renderer: Renderer
    private readonly animator: Animator

    constructor(gl: WebGL2RenderingContext, def: WorldDefinition, fps: number) {
        this._centre = def.centre()
        this._range = def.range()
        this._rotation = def.rotation()
        this.bgColour = def.bgColour()
        this.cd = new CanvasDimension(gl.canvas.clientWidth, gl.canvas.clientHeight)
        this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS)
        this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp)
        this.drawings = new Map<String, Drawing>()
        this.renderer = new Renderer(gl)
        this.animator = new Animator(() => {
            const scene = new Scene(this.drawings.values(), this.bgColour, this.sp, this.at)
            this.renderer.draw(scene)
        }, fps)
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

    insert(graphic: Graphic) {
        const name = graphic.name()
        const shapes = graphic.shapes()
        let meshes = new Array<Mesh>()
        for (let i = 0; i < shapes.length; i++) {
            meshes = meshes.concat(MeshGenerator.mesh(shapes[i], World.EARTH_RADIUS));
        }
        const drawing = this.drawings.get(name)
        const drawingCtx = drawing === undefined ? this.renderer.newDrawing() : drawing.context()
        this.drawings.set(graphic.name(), this.renderer.setGeometry(drawingCtx, meshes))
    }

    delete(graphicName: string) {
        const drawing = this.drawings.get(graphicName)
        if (drawing !== undefined) {
            this.renderer.deleteDrawing(drawing.context())
        }
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

    setRange(range: Length) {
        if (range.metres() <= 0) {
            return
        }
        this._range = range
        // recompute affine transform
        this.at = CoordinateSystems.computeCanvasAffineTransform(
            this._centre, this._range, this._rotation, this.cd, this.sp)
    }

    range(): Length {
        return this._range
    }

    centre(): LatLong {
        return this._centre
    }

}
