import { Angle } from "./angle"
import { LatLong } from "./latlong"
import {
    CoordinateSystems,
    StereographicProjection,
    CanvasAffineTransform,
    CanvasDimension
} from "./coordinate-systems"
import { Renderer } from "./renderer"
import * as S from "./shapes"

export class Playground {

    private constructor() { }

    static play(gl: WebGL2RenderingContext) {
        const cd = new CanvasDimension(gl.canvas.width, gl.canvas.height)

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

        const p = new S.GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad])
        const c1 = new S.GeoCircle(stockholm, 20000)
        const c2 = new S.GeoCircle(goteborg, 10000)
        const c3 = new S.GeoCircle(jonkoping, 5000)
        const c4 = new S.GeoCircle(norrkoping, 5000)
        const c5 = new S.GeoCircle(linkoping, 5000)
        const l1 = new S.GeoPolyline([jonkoping, linkoping, norrkoping, stockholm, goteborg])
        const l2 = new S.GeoPolyline([
            visby, irevik, larbro, blase,
            farosund, slite, gothem, ljugarn,
            nar, vamlingbo, sundre, sanda, visby])

        const earthRadius = 6_371_000 // earth radius, 6371 km

        // goteborg is the projection centre
        const sp = CoordinateSystems.computeStereographicProjection(goteborg, earthRadius)

        // canvas is centred at linkoping with a range of 2000 km (1000 km either side)
        const range = 2_000_000
        const af = CoordinateSystems.computeCanvasAffineTransform(linkoping, Angle.ofDegrees(0), range, cd, sp)

        const shapes = [p, c1, c2, c3, c4, c5, l1, l2].map(s => S.ShapeConverter.toRenderableShape(s, sp))

        const renderer = new Renderer(gl)
        renderer.draw(shapes, af)
        // this.drawCoastline(renderer, sp, af)
    }

    private static drawCoastline(renderer: Renderer, sp: StereographicProjection,
        af: CanvasAffineTransform) {
        Playground.load("./coastline.json",
            (data: any) => {
                let length = data.features.length
                let shapes = new Array<S.RenderableShape>()
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
                        const line = new S.GeoPolyline(positions)
                        shapes.push(S.ShapeConverter.toRenderableShape(line, sp))
                    }
                }
                renderer.draw(shapes, af)
            },
            (error: any) => {
                /* damn. */
            })
    }

    private static load = (url: string, success: (data: any) => void, error: (error: any) => void) => {
        let xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.onreadystatechange = () => {
            // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
            if (xhr.readyState == 4) { // `DONE`
                let status = xhr.status;
                if (status == 200) {
                    let data = JSON.parse(xhr.responseText);
                    success(data);
                } else {
                    error(status);
                }
            }
        };
        xhr.send();
    };

}
