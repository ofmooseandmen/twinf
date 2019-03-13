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
import { Animator, Drawing, DrawingContext, Renderer, Scene } from "./renderer"
import { Vector2d } from "./space2d"
import { Shape } from "./shape"

export class Graphic {

    private readonly _name: string
    private readonly _zIndex: number
    private readonly _shapes: Array<Shape>

    constructor(name: string, zIndex: number, shapes: Array<Shape>) {
        this._name = name
        this._zIndex = zIndex
        this._shapes = shapes
    }

    name(): string {
        return this._name
    }

    /**
     * Return the stack order of this graphic. A graphic with greater stack order
     * is always in front of a graphic with a lower stack order.
     */
    zIndex(): number {
        return this._zIndex
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

    private readonly stack: Stack
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
        this.stack = new Stack()
        this.renderer = new Renderer(gl)
        this.animator = new Animator(() => {
            const scene = new Scene(this.stack.drawingsInOrder(), this.bgColour, this.sp, this.at)
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
        const zi = graphic.zIndex()
        const shapes = graphic.shapes()
        let meshes = new Array<Mesh>()
        for (let i = 0; i < shapes.length; i++) {
            meshes = meshes.concat(MeshGenerator.mesh(shapes[i], World.EARTH_RADIUS));
        }

        let drawingCtx = this.stack.drawingContext(name)
        if (drawingCtx === undefined) {
            drawingCtx = this.renderer.newDrawing()
        }
        const d = this.renderer.setGeometry(drawingCtx, meshes)
        this.stack.add(name, zi, d)
    }

    delete(graphicName: string) {
        let drawingCtx = this.stack.drawingContext(name)
        if (drawingCtx !== undefined) {
            this.stack.delete(graphicName)
            this.renderer.deleteDrawing(drawingCtx)
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

/**
 * stack of graphics.
 */
class Stack {

    /* graphic name to stack order (z-index). */
    private stackOrder: Map<string, number>
    private drawings: Map<number, Map<string, Drawing>>

    constructor() {
        this.stackOrder = new Map<string, number>()
        this.drawings = new Map<number, Map<string, Drawing>>()
    }

    drawingContext(graphicName: string): DrawingContext | undefined {
        const zi = this.stackOrder.get(graphicName)
        if (zi === undefined) {
            return undefined
        }
        const layer = this.drawings.get(zi)
        if (layer === undefined) {
            throw new Error("Unknown z-index: " + zi)
        }
        const d = layer.get(graphicName)
        if (d === undefined) {
            throw new Error("Unknown graphic: " + graphicName)
        }
        return d.context()
    }

    drawingsInOrder(): Array<Drawing> {
        const sorted = [...this.drawings.entries()].sort()
        const len = sorted.length
        let res = new Array<Drawing>()
        for (let i = 0; i < len; i++) {
            const ds = sorted[i][1].values()
            res = res.concat(res, [...ds])
        }
        return res
    }

    add(graphicName: string, zi: number, drawing: Drawing) {
        const czi = this.stackOrder.get(graphicName)
        if (czi === undefined) {
            /* new graphic */
            this.stackOrder.set(graphicName, zi)
        } else if (czi !== zi) {
            /* change of stack order */
            this.delete(graphicName)
            this.stackOrder.set(graphicName, zi)
        }
        this._add(graphicName, zi, drawing)
    }

    delete(graphicName: string) {
        const zi = this.stackOrder.get(graphicName)
        if (zi === undefined) {
            return
        }
        const layer = this.drawings.get(zi)
        if (layer === undefined) {
            throw new Error("Unknown z-index: " + zi)
        }
        this.stackOrder.delete(graphicName)
        layer.delete(graphicName)
        if (layer.size === 0) {
            this.drawings.delete(zi)
        }
    }

    private _add(graphicName: string, zi: number, drawing: Drawing) {
        let layer = this.drawings.get(zi)
        if (layer === undefined) {
            /* new layer */
            layer = new Map<string, Drawing>()
            this.drawings.set(zi, layer)
        }
        layer.set(graphicName, drawing)
    }

}
