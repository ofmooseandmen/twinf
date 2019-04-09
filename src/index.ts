import * as T from 'twinf'

export class DemoApp {

    private static readonly DELTA = new Map<string, [number, number]>([
        ['ArrowUp', [0, -10]],
        ['ArrowDown', [0, 10]],
        ['ArrowLeft', [-10, 0]],
        ['ArrowRight', [10, 0]]
    ])

    private static readonly FACTOR = new Map<string, number>([
        ['+', 0.95],
        ['-', 1.05],
    ])

    private readonly world: T.World
    private l: (c: string, r: string) => void
    private readonly worker: Worker

    constructor(gl: WebGL2RenderingContext) {
        const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        const def = new T.WorldDefinition(
            linkoping,
            T.Length.ofKilometres(2000),
            T.Angle.ofDegrees(0),
            T.Colour.GAINSBORO)
        this.world = new T.World(gl, def)
        this.l = (_c, _r) => { }
        this.worker = new Worker('/build/worker.js')
        this.worker.postMessage({
            'topic': 'mesher',
            'payload': JSON.stringify(this.world.mesher())
        })
        this.worker.onmessage = (e: MessageEvent) => {
            const data = e.data
            const topic = data.topic
            const payload = JSON.parse(e.data.payload)
            switch (topic) {
                case 'coastline':
                    const c = T.RenderableGraphic.fromLiteral(payload)
                    this.world.insert(c)
                    break
                case 'tracks':
                    const tracks = payload.map(T.RenderableGraphic.fromLiteral)
                    for (let i = 0; i < tracks.length; i++) {
                        this.world.insert(tracks[i])
                    }
                    break
            }
        }
    }

    setOnChange(l: (c: string, r: string) => void) {
        this.l = l
        this.fireEvent()
    }

    run() {
        this.world.startRendering()
        this.worker.postMessage({
            'topic': 'coastline'
        })
        this.worker.postMessage({
            'topic': 'tracks'
        })
    }

    handleKeyboardEvent(evt: KeyboardEvent) {
        const delta = DemoApp.DELTA.get(evt.key)
        const factor = DemoApp.FACTOR.get(evt.key)
        if (delta !== undefined) {
            this.world.pan(delta[0], delta[1])
        } else if (factor !== undefined) {
            this.world.setRange(this.world.range().scale(factor))
        } else {
            return
        }
        this.fireEvent()
    }

    private fireEvent() {
        const c = this.world.centre()
        const lat = c.latitude().degrees()
        const lon = c.longitude().degrees()
        const ll = Math.abs(lat).toFixed(4)
            + (lat < 0 ? 'S' : 'N')
            + ' ' + Math.abs(lon).toFixed(4)
            + (lon < 0 ? 'W' : 'E')
        const r = (this.world.range().kilometres()).toFixed(0) + ' km'
        this.l(ll, r)
    }

}
