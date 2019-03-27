import { Geometry2d, Math2d, Vector2d } from "../src/space2d"
import { Triangle } from "../src/triangle"

import { assertV2Equals } from "./util"

describe("Math2d", () => {

    test('Add 2 vectors', () => {
        const v1 = new Vector2d(1, 2)
        const v2 = new Vector2d(4, 5)
        expect(Math2d.add(v1, v2)).toEqual(new Vector2d(5, 7))
    })

    test('Subtract 2 vectors', () => {
        const v1 = new Vector2d(1, 2)
        const v2 = new Vector2d(3, 2)
        expect(Math2d.sub(v1, v2)).toEqual(new Vector2d(-2, 0))
    })

    test('Dot product of 2 vectors', () => {
        const v1 = new Vector2d(1, 5)
        const v2 = new Vector2d(2, 6)
        expect(Math2d.dot(v1, v2)).toEqual(32)
    })

    test('Norm of vector', () => {
        expect(Math2d.norm(new Vector2d(2, 6))).toBeCloseTo(6.32)
    })

    test('Scale vector by number', () => {
        expect(Math2d.scale(new Vector2d(1, 5), 2)).toEqual(new Vector2d(2, 10))
    })

    test('Unit vector', () => {
        expect(Math2d.norm(Math2d.unit(new Vector2d(1, 5)))).toEqual(1)
    })

})

describe("Geometry2d", () => {

    const p0 = new Vector2d(1, 2)
    const p1 = new Vector2d(-1, -1)
    const p2 = new Vector2d(2, 2)

    const concaveClosed = [new Vector2d(2, 2), new Vector2d(4, 8), new Vector2d(6, 6),
    new Vector2d(8, 14), new Vector2d(12, 4), new Vector2d(2, 2)]

    const concaveOpened =
        [new Vector2d(2, 2), new Vector2d(4, 8), new Vector2d(6, 6),
        new Vector2d(8, 14), new Vector2d(12, 4)]

    const convexClosed =
        [new Vector2d(-2, -2), new Vector2d(-4, -8), new Vector2d(-8, -14),
        new Vector2d(-12, -4), new Vector2d(-2, -2)]

    const convexOpened =
        [new Vector2d(-2, -2), new Vector2d(-4, -8), new Vector2d(-8, -14),
        new Vector2d(-12, -4)]

    test("right returns true if position is right of line, false otherwise",
        () => {
            expect(Geometry2d.right(p0, p1, p2)).toBe(false)
            expect(Geometry2d.right(p0, p2, p1)).toBe(true)
        })

    describe("insideSurface", () => {

        test("handles concave closed polygon", () => {
            expect(Geometry2d.insideSurface(new Vector2d(4, 4), concaveClosed)).toBe(true)
            expect(Geometry2d.insideSurface(new Vector2d(6, 10), concaveClosed)).toBe(false)
        })
        test("handles concave opened polygon", () => {
            expect(Geometry2d.insideSurface(new Vector2d(4, 4), concaveOpened)).toBe(true)
            expect(Geometry2d.insideSurface(new Vector2d(6, 10), concaveOpened)).toBe(false)
        })

        test("handles convex closed polygon", () => {
            expect(Geometry2d.insideSurface(new Vector2d(-4, -4), convexClosed)).toBe(true)
            expect(Geometry2d.insideSurface(new Vector2d(-8, -2), convexClosed)).toBe(false)
        })

        test("handles convex opened polygon", () => {
            expect(Geometry2d.insideSurface(new Vector2d(-4, -4), convexOpened)).toBe(true)
            expect(Geometry2d.insideSurface(new Vector2d(-8, -2), convexOpened)).toBe(false)
        })

        test("returns false if polygon is empty", () => {
            expect(Geometry2d.insideSurface(p0, [])).toBe(false)
        })

        test("returns false if polygon does not define at least a triangle",
            () => {
                expect(Geometry2d.insideSurface(p1, [p1, p2])).toBe(false)
            })

    })

    test("discretiseCircle returns the list of 2D points representing the circle",
        () => {
            const r = 100
            const ps = Geometry2d.discretiseCircle(p0, r, 10)
            const distances = ps.map(
                p => Math.sqrt((p0.x() - p.x()) * (p0.x() - p.x()) + (p0.y() - p.y()) * (p0.y() - p.y())))
            distances.forEach(d => expect(d).toBeCloseTo(r, 10))
        })

    describe("extrude", () => {

        test("returns an empty array if not given a polyline", () => {
            expect(Geometry2d.extrude([], 1, 10, false).length).toBe(0)
            expect(Geometry2d.extrude([new Vector2d(50, 50)], 1, 10, false).length).toBe(0)
        })

        test("triangulate a 2D line into into a stroke of given width", () => {
            const w = 10
            const ps = [new Vector2d(50, 50), new Vector2d(50, 100)]
            const ts = Geometry2d.extrude(ps, w, 10, false)
            assertTrianglesEquals(
                [
                    new Triangle(new Vector2d(45, 50), new Vector2d(55, 50), new Vector2d(45, 100)),
                    new Triangle(new Vector2d(55, 50), new Vector2d(45, 100), new Vector2d(55, 100))
                ], ts)
        })

        test("triangulates an opened 2D polyline into a stroke of given width", () => {
            const w = 10
            const ps = [new Vector2d(50, 50), new Vector2d(50, 100), new Vector2d(75, 150)]
            const ts = Geometry2d.extrude(ps, w, 10, false)
            assertTrianglesEquals(
                [
                    new Triangle(
                        new Vector2d(45, 50),
                        new Vector2d(55, 50),
                        new Vector2d(45, 101.18033988749895)),
                    new Triangle(
                        new Vector2d(55, 50),
                        new Vector2d(45, 101.18033988749895),
                        new Vector2d(55, 98.81966011250105)),
                    new Triangle(
                        new Vector2d(45, 101.18033988749895),
                        new Vector2d(55, 98.81966011250105),
                        new Vector2d(70.52786404500043, 152.2360679774998)),
                    new Triangle(
                        new Vector2d(55, 98.81966011250105),
                        new Vector2d(70.52786404500043, 152.2360679774998),
                        new Vector2d(79.47213595499957, 147.7639320225002))
                ], ts)
        })

        test("triangulates a closed 2D polyline into a stroke of given width", () => {
            const w = 10
            const ps = [new Vector2d(50, 50), new Vector2d(50, 100), new Vector2d(75, 150)]
            const ts = Geometry2d.extrude(ps, w, 10, true)
            assertTrianglesEquals(
                [
                    new Triangle(
                        new Vector2d(44.99999999999996, 9.384471871911522),
                        new Vector2d(55.00000000000004, 90.61552812808847),
                        new Vector2d(45, 101.18033988749895)),
                    new Triangle(
                        new Vector2d(55.00000000000004, 90.61552812808847),
                        new Vector2d(45, 101.18033988749895),
                        new Vector2d(55, 98.81966011250105)),
                    new Triangle(
                        new Vector2d(45, 101.18033988749895),
                        new Vector2d(55, 98.81966011250105),
                        new Vector2d(90.89793400779344, 192.97620790308582)),
                    new Triangle(
                        new Vector2d(55, 98.81966011250105),
                        new Vector2d(90.89793400779344, 192.97620790308582),
                        new Vector2d(59.10206599220656, 107.02379209691418)),
                    new Triangle(
                        new Vector2d(90.89793400779344, 192.97620790308582),
                        new Vector2d(59.10206599220656, 107.02379209691418),
                        new Vector2d(44.99999999999996, 9.384471871911522)),
                    new Triangle(
                        new Vector2d(59.10206599220656, 107.02379209691418),
                        new Vector2d(44.99999999999996, 9.384471871911522),
                        new Vector2d(55.00000000000004, 90.61552812808847))
                ], ts)
        })

        test("Does not use the miter if its length is greater than the limit", () => {
            const w = 10
            const ps = [new Vector2d(50, 50), new Vector2d(100, 50), new Vector2d(50, 51)]
            const ts = Geometry2d.extrude(ps, w, 10, false)
            assertTrianglesEquals(
                [
                    new Triangle(
                        new Vector2d(50, 55),
                        new Vector2d(50, 45),
                        new Vector2d(100, 55)),
                    new Triangle(
                        new Vector2d(50, 45),
                        new Vector2d(100, 55),
                        new Vector2d(100, 45)),
                    new Triangle(
                        new Vector2d(100, 55),
                        new Vector2d(100, 45),
                        new Vector2d(49.900019994002, 46.00099970009997)),
                    new Triangle(
                        new Vector2d(100, 45),
                        new Vector2d(49.900019994002, 46.00099970009997),
                        new Vector2d(50.099980005998, 55.99900029990003))
                ], ts)
        })

        function assertTrianglesEquals(expected: Array<Triangle<Vector2d>>,
            actual: Array<Triangle<Vector2d>>) {
            expect(actual.length).toEqual(expected.length)
            for (var i = 0; i < expected.length; i++) {
                assertV2Equals(expected[i].v1(), actual[i].v1())
                assertV2Equals(expected[i].v2(), actual[i].v2())
                assertV2Equals(expected[i].v3(), actual[i].v3())
            }
        }

    })

})
