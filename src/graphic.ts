import { Mesh } from "./mesh"
import { Shape, fromLiteral } from "./shapes"

/**
 * Base class for graphics.
 */
export abstract class BaseGraphic <T> {

    private readonly _name: string
    private readonly _zIndex: number

    constructor(name: string, zIndex: number) {
        this._name = name
        this._zIndex = zIndex
    }

    /**
     * Returns the name that uniquely identifies this graphic.
     */
    name(): string {
        return this._name
    }

    /**
     * Returns the stack order of this graphic. A graphic with greater stack order
     * is always in front of a graphic with a lower stack order.
     */
    
    zIndex(): number {
        return this._zIndex
    }

    /**
     * Returns the elements of this graphic: shapes or meshes.
     */
    abstract elements(): ReadonlyArray<T>

}

/**
 * A graphic whose elements are shapes: each shape needs to be converted
 * to a mesh before rendering.
 */
export class Graphic extends BaseGraphic<Shape> {
    
    private readonly _elements: ReadonlyArray<Shape>
    
    constructor(name: string, zIndex: number, elements: ReadonlyArray<Shape>) {
        super(name, zIndex)
        this._elements = elements
    }
    
    static fromLiteral(data: any): Graphic {
        const name = data["_name"]
        const zIndex = data["_zIndex"]
        const elements = data["_elements"].map(fromLiteral)
        return new Graphic(name, zIndex, elements)
    }

    elements(): ReadonlyArray<Shape> {
        return this._elements
    }

}

/**
 * A graphic whose elements are meshes.
 */
export class RenderableGraphic extends BaseGraphic<Mesh> {
    
    private readonly _elements: ReadonlyArray<Mesh>

    constructor(name: string, zIndex: number, elements: ReadonlyArray<Mesh>) {
        super(name, zIndex)
        this._elements = elements
    }

    static fromLiteral(data: any): Graphic {
        const name = data["_name"]
        const zIndex = data["_zIndex"]
        const elements = data["_elements"].map(Mesh.fromLiteral)
        return new Graphic(name, zIndex, elements)
    }

    elements(): ReadonlyArray<Mesh> {
        return this._elements
    }

}