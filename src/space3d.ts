export class Vector3d {

    private readonly _x: number
    private readonly _y: number
    private readonly _z: number

    constructor(x: number, y: number, z: number) {
        this._x = x
        this._y = y
        this._z = z
    }

    x(): number {
        return this._x
    }

    y(): number {
        return this._y
    }

    z(): number {
        return this._z
    }

    /** origin: (0, 0, 0). */
    static readonly ZERO = new Vector3d(0, 0, 0)

}

export class Math3d {

    /**
     * Adds the 2 given vectors.
     */
    static add(v1: Vector3d, v2: Vector3d): Vector3d {
        return new Vector3d(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z())
    }

    /**
     * Subtracts the 2 given vectors.
     */
    static sub(v1: Vector3d, v2: Vector3d): Vector3d {
        return new Vector3d(v1.x() - v2.x(), v1.y() - v2.y(), v1.z() - v2.z())
    }

    /**
     * Computes the cross product of 2 vectors: the vector perpendicular to given vectors.
     */
    static cross(v1: Vector3d, v2: Vector3d): Vector3d {
        const x = v1.y() * v2.z() - v1.z() * v2.y()
        const y = v1.z() * v2.x() - v1.x() * v2.z()
        const z = v1.x() * v2.y() - v1.y() * v2.x()
        return new Vector3d(x, y, z)
    }

    /**
     * Computes the dot product of 2 vectors.
     */
    static dot(v1: Vector3d, v2: Vector3d): number {
        return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z()
    }

    /**
     * Computes the norm of the given vector.
     */
    static norm(v: Vector3d): number {
        return Math.sqrt(v.x() * v.x() + v.y() * v.y() + v.z() * v.z())
    }

    /**
     * Mutiplies given 3*3 matrix by given vector.
     */
    static multmv(m: Array<Vector3d>, v: Vector3d): Vector3d {
        if (m.length != 3) {
            throw new RangeError("Rotation matrix must be 3*3")
        }
        return Math3d.a2v(m.map(r => Math3d.dot(v, r)))
    }

    /**
     * Mutiplies given 3*3 matrix by given 3*3 matrix.
     */
    static multmm(m1: Array<Vector3d>, m2: Array<Vector3d>): Array<Vector3d> {
        if (m1.length != 3 || m2.length != 3) {
            throw new RangeError("Rotation matrix must be 3*3")
        }
        const t2 = Math3d.transpose(m2)
        return [
            Math3d.a2v(t2.map(t => Math3d.dot(m1[0], t))),
            Math3d.a2v(t2.map(t => Math3d.dot(m1[1], t))),
            Math3d.a2v(t2.map(t => Math3d.dot(m1[2], t)))
        ]
    }

    /**
     * Multiplies each component of the given vector by the given number.
     */
    static scale(v: Vector3d, s: number): Vector3d {
        return new Vector3d(s * v.x(), s * v.y(), s * v.z())
    }

    /**
     * Normalises the given vector (norm of return vector is 1).
     */
    static unit(v: Vector3d): Vector3d {
        const s = 1.0 / Math3d.norm(v)
        return s == 1.0 ? v : Math3d.scale(v, s)
    }

    /**
     * Transposes given 3*3 matrix.
     */
    static transpose(m: Array<Vector3d>): Array<Vector3d> {
        const xs = m.map(Math3d.v2a)
        return [
            new Vector3d(xs[0][0], xs[1][0], xs[2][0]),
            new Vector3d(xs[0][1], xs[1][1], xs[2][1]),
            new Vector3d(xs[0][2], xs[1][2], xs[2][2])
        ]
    }

    /**  vector to array of numbers. */
    private static v2a(v: Vector3d): Array<number> {
        return [v.x(), v.y(), v.z()]
    }

    /** array of numbers to vector. */
    private static a2v(a: Array<number>): Vector3d {
        if (a.length != 3) {
            throw new RangeError("Array must contain 3 elements")
        }
        return new Vector3d(a[0], a[1], a[2])
    }

}
