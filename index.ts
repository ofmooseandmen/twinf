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
        const ystad = T.LatLong.ofDegrees(55.4295, 13.82)
        const malmo = T.LatLong.ofDegrees(55.6050, 13.0038)
        const lund = T.LatLong.ofDegrees(55.7047, 13.1910)
        const helsingborg = T.LatLong.ofDegrees(56.0465, 12.6945)
        const kristianstad = T.LatLong.ofDegrees(56.0294, 14.1567)
        const jonkoping = T.LatLong.ofDegrees(57.7826, 14.1618)
        const linkoping = T.LatLong.ofDegrees(58.4108, 15.6214)
        const norrkoping = T.LatLong.ofDegrees(58.5877, 16.1924)
        const goteborg = T.LatLong.ofDegrees(57.7089, 11.9746)
        const stockholm = T.LatLong.ofDegrees(59.3293, 18.0686)

        // Gotland
        const visby = T.LatLong.ofDegrees(57.6349, 18.2948)
        const irevik = T.LatLong.ofDegrees(57.8371, 18.5866)
        const larbro = T.LatLong.ofDegrees(57.7844, 18.7890)
        const blase = T.LatLong.ofDegrees(57.8945, 18.8440)
        const farosund = T.LatLong.ofDegrees(57.8613, 19.0540)
        const slite = T.LatLong.ofDegrees(57.7182, 18.7923)
        const gothem = T.LatLong.ofDegrees(57.5790, 18.7298)
        const ljugarn = T.LatLong.ofDegrees(57.3299, 18.7084)
        const nar = T.LatLong.ofDegrees(57.2573, 18.6351)
        const vamlingbo = T.LatLong.ofDegrees(56.9691, 18.2319)
        const sundre = T.LatLong.ofDegrees(56.9364, 18.1834)
        const sanda = T.LatLong.ofDegrees(57.4295, 18.2223)

        const p = new T.GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad],
            T.Paint.stroke(new T.Stroke(T.Colour.LIMEGREEN, 5)))
        const paint = T.Paint.fill(T.Colour.CORAL)
        const c2 = new T.GeoCircle(goteborg, T.Length.ofKilometres(10), paint)
        const c3 = new T.GeoCircle(jonkoping, T.Length.ofKilometres(5), paint)
        const c4 = new T.GeoCircle(norrkoping, T.Length.ofKilometres(5), paint)
        const c5 = new T.GeoCircle(linkoping, T.Length.ofKilometres(5), paint)
        const l1 = new T.GeoPolyline(
            [jonkoping, linkoping, norrkoping, stockholm, goteborg],
            new T.Stroke(T.Colour.DODGERBLUE, 1))
        const l2 = new T.GeoPolyline(
            [visby, irevik, larbro, blase,
                farosund, slite, gothem, ljugarn,
                nar, vamlingbo, sundre, sanda, visby],
            new T.Stroke(T.Colour.DODGERBLUE, 5))

        const rp = new T.GeoRelativePolygon(linkoping,
            [new T.Offset(50, 50), new T.Offset(50, 200), new T.Offset(70, 160),
            new T.Offset(90, 200), new T.Offset(110, 50)],
            T.Paint.complete(new T.Stroke(T.Colour.SLATEGRAY, 5), T.Colour.SNOW))

        const rl = new T.GeoRelativePolyline(
            norrkoping,
            [new T.Offset(50, 50), new T.Offset(50, 100), new T.Offset(75, 150)],
            new T.Stroke(T.Colour.NAVY, 3))

        this.world.insert(new T.Graphic("sak", 0, [p, c2, c3, l1, c4, c5, l2]))
        this.world.insert(new T.Graphic("andra", 0, [rp, rl]))
        DemoApp.parseCoastlines(this.world)

        this.simulateTrack(new T.Track(stockholm, T.Angle.ofDegrees(135), T.Speed.ofMetresPerSecond(555.5556)))

        this.world.startRendering()
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

    private static parseCoastlines(world: T.World) {
        DemoApp.load("./coastline.json",
            (data: any) => {
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
            },
            (_: any) => {
                /* damn. */
            })
    }

    private static load = (url: string, success: (data: any) => void, error: (error: any) => void) => {
        const xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                // done
                const status = xhr.status
                if (status == 200) {
                    const data = JSON.parse(xhr.responseText)
                    success(data)
                } else {
                    error(status)
                }
            }
        }
        xhr.send()
    }

}
