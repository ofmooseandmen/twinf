import { Batch, BatchManager, BatchFactory } from '../src/batches'
import { RenderableGraphic } from '../src/graphic'
import { DrawMode, Mesh } from '../src/mesh'

class TestBatch extends Batch<number> {

    updated: boolean
    destroyed: boolean
    meshes: ReadonlyArray<Mesh>

    constructor(topology: number) {
        super(topology)
        this.updated = false
        this.destroyed = false
        this.meshes = []
    }

    update(meshes: ReadonlyArray<Mesh>) {
        this.updated = true
        this.meshes = meshes
    }

    destroy() {
        this.destroyed = true
    }

}

class TestBatchFactory implements BatchFactory<number, TestBatch> {

    created: Array<TestBatch>

    constructor() {
        this.created = []
    }

    topology(mesh: Mesh): number {
        return mesh.drawMode()
    }

    createBatch(topology: number) {
        const b = new TestBatch(topology)
        this.created.push(b)
        return b
    }

}

describe('BatchManager', () => {

    describe('insert', () => {

        test('it creates a new batch for new z-index', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            bm.insert(graphic)
            expect(factory.created.length).toEqual(1)
            expect(factory.created[0].updated).toEqual(true)
            expect(factory.created[0].meshes).toEqual(meshes)
            expect(factory.created[0].destroyed).toEqual(false)
        })

        test('it destroys the existing batch when changing the z-index', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const oldGraphic = new RenderableGraphic("foo", 1, meshes)
            bm.insert(oldGraphic)
            const newGraphic = new RenderableGraphic("foo", 2, meshes)
            bm.insert(newGraphic)
            expect(factory.created.length).toEqual(2)
            expect(factory.created[0].destroyed).toEqual(true)
            expect(factory.created[1].updated).toEqual(true)
            expect(factory.created[1].meshes).toEqual(meshes)
            expect(factory.created[1].destroyed).toEqual(false)
        })

        it('destroys the existing batch when changing the topology', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const oldMeshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const oldGraphic = new RenderableGraphic("foo", 1, oldMeshes)
            bm.insert(oldGraphic)
            const newMeshes = [new Mesh([], undefined, [], [], DrawMode.LINES)]
            const newGraphic = new RenderableGraphic("foo", 1, newMeshes)
            bm.insert(newGraphic)
            expect(factory.created.length).toEqual(2)
            expect(factory.created[0].destroyed).toEqual(true)
            expect(factory.created[1].updated).toEqual(true)
            expect(factory.created[1].meshes).toEqual(newMeshes)
            expect(factory.created[1].destroyed).toEqual(false)
        })

        it('creates one batch if all meshes have the same topology', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const meshes = [
                new Mesh([], undefined, [], [], DrawMode.TRIANGLES),
                new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            ]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            bm.insert(graphic)
            expect(factory.created.length).toEqual(1)
            expect(factory.created[0].updated).toEqual(true)
            expect(factory.created[0].meshes).toEqual(meshes)
            expect(factory.created[0].destroyed).toEqual(false)
        })

        it('creates one batch per mesh topology', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.LINES)
            const meshes = [m1, m2]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            bm.insert(graphic)
            expect(factory.created.length).toEqual(2)
            expect(factory.created[0].updated).toEqual(true)
            expect(factory.created[0].meshes).toEqual([m1])
            expect(factory.created[0].destroyed).toEqual(false)
            expect(factory.created[1].updated).toEqual(true)
            expect(factory.created[1].meshes).toEqual([m2])
            expect(factory.created[1].destroyed).toEqual(false)
        })

        it('re-uses the last batch if new mesh has same topology', () => {
            const factory = new TestBatchFactory()
            const bm = new BatchManager(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            bm.insert(new RenderableGraphic("foo", 1, [m1]))
            bm.insert(new RenderableGraphic("bar", 1, [m2]))
            expect(factory.created.length).toEqual(1)
            expect(factory.created[0].updated).toEqual(true)
            expect(factory.created[0].meshes).toEqual([m1, m2])
            expect(factory.created[0].destroyed).toEqual(false)
        })

    })

})
