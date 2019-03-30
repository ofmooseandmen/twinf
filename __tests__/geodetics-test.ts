import { Angle } from "../src/angle"
import { Geodetics } from "../src/geodetics"
import { LatLong } from "../src/latlong"
import { Length } from "../src/length"

import * as U from "./util"

describe("Geodetics", () => {

    const earthRadius = Length.ofMetres(6371000)

    describe("insideSurface", () => {

        const p1 = LatLong.ofDegrees(45, 1)
        const p2 = LatLong.ofDegrees(45, 2)
        const p3 = LatLong.ofDegrees(46, 1)
        const p4 = LatLong.ofDegrees(46, 2)
        const p5 = LatLong.ofDegrees(45.1, 1.1)
        const ystad = LatLong.ofDegrees(55.4295, 13.82)
        const malmo = LatLong.ofDegrees(55.6050, 13.0038)
        const lund = LatLong.ofDegrees(55.7047, 13.1910)
        const helsingborg = LatLong.ofDegrees(56.0465, 12.6945)
        const kristianstad = LatLong.ofDegrees(56.0294, 14.1567)

        test("returns false if polygon is empty", () => {
            expect(Geodetics.insideSurface(p1, [])).toBe(false)
        })

        test("returns false if polygon does not define at least a triangle",
            () => {
                expect(Geodetics.insideSurface(p1, [p1, p2])).toBe(false)
            })

        test("returns true if point is inside polygon", () => {
            expect(Geodetics.insideSurface(p5, [p1, p2, p4, p3])).toBe(true)
        })

        test("returns false if point is ouside polygon", () => {
            expect(
                Geodetics.insideSurface(Geodetics.antipode(p5), [p1, p2, p4, p3])
            ).toBe(false)
            expect(
                Geodetics.insideSurface(lund, [malmo, kristianstad, ystad])
            ).toBe(false)
        })

        test("returns false if point is a vertex of the polygon", () => {
            expect(Geodetics.insideSurface(p1, [p1, p2, p4, p3])).toBe(false)
        })

        test("handles closed polygons", () => {
            expect(Geodetics.insideSurface(p5, [p1, p2, p4, p3, p1])).toBe(true)
        })

        test("handles concave polygons", () => {
            const polygon = [malmo, ystad, kristianstad, helsingborg, lund]
            const hoor = LatLong.ofDegrees(55.9295, 13.5297)
            const hassleholm = LatLong.ofDegrees(56.1589, 13.7668)
            expect(Geodetics.insideSurface(hoor, polygon)).toBe(true)
            expect(Geodetics.insideSurface(hassleholm, polygon)).toBe(false)
        })

    })

    describe("destination", () => {

        test("destination with distance = 0 returns p", () => {
            const p = LatLong.ofDegrees(55.6050, 13.0038)
            expect(Geodetics.destination(p, Angle.ofDegrees(96.0217), Length.ofMetres(0), earthRadius)).toBe(p)
        })

        test("destination return the position along great-circle at distance and bearing", () => {
            const p = LatLong.ofDegrees(53.32055556, -1.72972222)
            const d = Geodetics.destination(p, Angle.ofDegrees(96.0217), Length.ofMetres(124800), earthRadius)
            const e = LatLong.ofDegrees(53.18826890646428, 0.133276666666666654)
            U.assertLLEquals(e, d)
        })

    })

})
