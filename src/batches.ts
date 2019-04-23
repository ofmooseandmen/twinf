import { RenderableGraphic } from './graphic'
import { Mesh } from './mesh'

export interface BatchFactory<B extends Batch> {

    createBatch(mesh: Mesh): B

    fits(mesh: Mesh, batch: B): boolean

}

export class BatchManager<B extends Batch> {

    private readonly factory: BatchFactory<B>

    /* batches indexed by z-index (layer index). */
    private readonly _batches: Map<number, Array<B>>

    constructor(factory: BatchFactory<B>) {
        this.factory = factory
        this._batches = new Map<number, Array<B>>()
    }

    insert(graphic: RenderableGraphic) {
        const graphicName = graphic.name()
        /* delete graphic first but don't refresh the batches yet. */
        this.remove(graphicName)

        const zIndex = graphic.zIndex()
        let bs = this._batches.get(zIndex)
        if (bs === undefined) {
            /* new z-index.*/
            bs = new Array<B>()
            this._batches.set(zIndex, bs)
        }
        const meshes = graphic.meshes()
        const len = meshes.length
        for (let i = 0; i < len; i++) {
            const mesh = meshes[i]
            const last = bs[bs.length - 1]
            if (last === undefined || !this.factory.fits(mesh, last)) {
                const newBatch = this.factory.createBatch(mesh)
                newBatch.add(graphicName, mesh)
                bs.push(newBatch)
            } else {
                last.add(graphicName, mesh)
            }
        }

        this.refresh()
    }

    delete(graphicName: string) {
        this.remove(graphicName)
        this.refresh()
    }

    // FIXME rather something like forEach(consumer<B>) so no array

    /**
     * All layers in order of drawing, each element of the array contains all
     * the batches of the layer.
     */
    layers(): ReadonlyArray<ReadonlyArray<B>> {
        const sorted = Array.from(this._batches.entries()).sort()
        const res = new Array<ReadonlyArray<B>>()
        for (const l of sorted) {
            res.push(l[1])
        }
        return res
    }

    private remove(graphicName: string) {
        for (let bs of this._batches.values()) {
            const len = bs.length
            for (let i = 0; i < len; i++) {
                bs[i].remove(graphicName)
            }
        }
    }

    private refresh() {
        for (let bs of this._batches.values()) {
            for (var i = bs.length - 1; i >= 0; i--) {
                const b = bs[i]
                if (b.isEmpty()) {
                    b.destroy()
                    bs.splice(i, 1)
                }
            }
        }
    }
}
/**
 * A collection of meshes rendered with one draw call
 * and therefore sharing the same draw mode and attributes.
 */
export abstract class Batch {

    /* all meshes in this batch indexed by graphic name. */
    private readonly _meshes: Map<string, Array<Mesh>>

    /* whether this batch is dirty, i.e. the VBO are not populated with the meshes. */
    private _dirty: boolean

    constructor() {
        this._meshes = new Map<string, Array<Mesh>>()
        this._dirty = true
    }

    /**
     * whether this batch is dirty, i.e. the VBO are not populated
     * with the meshes. If batch is empty it must be destroy otherwise
     * updated
     */
    isDirty(): boolean {
        return this._dirty
    }

    /**
     * whether this batch contains no mesh and can therefore be destroyed.
     */
    isEmpty(): boolean {
        return this._meshes.size === 0
    }

    // FIXME do no expose unsetDirty

    unsetDirty() {
        this._dirty = false
    }

    meshes(): ReadonlyArray<Mesh> {
        let all = new Array<Mesh>()
        for (let ms of this._meshes.values()) {
            const len = ms.length
            for (let i = 0; i < len; i++) {
                all.push(ms[i])
            }

        }
        return all
    }

    add(graphicName: string, mesh: Mesh) {
        let ms = this._meshes.get(graphicName)
        if (ms === undefined) {
            ms = new Array<Mesh>()
            this._meshes.set(graphicName, ms)
        }
        ms.push(mesh)
        this._dirty = true
    }

    /**
     * If this batch contains meshes for the given graphic, removes them
     * and marks this batch as dirty.
     */
    remove(graphicName: string) {
        if (this._meshes.delete(graphicName)) {
            this._dirty = true
        }
    }


    /**
     * Destroys this batch: delete VAO and all VBOs.
     */
     // FIXME not abstract but on factory Batch is not absract therefore
    abstract destroy(): void

}
