import * as T from "twinf"

const ctx: Worker = self as any

ctx.onmessage = (_: MessageEvent) => {
    const h = () => {
        computeTracks().then(tracks => {
            ctx.postMessage(tracks)
            setTimeout(h, 30000)     
        })
    }
    setTimeout(h, 100)
}

async function computeTracks(): Promise<ReadonlyArray<T.Graphic>> {
    const states = await fetchStateVectors()
    const len = states.length
    const zIndex = 1

    const adsbPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPPINK, 1), T.Colour.LIGHTPINK)
    const asterixPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPSKYBLUE, 1), T.Colour.SKYBLUE)
    const mlatPaint = T.Paint.complete(new T.Stroke(T.Colour.LIMEGREEN, 1), T.Colour.LIGHTGREEN)
    const paints = [adsbPaint, asterixPaint, mlatPaint]

    const offsets = [new T.Offset(-5, -5), new T.Offset(-5, 5), new T.Offset(5, 5), new T.Offset(5, -5)]
    let res = new Array<T.Graphic>()
    for (let i = 0; i < len; i++) {
        const state = states[i]
        if (state.position !== undefined) {
            const paint = paints[state.positionSource]
            const c = [new T.GeoRelativePolygon(state.position, offsets, paint)]
            res.push(new T.Graphic(state.icao24, zIndex, c))
        }
    }
    console.log("Got " + res.length + " tracks")
    return res
}

async function fetchStateVectors(): Promise<ReadonlyArray<StateVector>> {
    try {
        // https://opensky-network.org/api/states/all
        const response = await fetch('/assets/opensky-all.json');
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
