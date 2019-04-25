import { Batch, Batcher, BatchFactory } from '../src/batching'
import { RenderableGraphic } from '../src/graphic'
import { DrawMode, Mesh } from '../src/meshing'

class TestBatch extends Batch {

    drawMode: DrawMode
    updated: number
    destroyed: boolean
    drawn: number
    meshes: ReadonlyArray<Mesh>

    constructor(drawMode: DrawMode) {
        super()
        this.drawMode = drawMode
        this.updated = 0
        this.destroyed = false
        this.drawn = 0
        this.meshes = []
    }

    update(meshes: ReadonlyArray<Mesh>) {
        this.updated++
        this.meshes = meshes
    }

    destroy() {
        this.destroyed = true
    }

    draw() {
        this.drawn++
    }

}

class TestBatchFactory implements BatchFactory<TestBatch> {

    created: Array<TestBatch>

    constructor() {
        this.created = []
    }

    fits(mesh: Mesh, batch: TestBatch): boolean {
        return mesh.drawMode() === batch.drawMode
    }

    createBatch(mesh: Mesh): TestBatch {
        const b = new TestBatch(mesh.drawMode())
        this.created.push(b)
        return b
    }

}

function assertDestroyed(batch: TestBatch) {
    expect(batch.destroyed).toEqual(true)
}

function assertDrawn(expectedMeshes: ReadonlyArray<Mesh>,
    expectedUpdates: number, expectedDraws: number,
    batch: TestBatch) {
    expect(batch.destroyed).toEqual(false)
    expect(batch.updated).toEqual(expectedUpdates)
    expect(batch.drawn).toEqual(expectedDraws)
    expect(batch.meshes).toEqual(expectedMeshes)
}

function assertOnlyMeshes(expectedMeshes: ReadonlyArray<Mesh>, batch: TestBatch) {
    expect(batch.destroyed).toEqual(false)
    expect(batch.updated).toEqual(0)
    expect(batch.drawn).toEqual(0)
    /* clean batch to get the meshes. */
    batch.clean()
    expect(batch.meshes).toEqual(expectedMeshes)
}

describe('Batcher', () => {

    describe('insert', () => {

        test('it creates a new batch for new z-index', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(graphic)
            expect(factory.created.length).toEqual(1)
            assertOnlyMeshes(meshes, factory.created[0])
        })

        test('it destroys the existing batch when changing the z-index', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const oldGraphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(oldGraphic)
            const newGraphic = new RenderableGraphic("foo", 2, meshes)
            batcher.insert(newGraphic)
            expect(factory.created.length).toEqual(2)
            assertDestroyed(factory.created[0])
            assertOnlyMeshes(meshes, factory.created[1])
        })

        it('destroys the existing batch when it no longer fits the mesh', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const oldMeshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const oldGraphic = new RenderableGraphic("foo", 1, oldMeshes)
            batcher.insert(oldGraphic)
            const newMeshes = [new Mesh([], undefined, [], [], DrawMode.LINES)]
            const newGraphic = new RenderableGraphic("foo", 1, newMeshes)
            batcher.insert(newGraphic)
            assertDestroyed(factory.created[0])
            assertOnlyMeshes(newMeshes, factory.created[1])
        })

        it('creates one batch if all meshes fit the same batch', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const meshes = [
                new Mesh([], undefined, [], [], DrawMode.TRIANGLES),
                new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            ]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(graphic)
            expect(factory.created.length).toEqual(1)
            assertOnlyMeshes(meshes, factory.created[0])
        })

        it('creates one batch per mesh it all do not fit the same batch', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.LINES)
            const meshes = [m1, m2]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(graphic)
            expect(factory.created.length).toEqual(2)
            assertOnlyMeshes([m1], factory.created[0])
            assertOnlyMeshes([m2], factory.created[1])
        })

        it('re-uses the last batch if new mesh fits it', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            batcher.insert(new RenderableGraphic("foo", 1, [m1]))
            batcher.insert(new RenderableGraphic("bar", 1, [m2]))
            expect(factory.created.length).toEqual(1)
            assertOnlyMeshes([m1, m2], factory.created[0])
        })

    })

    describe('draw', () => {

        it('considers a batch dirty a creation', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(graphic)
            batcher.draw()
            expect(factory.created.length).toEqual(1)
            assertDrawn(meshes, 1, 1, factory.created[0])
        })

        it('considers a batch dirty if its meshes have been updated between draws', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            batcher.insert(new RenderableGraphic("foo", 1, [m1]))
            batcher.draw()
            batcher.insert(new RenderableGraphic("bar", 1, [m2]))
            batcher.draw()
            expect(factory.created.length).toEqual(1)
            assertDrawn([m1, m2], 2, 2, factory.created[0])
        })

        it('does not update a clean batch', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const meshes = [new Mesh([], undefined, [], [], DrawMode.TRIANGLES)]
            const graphic = new RenderableGraphic("foo", 1, meshes)
            batcher.insert(graphic)
            batcher.draw()
            batcher.draw()
            expect(factory.created.length).toEqual(1)
            assertDrawn(meshes, 1, 2, factory.created[0])
        })

        it('draws all batches while updating only the diry ones', () => {
            const factory = new TestBatchFactory()
            const batcher = new Batcher(factory)
            const m1 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            const m2 = new Mesh([], undefined, [], [], DrawMode.TRIANGLES)
            batcher.insert(new RenderableGraphic("foo", 1, [m1]))
            batcher.draw()
            batcher.insert(new RenderableGraphic("bar", 2, [m2]))
            batcher.draw()
            expect(factory.created.length).toEqual(2)
            assertDrawn([m1], 1, 2, factory.created[0])
            assertDrawn([m2], 1, 1, factory.created[1])
        })

    })

})
