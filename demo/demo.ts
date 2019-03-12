import { Angle } from "../src/angle"
import { CoordinateSystems } from "../src/coordinate-systems"
import { Colour } from "../src/colour"
import { LatLong } from "../src/latlong"
import { Length } from "../src/length"
import * as S from "../src/shape"
import { Graphic, World, WorldDefinition } from "../src/world"
import { Vector2d } from "../src/space2d"
import { Math3d, Vector3d } from "../src/space3d"

export class Demo {

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

    private readonly world: World
    private l: (c: string, r: string) => void

    constructor(gl: WebGL2RenderingContext) {
        const linkoping = LatLong.ofDegrees(58.4108, 15.6214)
        const def = new WorldDefinition(linkoping, Length.ofKilometres(2000), Angle.ofDegrees(0), Colour.GAINSBORO)
        this.world = new World(gl, def, 60)
        this.l = (_c, _r) => { }
    }

    setOnChange(l: (c: string, r: string) => void) {
        this.l = l
        this.fireEvent()
    }

    play() {
        const ystad = LatLong.ofDegrees(55.4295, 13.82)
        const malmo = LatLong.ofDegrees(55.6050, 13.0038)
        const lund = LatLong.ofDegrees(55.7047, 13.1910)
        const helsingborg = LatLong.ofDegrees(56.0465, 12.6945)
        const kristianstad = LatLong.ofDegrees(56.0294, 14.1567)
        const jonkoping = LatLong.ofDegrees(57.7826, 14.1618)
        const linkoping = LatLong.ofDegrees(58.4108, 15.6214)
        const norrkoping = LatLong.ofDegrees(58.5877, 16.1924)
        const goteborg = LatLong.ofDegrees(57.7089, 11.9746)
        const stockholm = LatLong.ofDegrees(59.3293, 18.0686)

        // Gotland
        const visby = LatLong.ofDegrees(57.6349, 18.2948)
        const irevik = LatLong.ofDegrees(57.8371, 18.5866)
        const larbro = LatLong.ofDegrees(57.7844, 18.7890)
        const blase = LatLong.ofDegrees(57.8945, 18.8440)
        const farosund = LatLong.ofDegrees(57.8613, 19.0540)
        const slite = LatLong.ofDegrees(57.7182, 18.7923)
        const gothem = LatLong.ofDegrees(57.5790, 18.7298)
        const ljugarn = LatLong.ofDegrees(57.3299, 18.7084)
        const nar = LatLong.ofDegrees(57.2573, 18.6351)
        const vamlingbo = LatLong.ofDegrees(56.9691, 18.2319)
        const sundre = LatLong.ofDegrees(56.9364, 18.1834)
        const sanda = LatLong.ofDegrees(57.4295, 18.2223)

        const p = new S.GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad],
            S.Painting.stroked(Colour.LIMEGREEN))
        const paint = S.Painting.filled(Colour.CORAL)
        const c2 = new S.GeoCircle(goteborg, Length.ofKilometres(10), paint)
        const c3 = new S.GeoCircle(jonkoping, Length.ofKilometres(5), paint)
        const c4 = new S.GeoCircle(norrkoping, Length.ofKilometres(5), paint)
        const c5 = new S.GeoCircle(linkoping, Length.ofKilometres(5), paint)
        const l1 = new S.GeoPolyline([jonkoping, linkoping, norrkoping, stockholm, goteborg], Colour.DODGERBLUE)
        const l2 = new S.GeoPolyline(
            [visby, irevik, larbro, blase,
                farosund, slite, gothem, ljugarn,
                nar, vamlingbo, sundre, sanda, visby],
            Colour.DODGERBLUE)

        const rp = new S.GeoRelativePolygon(linkoping,
            [new Vector2d(50, 50), new Vector2d(100, 50), new Vector2d(50, 100)],
            S.Painting.strokedAndFilled(Colour.SLATEGRAY, Colour.SNOW))

        const rl = new S.GeoRelativePolyline(norrkoping,
            [new Vector2d(50, 50), new Vector2d(50, 100), new Vector2d(50, 150)], Colour.NAVY)

        this.world.putGraphic(new Graphic("sak", [p, c2, c3, c4, c5, l1, l2]))
        this.world.putGraphic(new Graphic("andra", [rp, rl]))
        Demo.parseCoastlines(this.world)

        this.simulateTrack(CoordinateSystems.latLongToGeocentric(stockholm),
            Angle.ofDegrees(135), 555.5556)

        this.world.startRendering()
    }

    handleKeyboardEvent(evt: KeyboardEvent) {
        const delta = Demo.DELTA.get(evt.key)
        const factor = Demo.FACTOR.get(evt.key)
        if (delta !== undefined) {
            this.world.pan(delta[0], delta[1])
        } else if (factor !== undefined) {
            this.world.setRange(this.world.range() * factor)
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
        const r = (this.world.range() / 1000).toFixed(0) + " km"
        this.l(ll, r)
    }

    private simulateTrack(p0: Vector3d, b: Angle, ms: number) {
        var elapsedSecs = 0
        const h = () => {
            elapsedSecs = elapsedSecs + 1
            const p = Demo.position(p0, b, ms, elapsedSecs)
            const ll = CoordinateSystems.geocentricToLatLong(p)
            const c = [new S.GeoCircle(ll, Length.ofKilometres(5), S.Painting.strokedAndFilled(Colour.DEEPPINK, Colour.LIGHTPINK))]
            this.world.putGraphic(new Graphic("Track", c))
            setTimeout(h, 1000)
        }
        setTimeout(h, 1000)
    }

    private static parseCoastlines(world: World) {
        Demo.load("./coastline.json",
            (data: any) => {
                let length = data.features.length
                let shapes = new Array<S.Shape>()
                for (let i = 0; i < length; i++) {
                    let feature = data.features[i]
                    if (feature.properties.featurecla == "Coastline") {
                        let coordinates = feature.geometry.coordinates
                        let nb_coordinates = coordinates.length
                        let positions = new Array<LatLong>()
                        for (let j = 0; j < nb_coordinates; j++) {
                            let coord = coordinates[j]
                            // Be careful : longitude first, then latitude in geoJSON files
                            let point = LatLong.ofDegrees(coord[1], coord[0])
                            positions.push(point)
                        }
                        shapes.push(new S.GeoPolyline(positions, Colour.DIMGRAY))
                    }
                }
                world.putGraphic(new Graphic("coastlines", shapes))
            },
            (_: any) => {
                /* damn. */
            })
    }

    private static load = (url: string, success: (data: any) => void, error: (error: any) => void) => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        xhr.onreadystatechange = () => {
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (xhr.readyState == 4) { // `DONE`
                let status = xhr.status
                if (status == 200) {
                    let data = JSON.parse(xhr.responseText)
                    success(data)
                } else {
                    error(status)
                }
            }
        }
        xhr.send()
    }

    private static position(p0: Vector3d, b: Angle, ms: number, sec: number): Vector3d {
        const c = Demo.course(p0, b)
        const a = ms / World.EARTH_RADIUS * sec
        return Math3d.add(Math3d.scale(p0, Math.cos(a)), Math3d.scale(c, Math.sin(a)))
    }

    private static course(p: Vector3d, b: Angle): Vector3d {
        const ll = CoordinateSystems.geocentricToLatLong(p)
        const lat = ll.latitude()
        const lon = ll.longitude()
        const _rx = Demo.rx(b)
        const _ry = Demo.ry(lat)
        const _rz = Demo.rz(Angle.ofDegrees(-lon.degrees()))
        const r = Math3d.multmm(Math3d.multmm(_rz, _ry), _rx)
        return new Vector3d(r[0].z(), r[1].z(), r[2].z())
    }

    private static rx(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(1, 0, 0),
            new Vector3d(0, c, s),
            new Vector3d(0, -s, c)
        ]
    }

    private static ry(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, 0, -s),
            new Vector3d(0, 1, 0),
            new Vector3d(s, 0, c)
        ]
    }

    private static rz(a: Angle): Array<Vector3d> {
        const c = Angle.cos(a)
        const s = Angle.sin(a)
        return [
            new Vector3d(c, s, 0),
            new Vector3d(-s, c, 0),
            new Vector3d(0, 0, 1)
        ]
    }

}
