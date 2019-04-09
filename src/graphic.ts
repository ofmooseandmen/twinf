import { Mesh, Mesher } from './mesh'
import { Shape, fromLiteral } from './shapes'

/**
 * Base class for graphics.
 */
export abstract class BaseGraphic {

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

}

/**
 * A graphic whose elements are shapes: each shape needs to be converted
 * to a mesh before rendering.
 */
export class Graphic extends BaseGraphic {

    private readonly _shapes: ReadonlyArray<Shape>

    constructor(name: string, zIndex: number, shapes: ReadonlyArray<Shape>) {
        super(name, zIndex)
        this._shapes = shapes
    }

    static fromLiteral(data: any): Graphic {
        const name = data['_name']
        const zIndex = data['_zIndex']
        const elements = data['_shapes'].map(fromLiteral)
        return new Graphic(name, zIndex, elements)
    }

    toRenderable(mesher: Mesher): RenderableGraphic {
        let meshes = new Array<Mesh>()
        const len = this._shapes.length
        for (let i = 0; i < len; i++) {
            meshes = meshes.concat(mesher.meshShape(this._shapes[i]))
        }
        return new RenderableGraphic(this.name(), this.zIndex(), meshes)
    }

}

/**
 * A graphic whose elements are meshes.
 */
export class RenderableGraphic extends BaseGraphic {

    private readonly _meshes: ReadonlyArray<Mesh>

    constructor(name: string, zIndex: number, meshes: ReadonlyArray<Mesh>) {
        super(name, zIndex)
        this._meshes = meshes
    }

    static fromLiteral(data: any): RenderableGraphic {
        const name = data['_name']
        const zIndex = data['_zIndex']
        const elements = data['_meshes'].map(Mesh.fromLiteral)
        return new RenderableGraphic(name, zIndex, elements)
    }

    meshes(): ReadonlyArray<Mesh> {
        return this._meshes
    }

}
