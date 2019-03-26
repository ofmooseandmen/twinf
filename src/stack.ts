/**
 * Ad-hoc stack to order element uniquely identified by name
 * according to their z-index. Within a layer (i.e. a z-index)
 * elements are ordered as inserted.
 */
export class Stack<T> {

    /* name to stack order (z-index). */
    private stackOrder: Map<string, number>
    private elements: Map<number, Map<string, T>>

    constructor() {
        this.stackOrder = new Map<string, number>()
        this.elements = new Map<number, Map<string, T>>()
    }

    get(name: string): T | undefined {
        const zi = this.stackOrder.get(name)
        if (zi === undefined) {
            return undefined
        }
        const layer = this.elements.get(zi)
        if (layer === undefined) {
            throw new Error("Unknown z-index: " + zi)
        }
        const e = layer.get(name)
        if (e === undefined) {
            throw new Error("Unknown name: " + name)
        }
        return e
    }

    all(): Array<T> {
        const sorted = Array.from(this.elements.entries()).sort()
        const len = sorted.length
        let res = new Array<T>()
        for (let i = 0; i < len; i++) {
            const ds = Array.from(sorted[i][1].values())
            const dsl = ds.length
            for (let i = 0; i < dsl; i++) {
                res.push(ds[i])
            }
        }
        return res
    }

    insert(name: string, zi: number, e: T) {
        const czi = this.stackOrder.get(name)
        if (czi === undefined) {
            /* new element */
            this.stackOrder.set(name, zi)
        } else if (czi !== zi) {
            /* change of stack order */
            this.delete(name)
            this.stackOrder.set(name, zi)
        }
        this.add(name, zi, e)
    }

    delete(name: string) {
        const zi = this.stackOrder.get(name)
        if (zi === undefined) {
            return
        }
        const layer = this.elements.get(zi)
        if (layer === undefined) {
            throw new Error("Unknown z-index: " + zi)
        }
        this.stackOrder.delete(name)
        layer.delete(name)
        if (layer.size === 0) {
            this.elements.delete(zi)
        }
    }

    private add(name: string, zi: number, e: T) {
        let layer = this.elements.get(zi)
        if (layer === undefined) {
            /* new layer */
            layer = new Map<string, T>()
            this.elements.set(zi, layer)
        }
        layer.set(name, e)
    }

}
