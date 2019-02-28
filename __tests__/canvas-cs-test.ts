import { Angle } from "../src/angle"
import { LatLong } from "../src/latlong"
import { CoordinateSystems, CanvasDimension } from "../src/coordinate-systems"
import { Vector2d } from "../src/space2d"

import * as U from "./util"

describe("canvas coordinate system", () => {

    const pCentre = LatLong.ofDegrees(-27, 138)
    const earthRadius = 6371000
    const sp = CoordinateSystems.computeStereographicProjection(pCentre, earthRadius)

    const cCentre = LatLong.ofDegrees(-37.8136, 144.9631)
    const range = 1852000
    const rotation = Angle.ofDegrees(0)
    const cd = new CanvasDimension(1920, 1080)
    const af = CoordinateSystems.computeCanvasAffineTransform(cCentre, rotation, range, cd, sp)

    test("stereographic => canvas", () => {
        // tested against java AffineTransform
        const stereo = CoordinateSystems.geocentricToStereographic(
            CoordinateSystems.latLongToGeocentric(cCentre), sp)
        const expected = new Vector2d(960.0, 540)
        const actual = CoordinateSystems.stereographicToCanvas(stereo, af)
        U.assertV2Equals(expected, actual)
    })

    test("stereographicToCanvas(canvasToStereographic(p)) == p", () => {
        const p = new Vector2d(15.4, 4.51)
        const a = CoordinateSystems.stereographicToCanvas(
            CoordinateSystems.canvasToStereographic(p, af), af)
        U.assertV2Equals(p, a)
    })

    test("canvasToStereographic(stereographicToCanvas(p)) == p", () => {
        const p = new Vector2d(15.4, 4.51)
        const a = CoordinateSystems.canvasToStereographic(
            CoordinateSystems.stereographicToCanvas(p, af), af)
        U.assertV2Equals(p, a)
    })

    test("glMatrix", () => {
        const expected = Float32Array.of(
            0.001020728494040668, 0, 0, 0,
            0, -0.001020728494040668, 0, 0,
            0, 0, 1, 0,
            329.953369140625, -711.6326904296875, 0, 1
        )
        expect(af.glMatrix()).toEqual(expected)
    })

})
