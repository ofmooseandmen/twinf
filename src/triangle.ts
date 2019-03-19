/**
 * Triangle defined by 3 vertices.
 */
export class Triangle<T> {

    private readonly _v1: T
    private readonly _v2: T
    private readonly _v3: T

    constructor(v1: T, v2: T, v3: T) {
        this._v1 = v1
        this._v2 = v2
        this._v3 = v3
    }

    v1(): T {
        return this._v1
    }

    v2(): T {
        return this._v2
    }

    v3(): T {
        return this._v3
    }

}
