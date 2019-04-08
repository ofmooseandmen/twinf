import { Mesh } from "./mesh"
import { Shape } from "./shapes"

export interface Graphic<T> {
    /**
     * Returns the name that uniquely identifies this graphic.
     */
    name(): string

    /**
     * Returns the stack order of this graphic. A graphic with greater stack order
     * is always in front of a graphic with a lower stack order.
     */
    zIndex(): number

    /**
     * Returns the elements of this graphic.
     */
    elements(): ReadonlyArray<T>

}

/**
 * A graphic whose elements are shapes.
 */
export class Shapes implements Graphic<Shape> {

    private readonly _name: string
    private readonly _zIndex: number
    private readonly _elements: ReadonlyArray<Shape>

    constructor(name: string, zIndex: number, elements: ReadonlyArray<Shape>) {
        this._name = name
        this._zIndex = zIndex
        this._elements = elements
    }

    static fromLiteral(data: any): Shapes {
        return new Shapes(data["_name"], data["_zIndex"], data["_elements"])
    }

    name(): string {
        return this._name
    }

    zIndex(): number {
        return this._zIndex
    }

    elements(): ReadonlyArray<Shape> {
        return this._elements
    }

}

/**
 * A graphic whose elements are meshes.
 */
export class Meshes implements Graphic<Mesh> {

    private readonly _name: string
    private readonly _zIndex: number
    private readonly _elements: ReadonlyArray<Mesh>

    constructor(name: string, zIndex: number, elements: ReadonlyArray<Mesh>) {
        this._name = name
        this._zIndex = zIndex
        this._elements = elements
    }

    static fromLiteral(data: any): Meshes {
        return new Meshes(data["_name"], data["_zIndex"], data["_elements"])
    }

    name(): string {
        return this._name
    }

    zIndex(): number {
        return this._zIndex
    }

    elements(): ReadonlyArray<Mesh> {
        return this._elements
    }

}
