import * as T from "twinf"

export class DemoApp {

    private static readonly DELTA = new Map<string, [number, number]>([
        ["ArrowUp", [0, -10]],
        ["ArrowDown", [0, 10]],
        ["ArrowLeft", [-10, 0]],
        ["ArrowRight", [10, 0]]
    ])

    private static readonly FACTOR = new Map<string, number>([
        ["+", 0.95],
        ["-", 1.05],
    ])

    private readonly world: T.World
    private l: (c: string, r: string) => void
    private readonly worker: Worker

    constructor(gl: WebGL2RenderingContext) {
        const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        const def = new T.WorldDefinition(linkoping, T.Length.ofKilometres(2000), T.Angle.ofDegrees(0), T.Colour.GAINSBORO)
        this.world = new T.World(gl, def)
        this.l = (_c, _r) => { }
        this.worker = new Worker('/build/opensky.js')
        this.worker.onmessage = (e: MessageEvent) => {
            const tracks = e.data
            console.log(tracks)
            for (let i = 0; i < tracks.length; i++) {
                this.world.insert(tracks[i])
            }
        }
    }

    setOnChange(l: (c: string, r: string) => void) {
        this.l = l
        this.fireEvent()
    }

    run() {
        this.world.startRendering()
        DemoApp.addCoastline(this.world)
        this.worker.postMessage("")
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
        const r = (this.world.range().kilometres()).toFixed(0) + " km"
        this.l(ll, r)
    }

    private showTracks() {
        const h = () => {
            DemoApp.addStateVectors(this.world)
            setTimeout(h, 30000)
        }
        setTimeout(h, 100)
    }

    private static async addCoastline(world: T.World) {

        let response = await fetch('/assets/coastline.json');
        let data = await response.json();

        const length = data.features.length
        const shapes = new Array<T.Shape>()
        for (let i = 0; i < length; i++) {
            const feature = data.features[i]
            if (feature.properties.featurecla == "Coastline") {
                const coordinates = feature.geometry.coordinates
                const nb_coordinates = coordinates.length
                const positions = new Array<T.LatLong>()
                for (let j = 0; j < nb_coordinates; j++) {
                    const coord = coordinates[j]
                    // Be careful : longitude first, then latitude in geoJSON files
                    const point = T.LatLong.ofDegrees(coord[1], coord[0])
                    positions.push(point)
                }
                shapes.push(new T.GeoPolyline(positions, new T.Stroke(T.Colour.DIMGRAY, 1)))
            }
        }
        world.insert(new T.Graphic("coastlines", -1, shapes))
    }

    private static async addStateVectors(world: T.World) {
        const states = await DemoApp.fetchStateVectors()
        const len = states.length
        const zIndex = 1

        const adsbPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPPINK, 1), T.Colour.LIGHTPINK)
        const asterixPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPSKYBLUE, 1), T.Colour.SKYBLUE)
        const mlatPaint = T.Paint.complete(new T.Stroke(T.Colour.LIMEGREEN, 1), T.Colour.LIGHTGREEN)
        const paints = [adsbPaint, asterixPaint, mlatPaint]

        const offsets = [new T.Offset(-5, -5), new T.Offset(-5, 5), new T.Offset(5, 5), new T.Offset(5, -5)]

        for (let i = 0; i < len; i++) {
            const state = states[i]
            if (state.position !== undefined) {
                const paint = paints[state.positionSource]
                const c = [new T.GeoRelativePolygon(state.position, offsets, paint)]
                world.insert(new T.Graphic(state.icao24, zIndex, c))
            }
        }
    }

    private static async fetchStateVectors(): Promise<ReadonlyArray<StateVector>> {
        try {
            // https://opensky-network.org/api/states/all
            const response = await fetch('../assets/opensky-all.json');
            const data = await response.json();
            for (const prop in data) {
                if (prop === "states") {
                    const states: Array<Array<string>> = (<any>data)[prop]
                    return states.map(StateVector.parse)
                }
            }
            return []
        } catch (err) {
            return []
        }
    }

}

enum PositionSource {
    ADSB,
    ASTERIX,
    MLAT
}

class StateVector {

    icao24: string
    callsign?: string
    country: string
    timePosition?: number
    lastContact: number
    position?: T.LatLong
    baroAltitude?: T.Length
    onGround: boolean
    velocity?: T.Speed
    trueBearing?: T.Angle
    verticalRate?: T.Speed
    geoAltitude?: T.Length
    squawk?: string
    spi: boolean
    positionSource: PositionSource

    private constructor() {
        this.icao24 = ""
        this.country = ""
        this.lastContact = 0
        this.onGround = true
        this.spi = false
        this.positionSource = PositionSource.ADSB
    }

    static parse(arr: Array<string>): StateVector {
        let res = new StateVector()
        res.icao24 = arr[0]
        if (arr[1] !== null) { res.callsign = arr[1] }
        res.country = arr[2]
        if (arr[3] !== null) { res.timePosition = parseInt(arr[3]) }
        res.lastContact = parseInt(arr[4])
        if (arr[5] !== null && arr[6] !== null) {
            res.position = T.LatLong.ofDegrees(parseFloat(arr[6]), parseFloat(arr[5]))
        }
        if (arr[7] !== null) { res.baroAltitude = T.Length.ofMetres(parseFloat(arr[7])) }
        res.onGround = (arr[8] === "true") ? true : false
        if (arr[9] !== null) { res.velocity = T.Speed.ofMetresPerSecond(parseFloat(arr[9])) }
        if (arr[10] !== null) { res.trueBearing = T.Angle.ofDegrees(parseFloat(arr[10])) }
        if (arr[11] !== null) { res.verticalRate = T.Speed.ofMetresPerSecond(parseFloat(arr[11])) }
        if (arr[13] !== null) { res.geoAltitude = T.Length.ofMetres(parseFloat(arr[13])) }
        if (arr[14] !== null) { res.squawk = arr[14] }
        res.spi = (arr[15] === "true") ? true : false
        if (arr[16] === "0") {
            res.positionSource = PositionSource.ADSB
        } else if (arr[16] === "1") {
            res.positionSource = PositionSource.ASTERIX
        } else if (arr[16] === "2") {
            res.positionSource = PositionSource.MLAT
        }
        return res
    }

}
