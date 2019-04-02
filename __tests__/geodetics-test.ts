import { Angle } from "../src/angle"
import { Geodetics } from "../src/geodetics"
import { LatLong } from "../src/latlong"
import { Length } from "../src/length"

import * as U from "./util"

describe("Geodetics", () => {

    const earthRadius = Length.ofMetres(6371000)
    describe("finalBearing", () => {
        test("returns Nothing if both point are the same", () => {
            const p = LatLong.ofDegrees(50, -18)
            expect(Geodetics.finalBearing(p, p)).toBeUndefined()
        })

        test("returns 0° if both point have the same longitude (going north)", () => {
            const p1 = LatLong.ofDegrees(50, -5)
            const p2 = LatLong.ofDegrees(58, -5)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ZERO)
        })

        test("returns 180° if both point have the same longitude (going south)", () => {
            const p1 = LatLong.ofDegrees(58, -5)
            const p2 = LatLong.ofDegrees(50, -5)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ofDegrees(180))
        })

        test("returns 90° at the equator going east", () => {
            const p1 = LatLong.ofDegrees(0, 0)
            const p2 = LatLong.ofDegrees(0, 1)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ofDegrees(90))
        })

        test("returns 270° at the equator going west", () => {
            const p1 = LatLong.ofDegrees(0, 1)
            const p2 = LatLong.ofDegrees(0, 0)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ofDegrees(270))
        })

        test("returns the final bearing in compass angle", () => {
            const p1 = LatLong.ofDegrees(50.06638889, -5.71472222)
            const p2 = LatLong.ofDegrees(58.64388889, -3.07)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ofDegrees(11.2752013))
            expect(Geodetics.finalBearing(p2, p1)).toEqual(Angle.ofDegrees(189.1198181))
        })

        test("returns the final bearing in compass angle", () => {
            const p1 = LatLong.ofDegrees(-53.99472222, -25.9875)
            const p2 = LatLong.ofDegrees(54, 154)
            expect(Geodetics.finalBearing(p1, p2)).toEqual(Angle.ofDegrees(125.6839436))
        })

    })

    describe("initialBearing", () => {
        test("returns Nothing if both point are the same", () => {
            const p = LatLong.ofDegrees(50, -18)
            expect(Geodetics.initialBearing(p, p)).toBeUndefined()
        })

        test("returns 0° if both point have the same longitude (going north)", () => {
            const p1 = LatLong.ofDegrees(50, -5)
            const p2 = LatLong.ofDegrees(58, -5)
            expect(Geodetics.initialBearing(p1, p2)).toEqual(Angle.ZERO)
        })

        test("returns 180° if both point have the same longitude (going south)", () => {
            const p1 = LatLong.ofDegrees(58, -5)
            const p2 = LatLong.ofDegrees(50, -5)
            expect(Geodetics.initialBearing(p1, p2)).toEqual(Angle.ofDegrees(180))
        })

        test("returns 90° at the equator going east", () => {
            const p1 = LatLong.ofDegrees(0, 0)
            const p2 = LatLong.ofDegrees(0, 1)
            expect(Geodetics.initialBearing(p1, p2)).toEqual(Angle.ofDegrees(90))
        })

        test("returns 270° at the equator going west", () => {
            const p1 = LatLong.ofDegrees(0, 1)
            const p2 = LatLong.ofDegrees(0, 0)
            expect(Geodetics.initialBearing(p1, p2)).toEqual(Angle.ofDegrees(270))
        })

        test("returns the initial bearing in compass angle", () => {
            const p1 = LatLong.ofDegrees(50.06638889, -5.71472222)
            const p2 = LatLong.ofDegrees(58.64388889, -3.07)
            expect(Geodetics.initialBearing(p1, p2)).toEqual(Angle.ofDegrees(9.11981810))
            expect(Geodetics.initialBearing(p2, p1)).toEqual(Angle.ofDegrees(191.2752013))
        })

    })

    describe("interpolate", () => {

        const p0 = LatLong.ofDegrees(44, 44)
        const p1 = LatLong.ofDegrees(46, 46)

        test("fails if f < 0.0", () => {
            expect(() => Geodetics.interpolate(p0, p1, -0.5))
                .toThrow("fraction must be in range [0..1], was -0.5")
        })

        test("fails if f > 1.0", () => {
            expect(() => Geodetics.interpolate(p0, p1, 1.1))
                .toThrow("fraction must be in range [0..1], was 1.1")
        })

        test("returns p0 if f == 0", () => {
            expect(Geodetics.interpolate(p0, p1, 0.0)).toBe(p0)
        })

        test("returns p1 if f == 1", () => {
            expect(Geodetics.interpolate(p0, p1, 1.0)).toBe(p1)
        })

        test("returns the interpolated position", () => {
            const p2 = LatLong.ofDegrees(53.47944444, -2.24527778)
            const p3 = LatLong.ofDegrees(55.60583333, 13.03583333)
            const i = Geodetics.interpolate(p2, p3, 0.5)
            U.assertLLEquals(LatLong.ofDegrees(54.7835574, 5.1949856), i)
        })

    })

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
