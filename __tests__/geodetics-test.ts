import { Angle } from "../src/angle"
import { CoordinateSystems } from "../src/coordinate-systems"
import { Geodetics } from "../src/geodetics"
import { LatLong } from "../src/latlong"
import { Length } from "../src/length"

import * as U from "./util"

describe("Geodetics", () => {

    const earthRadius = Length.ofMetres(6371000)

    describe("insideSurface", () => {

        const p1 = U.nv(45, 1)
        const p2 = U.nv(45, 2)
        const p3 = U.nv(46, 1)
        const p4 = U.nv(46, 2)
        const p5 = U.nv(45.1, 1.1)

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
                Geodetics.insideSurface(U.lund, [U.malmo, U.kristianstad, U.ystad])
            ).toBe(false)
        })

        test("returns false if point is a vertex of the polygon", () => {
            expect(Geodetics.insideSurface(p1, [p1, p2, p4, p3])).toBe(false)
        })

        test("handles closed polygons", () => {
            expect(Geodetics.insideSurface(p5, [p1, p2, p4, p3, p1])).toBe(true)
        })

        test("handles concave polygons", () => {
            const polygon = [U.malmo, U.ystad, U.kristianstad, U.helsingborg, U.lund]
            const hoor = U.nv(55.9295, 13.5297)
            const hassleholm = U.nv(56.1589, 13.7668)
            expect(Geodetics.insideSurface(hoor, polygon)).toBe(true)
            expect(Geodetics.insideSurface(hassleholm, polygon)).toBe(false)
        })

    })

    test("right returns true if position is right of line, false otherwise",
        () => {
            expect(Geodetics.right(U.ystad, U.helsingborg, U.kristianstad)).toBe(true)
            expect(Geodetics.right(U.ystad, U.kristianstad, U.helsingborg)).toBe(false)
            expect(Geodetics.right(U.malmo, U.lund, U.helsingborg)).toBe(false)
            expect(Geodetics.right(U.malmo, U.helsingborg, U.lund)).toBe(true)
        })

    test("discretiseCircle returns the list of n-vectors representing the circle",
        () => {
            const r = Length.ofMetres(2000)
            const centre = LatLong.ofDegrees(55.6050, 13.0038)
            const vc = CoordinateSystems.latLongToGeocentric(centre)
            const distances = Geodetics.discretiseCircle(centre, r, earthRadius, 10)
                .map(v => Geodetics.surfaceDistance(vc, v, earthRadius))
            /* assert distance up to 0.001 metres. */
            distances.forEach(d => expect(d.metres()).toBeCloseTo(r.metres(), 3))
        })

    describe("destination", () => {

        test("destination with distance = 0 returns p", () => {
            const p = CoordinateSystems.latLongToGeocentric(
                LatLong.ofDegrees(55.6050, 13.0038))
            expect(Geodetics.destination(p, Angle.ofDegrees(96.0217), Length.ofMetres(0), earthRadius)).toBe(p)
        })

        test("destination return the position along great-circle at distance and bearing", () => {
            const p = CoordinateSystems.latLongToGeocentric(LatLong.ofDegrees(53.32055556, -1.72972222))
            const d = Geodetics.destination(p, Angle.ofDegrees(96.0217), Length.ofMetres(124800), earthRadius)
            const e = LatLong.ofDegrees(53.18826890646428, 0.133276808381204)
            U.assertLLEquals(e, CoordinateSystems.geocentricToLatLong(d))
        })

    })

})
