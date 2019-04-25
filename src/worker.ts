import * as T from 'twinf'

class EventHandler {

    private mesher: T.Mesher | undefined

    constructor() { }

    handle(e: MessageEvent) {
        const data = e.data
        const topic = data.topic
        switch (topic) {
            case 'mesher':
                this.mesher = T.Mesher.fromLiteral(JSON.parse(data.payload))
                break
            case 'coastline':
                if (this.mesher === undefined) {
                    throw new Error('Mesher not initialised')
                }
                computeCoastline(this.mesher).then(c => {
                    ctx.postMessage({
                        'topic': 'coastline',
                        'payload': JSON.stringify(c)
                    })
                }).catch(e => {
                    ctx.postMessage({
                        'topic': 'error',
                        'payload': e.toString()
                    })
                })
                break
            case 'tracks':
                if (this.mesher === undefined) {
                    throw new Error('Mesher not initialised')
                }
                const m = this.mesher
                const h = () => {
                    computeTracks(m).then(tracks => {
                        ctx.postMessage({
                            'topic': 'tracks',
                            'payload': JSON.stringify(tracks)
                        })
                    }).catch(e => {
                        ctx.postMessage({
                            'topic': 'error',
                            'payload': e.toString()
                        })
                    }).finally(() => setTimeout(h, 10000))
                }
                setTimeout(h, 100)
                break
        }

    }

}

const ctx: Worker = self as any
const eh = new EventHandler()
const adsbPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPPINK, 2), T.Colour.LIGHTPINK)
const asterixPaint = T.Paint.complete(new T.Stroke(T.Colour.DEEPSKYBLUE, 2), T.Colour.SKYBLUE)
const mlatPaint = T.Paint.complete(new T.Stroke(T.Colour.LIMEGREEN, 2), T.Colour.LIGHTGREEN)
const trackPaints = [adsbPaint, asterixPaint, mlatPaint]
const trackOffsets = [new T.Offset(-5, -5), new T.Offset(-5, 5), new T.Offset(5, 5), new T.Offset(5, -5)]
const trackZIndex = 1

ctx.onmessage = eh.handle

async function computeCoastline(mesher: T.Mesher): Promise<T.RenderableGraphic> {

    const response = await fetch('https://ofmooseandmen.github.io/twinf/assets/coastline.json');
    const data = await response.json();
    const length = data.features.length
    let meshes = new Array<T.Mesh>()
    for (let i = 0; i < length; i++) {
        const feature = data.features[i]
        if (feature.properties.featurecla == 'Coastline') {
            const coordinates = feature.geometry.coordinates
            const nb_coordinates = coordinates.length
            const positions = new Array<T.LatLong>()
            for (let j = 0; j < nb_coordinates; j++) {
                const coord = coordinates[j]
                // Be careful : longitude first, then latitude in geoJSON files
                const point = T.LatLong.ofDegrees(coord[1], coord[0])
                positions.push(point)
            }
            const shape = new T.GeoPolyline(positions, new T.Stroke(T.Colour.DIMGRAY, 1))
            meshes = meshes.concat(mesher.meshShape(shape))
        }
    }
    return new T.RenderableGraphic('coastlines', -1, meshes)
}


async function computeTracks(mesher: T.Mesher): Promise<ReadonlyArray<T.RenderableGraphic>> {
    const states = await fetchStateVectors()
    const len = states.length

    let res = new Array<T.RenderableGraphic>()
    for (let i = 0; i < len; i++) {
        const state = states[i]
        if (state.position !== undefined) {
            const paint = trackPaints[state.positionSource]
            const m = mesher.meshShape(new T.GeoRelativePolygon(state.position, trackOffsets, paint))
            res.push(new T.RenderableGraphic(state.icao24, trackZIndex, m))
        }
    }
    return res
}

async function fetchStateVectors(): Promise<ReadonlyArray<StateVector>> {
    const response = await fetch('https://opensky-network.org/api/states/all');
    const data = await response.json();
    for (const prop in data) {
        if (prop === 'states') {
            const states: Array<Array<string>> = (<any>data)[prop]
            return states.map(StateVector.parse)
        }
    }
    return []
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
        res.onGround = (arr[8] === 'true') ? true : false
        if (arr[9] !== null) { res.velocity = T.Speed.ofMetresPerSecond(parseFloat(arr[9])) }
        if (arr[10] !== null) { res.trueBearing = T.Angle.ofDegrees(parseFloat(arr[10])) }
        if (arr[11] !== null) { res.verticalRate = T.Speed.ofMetresPerSecond(parseFloat(arr[11])) }
        if (arr[13] !== null) { res.geoAltitude = T.Length.ofMetres(parseFloat(arr[13])) }
        if (arr[14] !== null) { res.squawk = arr[14] }
        res.spi = (arr[15] === 'true') ? true : false
        if (arr[16] === '0') {
            res.positionSource = PositionSource.ADSB
        } else if (arr[16] === '1') {
            res.positionSource = PositionSource.ASTERIX
        } else if (arr[16] === '2') {
            res.positionSource = PositionSource.MLAT
        }
        return res
    }

}
