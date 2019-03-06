import { Angle } from "./angle"
import { LatLong } from "./latlong"
import { Geodetics } from "./geodetics"
import { Vector2d } from "./space2d"
import { Math3d, Vector3d } from "./space3d"

/**
 * Transformations between positions in different coordinate systems used when rendering shapes
 * defined by latitude/longitude into a canvas.
 *
 * The transformation flow is:
 * latitude/longitude (geodetic position) -> geocentric
 * geocentric -> stereographic
 * stereographic -> canvas (pixels)
 * canvas -> WebGL clipspace
 *
 * Geocentric positions a represented as n-vectors: the normal vector to the sphere.
 * n-vector prientation: z-axis points to the North Pole along the Earth's
 * rotation axis, x-axis points towards the point where latitude = longitude = 0.
 * Note: on a spherical model earth, a n-vector is equivalent to a normalised
 * version of an (ECEF) cartesian coordinate.
 *
 * Transformations done on the GPU:
 *
 * Stereographic Coordinate System: the stereographic projection, projects points on
 * a sphere onto a plane with respect to a projection centre.
 *
 * Canvas coordinate system: Allows transformation between positions in the stereographic
 * coordinate system and the canvas coordinate system.
 * Canvas coordinate system: origin is at top-left corner of the canvas, x axis is towards
 * the right and y-axis towards the bottom of the canvas.
 *
 * WebGL clipspace is x, y between (-1, 1), x axis is towards
 * the right and y-axis towards the bottom of the canvas.
 * Note: this transformation is always done in the GPU. The two last transformations
 * are not merged in order to allow for pixels to be offset in the GPU.
 *
 * Note: all matrices are given in row major order, so in the shader vector * matrix
 * shall be used.
 */
export class CoordinateSystems {

    private constructor() { }

    /*****************************************
     *** Latitude/Longitude <=> Geocentric ***
     *****************************************/

    /**
     * Converts the given latitude/longitude to a geocentric position (n-vector).
     */
    static latLongToGeocentric(ll: LatLong): Vector3d {
        const lat = ll.latitude();
        const lon = ll.longitude();
        const cl = Angle.cos(lat)
        const x = cl * Angle.cos(lon)
        const y = cl * Angle.sin(lon)
        const z = Angle.sin(lat)
        return new Vector3d(x, y, z)
    }

    /**
     * Converts the given geocentric position (n-vector) to a latitude/longitude.
     */
    static geocentricToLatLong(nv: Vector3d): LatLong {
        const lat = Angle.atan2(nv.z(), Math.sqrt(nv.x() * nv.x() + nv.y() * nv.y()))
        const lon = Angle.atan2(nv.y(), nv.x())
        return new LatLong(lat, lon)
    }

    /*****************************************
     ***    Geocentric <=> Stereographic   ***
     *****************************************/

    /**
     * Computes the attribues of a stereographic projection.
     */
    static computeStereographicProjection(centre: LatLong, earthRadius: number): StereographicProjection {
        const geoCentre = CoordinateSystems.latLongToGeocentric(centre)

        const sinPcLat = Angle.sin(centre.latitude())
        const cosPcLat = Angle.cos(centre.latitude())
        const sinPcLon = Angle.sin(centre.longitude())
        const cosPcLon = Angle.cos(centre.longitude())

        const r1 = new Vector3d(-sinPcLon, cosPcLon, 0.0)
        const r2 = new Vector3d(-sinPcLat * cosPcLon, -sinPcLat * sinPcLon, cosPcLat)
        const r3 = new Vector3d(cosPcLat * cosPcLon, cosPcLat * sinPcLon, sinPcLat)
        const dr = [r1, r2, r3]
        const ir = Math3d.transpose(dr)
        const drGl = Float32Array.of(
            dr[0].x(), dr[0].y(), dr[0].z(),
            dr[1].x(), dr[1].y(), dr[1].z(),
            dr[2].x(), dr[2].y(), dr[2].z())

        return new StereographicProjection(geoCentre, earthRadius, dr, drGl, ir)
    }

    static geocentricToStereographic(nv: Vector3d, sp: StereographicProjection): Vector2d {
        const earthRadius = sp.earthRadius()
        // n-vector to system
        const translated = Math3d.scale(Math3d.sub(nv, sp.centre()), earthRadius)
        const system = Math3d.multmv(sp.directRotation(), translated);
        // system to stereo
        const k = (2.0 * earthRadius) / (2.0 * earthRadius + system.z())
        return new Vector2d(k * system.x(), k * system.y());
    }

    static stereographicToGeocentric(stereo: Vector2d, sp: StereographicProjection): Vector3d {
        const earthRadius = sp.earthRadius()
        // stereo to system
        const tr = earthRadius * 2.0;
        const tr2 = tr * tr;
        const dxy2 = (stereo.x() * stereo.x()) + (stereo.y() * stereo.y())
        const z = (((tr2 - dxy2) / (tr2 + dxy2)) * (earthRadius)) - earthRadius
        const k = tr / (tr + z)
        const system = new Vector3d(stereo.x() / k, stereo.y() / k, z)
        // system to n-vector
        const c = Math3d.scale(sp.centre(), earthRadius)
        return Math3d.unit(Math3d.add(c, Math3d.multmv(sp.inverseRotation(), system)))
    }

    /*****************************************
     *** Stereographic <=> Canvas (pixels) ***
     *****************************************/

    static computeCanvasAffineTransform(centre: LatLong, hrange: number, rotation: Angle,
        canvas: CanvasDimension, sp: StereographicProjection): CanvasAffineTransform {
        const gc = CoordinateSystems.latLongToGeocentric(centre)
        const left = CoordinateSystems.geocentricToStereographic(
            Geodetics.destination(gc, Angle.ofDegrees(90.0), hrange / 2.0, sp.earthRadius()), sp)
        const ratio = canvas.height() / canvas.width()
        const sc = CoordinateSystems.geocentricToStereographic(gc, sp)
        const width = 2 * Math.abs(left.x() - sc.x())
        const height = width * ratio

        const canvasWidth = canvas.width();
        const canvasHeight = canvas.height();

        const sx = canvasWidth / width;
        const sy = -canvasHeight / height;

        const worldTopLeftX = sc.x() - width / 2.0;
        const worldTopLeftY = sc.y() + height / 2.0;

        const tx = -sx * worldTopLeftX;
        const ty = -sy * worldTopLeftY;

        /*
         * translate to centre:
         * [   1    0    tx  ]
         * [   0    1    ty  ]
         * [   0    0    1   ]
         */
        let m = [
            new Vector3d(1, 0, tx),
            new Vector3d(0, 1, ty),
            new Vector3d(0, 0, 1)
        ]
        /*
         * scale:
         * [   sx   0    0   ]
         * [   0    sy   0   ]
         * [   0    0    1   ]
         */
        m = Math3d.multmm(m, [
            new Vector3d(sx, 0, 0),
            new Vector3d(0, sy, 0),
            new Vector3d(0, 0, 1)
        ])
        /*
         * rotate by magDeclination at centre.
         * [   1    0    cx  ]    [   cos(a)   -sin(a)  0   ]    [   1    0   -cx ]
         * [   0    1    cy  ] T  [   sin(a)   cos(a)   0   ] T  [   0    1   -cy ]
         * [   0    0    1   ]    [   0          0      1   ]    [   0    0    1  ]
         */
        if (rotation.degrees() !== 0) {
            m = CoordinateSystems.rotate(m, rotation, sc.x(), sc.y())
        }
        /* we don't store m[2] as it is always [0,0,1] (2D transformation only). */
        const r0 = m[0]
        const r1 = m[1]

        const glMatrix = Float32Array.of(
            m[0].x(), m[0].y(), m[0].z(),
            m[1].x(), m[1].y(), m[1].z(),
            0, 0, 1
        )
        return new CanvasAffineTransform(sc, r0, r1, glMatrix)
    }

    static stereographicToCanvas(p: Vector2d, at: CanvasAffineTransform): Vector2d {
        return new Vector2d(
            p.x() * at.r0().x() + p.y() * at.r0().y() + at.r0().z(),
            p.x() * at.r1().x() + p.y() * at.r1().y() + at.r1().z()
        )
    }

    static canvasToStereographic(p: Vector2d, at: CanvasAffineTransform): Vector2d {
        let x = p.x() - at.r0().z()
        let y = p.y() - at.r1().z()
        const det = at.r0().x() * at.r1().y() - at.r0().y() * at.r1().x()
        x = (x * at.r1().y() - y * at.r0().y()) / det
        y = (y * at.r0().x() - x * at.r1().x()) / det
        return new Vector2d(x, y)
    }

    static canvasOffsetToStereographic(o: Vector2d, at: CanvasAffineTransform): Vector2d {
        return new Vector2d(o.x() / at.r0().x(), o.y() / at.r1().y())
    }

    /******************************************
     *** Canvas (pixels) => WebGL clipspace ***
     ******************************************/

    static canvasToClipspace(width: number, height: number): Float32Array {
        return Float32Array.of(
            2 / width, 0, -1,
            0, -2 / height, 1,
            0, 0, 1
        )
    }

    private static translate(m: Array<Vector3d>, tx: number, ty: number): Array<Vector3d> {
        const t = [
            new Vector3d(1, 0, tx),
            new Vector3d(0, 1, ty),
            new Vector3d(0, 0, 1)
        ]
        return Math3d.multmm(m, t)
    }

    /*
     * rotation by a at (x, y).
     * [   1    0    x  ]    [   cos(a)   -sin(a)  0   ]    [   1    0   -x ]
     * [   0    1    y  ] T  [   sin(a)   cos(a)   0   ] T  [   0    1   -y ]
     * [   0    0    1  ]    [   0          0      1   ]    [   0    0    1 ]
     */
    private static rotate(m: Array<Vector3d>, alpha: Angle, atX: number, atY: number): Array<Vector3d> {
        const cosa = Angle.cos(alpha)
        const sina = Angle.sin(alpha)
        const r = [
            new Vector3d(cosa, -sina, 0),
            new Vector3d(sina, cosa, 0),
            new Vector3d(0, 0, 1)
        ]
        return CoordinateSystems.translate(
            Math3d.multmm(CoordinateSystems.translate(m, atX, atY), r), -atX, -atY)
    }

}

/**
 * Attributes of a stereographic projection at a given centre position.
 */
export class StereographicProjection {

    /* projection centre in geocentric coordinate system. */
    private readonly _centre: Vector3d
    private readonly _earthRadius: number
    /* n-vector to system rotation matrix (direct projection). */
    private readonly _dr: Array<Vector3d>
    /* as above but in WebGl format (row major). */
    private readonly _drGl: Float32Array
    /* system to n-vector rotation matrix (inverse projection). */
    private readonly _ir: Array<Vector3d>

    constructor(centre: Vector3d, earthRadius: number, dr: Array<Vector3d>,
        drGl: Float32Array, ir: Array<Vector3d>) {
        this._centre = centre
        this._earthRadius = earthRadius
        this._dr = dr
        this._drGl = drGl
        this._ir = ir
    }

    centre(): Vector3d {
        return this._centre
    }

    earthRadius(): number {
        return this._earthRadius
    }

    directRotation(): Array<Vector3d> {
        return this._dr
    }

    directRotationGl(): Float32Array {
        return this._drGl
    }

    inverseRotation(): Array<Vector3d> {
        return this._ir
    }

}

export class CanvasDimension {

    private readonly _width: number
    private readonly _height: number

    constructor(width: number, height: number) {
        this._width = width
        this._height = height
    }

    width(): number {
        return this._width
    }

    height(): number {
        return this._height
    }

}

/**
 * Affine transform to convert from positions in
 * the stereographic coordinate system to positions
 * in the canvas coordinate system.
 */
export class CanvasAffineTransform {

    /* centre in the stereographic coordinate system. */
    private readonly _centre: Vector2d

    /* first row of the 3*3 affine transform matrix. */
    private readonly _r0: Vector3d

    /* second row of the 3*3 affine transform matrix. */
    private readonly _r1: Vector3d

    /* affine transform matrix wrapped in a Float32Array for WebGL (row major). */
    private readonly _glMatrix: Float32Array

    constructor(centre: Vector2d, r0: Vector3d, r1: Vector3d,
        glMatrix: Float32Array) {
        this._centre = centre
        this._r0 = r0
        this._r1 = r1
        this._glMatrix = glMatrix
    }

    centre(): Vector2d {
        return this._centre
    }

    r0(): Vector3d {
        return this._r0
    }

    r1(): Vector3d {
        return this._r1
    }

    glMatrix(): Float32Array {
        return this._glMatrix
    }
}
