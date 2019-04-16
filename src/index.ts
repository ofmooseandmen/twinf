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
    private readonly animator: Animator
    private readonly events: Events
    private readonly worker: Worker

    constructor(gl: WebGL2RenderingContext) {
        const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        const def = new T.WorldDefinition(
            linkoping,
            T.Length.ofKilometres(2000),
            T.Angle.ofDegrees(0),
            T.Colour.GAINSBORO)
        this.world = new T.World(gl, def)
        this.events = new Events()
        
        this.animator = new Animator(() => this.world.render(), this.events, 60)

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
                    this.worker.postMessage({
                        'topic': 'tracks'
                    })
                    break
                case 'tracks':
                    const tracks = payload.map(T.RenderableGraphic.fromLiteral)
                    for (let i = 0; i < tracks.length; i++) {
                        this.world.insert(tracks[i])
                    }
                    this.events.fireEvent('tracksChanged', tracks.length)
                    break
                case 'error':
                    console.log(payload)
                    break
            }
        }
    }
    
    addEventListener(name: string, handler: any) {
        this.events.addEventListener(name, handler)
        if (name === 'centreChanged') {
            this.fireCentreChanged()
        } else if (name === 'rangeChanged') {
            this.fireRangeChanged()
        }
    }

    run() {
        this.animator.start()
        this.worker.postMessage({
            'topic': 'coastline'
        })
    }

    handleKeyboardEvent(evt: KeyboardEvent) {
        const delta = DemoApp.DELTA.get(evt.key)
        const factor = DemoApp.FACTOR.get(evt.key)
        if (delta !== undefined) {
            this.world.pan(delta[0], delta[1])
            this.fireCentreChanged()
        } else if (factor !== undefined) {
            this.world.setRange(this.world.range().scale(factor))
            this.fireRangeChanged()
        } else {
            return
        }
    }

    private fireCentreChanged() {
        const c = this.world.centre()
        const lat = c.latitude().degrees()
        const lon = c.longitude().degrees()
        const ll = Math.abs(lat).toFixed(4)
            + (lat < 0 ? 'S' : 'N')
            + ' ' + Math.abs(lon).toFixed(4)
            + (lon < 0 ? 'W' : 'E')
        this.events.fireEvent('centreChanged', ll)
    }

    private fireRangeChanged() {
        const r = this.world.range().kilometres().toFixed(0) + ' km'
        this.events.fireEvent('rangeChanged', r)
    }    

}

class Events {

    private els: any

    constructor() {
        this.els = {}
    }

    addEventListener(name: string, handler: any) {
        if (this.els.hasOwnProperty(name)) {
            this.els[name].push(handler);
        } else {
            this.els[name] = [handler];
        }
    }

    fireEvent(name: string, data: any) {
        if (!this.els.hasOwnProperty(name)) {
            return
        }
        const ls = this.els[name]
        const len = ls.length
        for (var i = 0; i < len; i++) {
            ls[i](data);
        }       
    }

}

class FpsTracker {
    
    private start: number
    private frames: number
    private readonly events: Events
    
    constructor(events: Events) {
        this.start = performance.now()
        this.frames = 0
        this.events = events
    }
    
    doneRendering() {
        this.frames = this.frames + 1
        const now = performance.now()
        const delta = now - this.start
        if (delta >= 1000) {
            const fps = Math.round(this.frames / delta * 1000)
            this.events.fireEvent('fpsChanged', fps)
            this.start = now
            this.frames = 0
        }
    }

}

class Animator {

    private readonly callback: Function
    private readonly fps: number

    private now: number
    private then: number
    private readonly interval: number
    private delta: number
    private handle: number
    
    private fpst: FpsTracker

    constructor(callback: Function, events: Events, fps: number) {
        this.callback = callback
        this.fps = fps

        this.now = performance.now()
        this.then = performance.now()
        this.interval = 1000 / this.fps
        this.delta = -1
        this.handle = -1
        
        this.fpst = new FpsTracker(events)
    }

    start() {
        this.render()
    }

    stop() {
        cancelAnimationFrame(this.handle)
    }

    private render() {
        this.handle = requestAnimationFrame(() => this.render());
        this.now = performance.now();
        this.delta = this.now - this.then;
        if (this.delta > this.interval) {
            this.then = this.now - (this.delta % this.interval);
            this.callback()
            this.fpst.doneRendering()
        }
    }

}

