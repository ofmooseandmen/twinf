import { Angle } from './angle'
import { Colour } from './colour'
import {
    CoordinateSystems,
    StereographicProjection,
    CanvasDimension,
    CanvasAffineTransform
} from './coordinate-systems'
import { Graphic, RenderableGraphic } from './graphic'
import { LatLong } from './latlong'
import { Length } from './length'
import { Mesher } from './meshing'
import { DrawingContext, Renderer, FontDescriptor, CharacterGeometry } from './rendering'
import { Math2d, Vector2d } from './space2d'

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

/**
 * A world instance represents a view of the earth projected using a stereographic
 * projection centered at a given location and onto which various shapes are rendered.
 */
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

    /*
     * A mapping from each renderable character to the coordinates on a rastered texture
     * packed with characters.
     */
    private cg: CharacterGeometry

    private readonly _mesher: Mesher
    private readonly renderer: Renderer

    constructor(gl: WebGL2RenderingContext, def: WorldDefinition, font : FontDescriptor,
        textCapabilityCallback : (chars: CharacterGeometry) => void = () => {},
        options: RenderingOptions = new RenderingOptions(60, 100, 5)) {
        this._centre = def.centre()
        this._range = def.range()
        this._rotation = def.rotation()
        this.bgColour = def.bgColour()

        this.cd = new CanvasDimension(gl.canvas.clientWidth, gl.canvas.clientHeight)

        this.sp = CoordinateSystems.computeStereographicProjection(this._centre, World.EARTH_RADIUS)
        this.at = CoordinateSystems.computeCanvasAffineTransform(this._centre, this._range, this._rotation, this.cd, this.sp)

        this.cg = new CharacterGeometry()

        this.renderer = new Renderer(gl, options.miterLimit())
        this.renderer.createFontTexture(font)
            .then(characterGeom => {
                this.cg = characterGeom
                console.log(characterGeom)
                return characterGeom
            })
            .then(textCapabilityCallback)
        this._mesher = new Mesher(World.EARTH_RADIUS, options.circlePositions(), options.miterLimit(), () => this.cg)
    }

    /**
     * Renders all inserted shapes into the WebGL rendering context given at construction.
     *
     * This should be called within `requestAnimationFrame`
     */
    render() {
        const ctx = new DrawingContext(this.bgColour, this.sp, this.at, this.cg)
        this.renderer.draw(ctx)
    }

    /**
     * Sets the background colour (clear colour) of the WeGL rendering context.
     *
     * The colour will be applied at the next repaint.
     */
    setBackground(colour: Colour) {
        this.bgColour = colour
    }

    /**
     * Inserts the given graphic in this world.
     *
     * The shapes of the graphic will be converted into meshes if the graphic
     * is not a `RenderableGraphic`. This operation can be expensive, depending on how
     * many shapes and what shapes are to be rendered. Meshing can be done in a worker
     * using the `mesher()` supplied by this class and the relevant `fromLiteral` functions.
     *
     * The graphic will be rendered at the next repaint.
     */
    insert(graphic: Graphic | RenderableGraphic) {
        const g = graphic instanceof Graphic
            ? graphic.toRenderable(this._mesher)
            : graphic
        this.renderer.insert(g)
    }

    /**
     * Deletes the graphic associated to the given name.
     *
     * The graphic will be deleted at the next repaint.
     */
    delete(graphicName: string) {
        this.renderer.delete(graphicName)
    }

    pan(deltaX: number, deltaY: number) {
        // pixels to stereographic
        const cd = CoordinateSystems.canvasOffsetToStereographic(new Vector2d(deltaX, deltaY), this.at)

        // new canvas centre in stereographic
        const newCentreStereo = Math2d.add(this.at.centre(), cd)

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

    /**
     * Returns the mesher to be used to transform shapes into meshes (renderable).
     * Use this to perform meshing of complex shapes (i.e. that require intensive CPU
     * operation) in a web worker (in order not to block the main javascript thread).
     */
    mesher(): Mesher {
        return this._mesher
    }

}
