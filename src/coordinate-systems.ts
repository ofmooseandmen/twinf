import { Angle } from "./angle"
import { LatLong } from "./latlong"
import { Geodetics } from "./geodetics"
import { Vector2d } from "./space2d"
import { Math3d, Vector3d } from "./space3d"

/**
 * Conversions between positions in different coordinate systems used when rendering shapes
 * defined by latitude/longitude into a canvas.
 *
 * The typical conversion flows is:
 * latitude/longitude (geodetic position) -> geocentric
 * geocentric -> stereographic
 * stereographic -> screen (canvas pixels)
 *
 * Geocentric positions a represented as n-vectors: the normal vector to the sphere.
 * n-vector prientation: z-axis points to the North Pole along the Earth's
 * rotation axis, x-axis points towards the point where latitude = longitude = 0.
 * Note: on a spherical model earth, a n-vector is equivalent to a normalised
 * version of an (ECEF) cartesian coordinate.
 *
 * Stereographic Coordinate System: the stereographic projection, projects points on
 * a sphere onto a plane with respect to a projection centre.
 * Note: this conversion can be done in the GPU
 *
 * Canvas coordinate system: Allows conversion between positions in the stereographic
 * coordinate system and the canvas coordinate system.
 * Canvas coordinate system: origin is at top-left corner of the canvas, x axis is towards
 * the right and y-axis towards the bottom of the canvas.
 * Note: this conversion is always done in the GPU. Positions in the canvas Coordinate
 * system must be converted one last time to the GL clip space (-1 to +1 for both x
 * and y axes).
 */
export class CoordinateSystems {

    private constructor() { }

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

        return new StereographicProjection(geoCentre, earthRadius, dr, ir)
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

    static computeCanvasAffineTransform(centre: LatLong, rotation: Angle, hrange: number,
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

        const glMatrix = CoordinateSystems.makeGlMatrix(r0, r1)

        return new CanvasAffineTransform(r0, r1, glMatrix)
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

    private static makeGlMatrix(r0: Vector3d, r1: Vector3d): Float32Array {
        /* WebGL is column-major order. */
        let arr = [
            1, 0, 0, 0, // column 0
            0, 1, 0, 0, // column 1
            0, 0, 1, 0, // column 2
            0, 0, 0, 1  // column 3
        ]
        arr[0] = r0.x()
        arr[1] = r1.x()
        arr[4] = r0.y()
        arr[5] = r1.y()
        arr[12] = r0.z()
        arr[13] = r1.z()

        return Float32Array.from(arr)
    }


}

/**
 * Attributes of a stereographic projection at a given centre position.
 */
export class StereographicProjection {

    private readonly _centre: Vector3d
    private readonly _earthRadius: number
    /* n-vector to system rotation matrix (direct projection). */
    private readonly _dr: Array<Vector3d>
    /* system to n-vector rotation matrix (inverse projection). */
    private readonly _ir: Array<Vector3d>

    constructor(centre: Vector3d, earthRadius: number, dr: Array<Vector3d>, ir: Array<Vector3d>) {
        this._centre = centre
        this._earthRadius = earthRadius
        this._dr = dr
        this._ir = ir
    }

    centre() {
        return this._centre
    }

    earthRadius() {
        return this._earthRadius
    }

    directRotation() {
        return this._dr
    }

    inverseRotation() {
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
    /* first row of the 3*3 affine transform matrix. */
    private readonly _r0: Vector3d

    /* second row of the 3*3 affine transform matrix. */
    private readonly _r1: Vector3d

    /* Equivalent 4x4 matrix suitable to transform openGL vec4 positions. */
    private readonly _glMatrix: Float32Array

    constructor(r0: Vector3d, r1: Vector3d, glMatrix: Float32Array) {
        this._r0 = r0
        this._r1 = r1
        this._glMatrix = glMatrix
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
