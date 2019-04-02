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

    constructor(gl: WebGL2RenderingContext) {
        const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        const def = new T.WorldDefinition(linkoping, T.Length.ofKilometres(2000), T.Angle.ofDegrees(0), T.Colour.GAINSBORO)
        this.world = new T.World(gl, def)
        this.l = (_c, _r) => { }
    }

    setOnChange(l: (c: string, r: string) => void) {
        this.l = l
        this.fireEvent()
    }

    run() {
        // const ystad = T.LatLong.ofDegrees(55.4295, 13.82)
        // const malmo = T.LatLong.ofDegrees(55.6050, 13.0038)
        // const lund = T.LatLong.ofDegrees(55.7047, 13.1910)
        // const helsingborg = T.LatLong.ofDegrees(56.0465, 12.6945)
        // const kristianstad = T.LatLong.ofDegrees(56.0294, 14.1567)
        // const jonkoping = T.LatLong.ofDegrees(57.7826, 14.1618)
        // const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        // const norrkoping = T.LatLong.ofDegrees(58.5877, 16.1924)
        // const goteborg = T.LatLong.ofDegrees(57.7089, 11.9746)
        // const stockholm = T.LatLong.ofDegrees(59.3293, 18.0686)
        //
        // // Gotland
        // const visby = T.LatLong.ofDegrees(57.6349, 18.2948)
        // const irevik = T.LatLong.ofDegrees(57.8371, 18.5866)
        // const larbro = T.LatLong.ofDegrees(57.7844, 18.7890)
        // const blase = T.LatLong.ofDegrees(57.8945, 18.8440)
        // const farosund = T.LatLong.ofDegrees(57.8613, 19.0540)
        // const slite = T.LatLong.ofDegrees(57.7182, 18.7923)
        // const gothem = T.LatLong.ofDegrees(57.5790, 18.7298)
        // const ljugarn = T.LatLong.ofDegrees(57.3299, 18.7084)
        // const nar = T.LatLong.ofDegrees(57.2573, 18.6351)
        // const vamlingbo = T.LatLong.ofDegrees(56.9691, 18.2319)
        // const sundre = T.LatLong.ofDegrees(56.9364, 18.1834)
        // const sanda = T.LatLong.ofDegrees(57.4295, 18.2223)
        //
        // const p = new T.GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad],
        //     T.Paint.stroke(new T.Stroke(T.Colour.LIMEGREEN, 5)))
        // const paint = T.Paint.fill(T.Colour.CORAL)
        // const c2 = new T.GeoCircle(goteborg, T.Length.ofKilometres(10), paint)
        // const c3 = new T.GeoCircle(jonkoping, T.Length.ofKilometres(5), paint)
        // const c4 = new T.GeoCircle(norrkoping, T.Length.ofKilometres(5), paint)
        // const c5 = new T.GeoCircle(linkoping, T.Length.ofKilometres(5), paint)
        // const l1 = new T.GeoPolyline(
        //     [jonkoping, linkoping, norrkoping, stockholm, goteborg],
        //     new T.Stroke(T.Colour.DODGERBLUE, 1))
        // const l2 = new T.GeoPolyline(
        //     [visby, irevik, larbro, blase,
        //         farosund, slite, gothem, ljugarn,
        //         nar, vamlingbo, sundre, sanda, visby],
        //     new T.Stroke(T.Colour.DODGERBLUE, 5))
        //
        // const rp = new T.GeoRelativePolygon(linkoping,
        //     [new T.Offset(50, 50), new T.Offset(50, 200), new T.Offset(70, 160),
        //     new T.Offset(90, 200), new T.Offset(110, 50)],
        //     T.Paint.complete(new T.Stroke(T.Colour.SLATEGRAY, 5), T.Colour.SNOW))
        //
        // const rl = new T.GeoRelativePolyline(
        //     norrkoping,
        //     [new T.Offset(50, 50), new T.Offset(50, 100), new T.Offset(75, 150)],
        //     new T.Stroke(T.Colour.NAVY, 3))
        //
        // this.world.insert(new T.Graphic("sak", 0, [p, c2, c3, l1, c4, c5, l2]))
        // this.world.insert(new T.Graphic("andra", 0, [rp, rl]))
        //
        // this.simulateTrack(new T.Track(stockholm, T.Angle.ofDegrees(135), T.Speed.ofMetresPerSecond(555.5556)))

        this.world.startRendering()

        DemoApp.addCoastline(this.world)
        // DemoApp.addStateVectors(this.world)
        this.showTracks()
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

    private simulateTrack(track: T.Track) {
        var elapsedSecs = 0
        const h = () => {
            elapsedSecs = elapsedSecs + 1
            const p = T.Kinematics.position(track, T.Duration.ofSeconds(elapsedSecs), T.World.EARTH_RADIUS)
            const offset = new T.Offset(0, 0)
            const radius = 16
            const paint = T.Paint.complete(new T.Stroke(T.Colour.DEEPPINK, 12), T.Colour.LIGHTPINK)
            const c = [new T.GeoRelativeCircle(p, offset, radius, paint)]
            this.world.insert(new T.Graphic("Track", 1, c))
            setTimeout(h, 1000)
        }
        setTimeout(h, 1000)
    }

    private static async addCoastline(world: T.World) {

        let response = await fetch('./coastline.json');
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

        const adsbPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPPINK, 2), T.Colour.LIGHTPINK)
        const asterixPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPSKYBLUE, 2), T.Colour.SKYBLUE)
        const mlatPaint = T.Paint.complete(new T.Stroke(T.Colour.LIMEGREEN, 2), T.Colour.LIGHTGREEN)
        const paints = [ adsbPaint, asterixPaint, mlatPaint]

        const offset = new T.Offset(0, 0)

        for (let i = 0; i < len; i++) {
            const state = states[i]
            if (state.position !== undefined) {
                const paint = paints[state.positionSource]
                const c = [new T.GeoRelativeCircle(state.position, offset, 5, paint)]
                world.insert(new T.Graphic(state.icao24, zIndex, c))
            }
        }
    }

    private static async fetchStateVectors(): Promise<ReadonlyArray<StateVector>> {
        try {
            const response = await fetch('https://opensky-network.org/api/states/all');
            const data = await response.json();
            console.log("Fetch states from opensky")
            for (const prop in data) {
                if (prop === "states") {
                    const states : Array<Array<string>> = (<any> data)[prop]
                    return states.map(StateVector.parse)
                }
            }
            return []
        } catch(err) {
            console.log("Could not fetch states from opensky: " + err)
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
    callsign ? :string
    country :string
    timePosition ? : number
    lastContact : number
    position ? : T.LatLong
    baroAltitude ? : T.Length
    onGround : boolean
    velocity ? : T.Speed
    trueBearing ? : T.Angle
    verticalRate ? : T.Speed
    geoAltitude ? : T.Length
    squawk ? : string
    spi  : boolean
    positionSource :  PositionSource

    private constructor() {
        this.icao24 = ""
        this.country = ""
        this.lastContact = 0
        this.onGround = true
        this.spi = false
        this.positionSource = PositionSource.ADSB
    }

    static parse(arr: Array<string>) : StateVector {
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
