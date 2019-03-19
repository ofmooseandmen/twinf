import { Geometry2d, Math2d, Vector2d } from "../src/space2d"

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

    test('norm vector', () => {
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
            expect(Geometry2d.extrude([], 1).length).toBe(0)
            expect(Geometry2d.extrude([new Vector2d(50, 50)], 1).length).toBe(0)
        })

        test("extrude triangulates a 2D polyline into a stroke of given width",
            () => {
                const w = 10
                const ps = [new Vector2d(50, 50), new Vector2d(50, 100), new Vector2d(75, 150)]
                const ts = Geometry2d.extrude(ps, w)

                expect(ts.length).toBe(4)

                // FIXME use Util.assertV2Equals (numDigits is 10)

                const t0 = ts[0]
                expect(t0.v1().x()).toBe(55)
                expect(t0.v1().y()).toBe(50)
                expect(t0.v2().x()).toBe(45)
                expect(t0.v2().y()).toBe(50)
                expect(t0.v3().x()).toBeCloseTo(54.47)
                expect(t0.v3().y()).toBeCloseTo(97.76)

                const t1 = ts[1]
                expect(t1.v1().x()).toBe(45)
                expect(t1.v1().y()).toBe(50)
                expect(t1.v2().x()).toBeCloseTo(54.47)
                expect(t1.v2().y()).toBeCloseTo(97.76)
                expect(t1.v3().x()).toBeCloseTo(45.53)
                expect(t1.v3().y()).toBeCloseTo(102.24)

                const t2 = ts[2]
                expect(t2.v1().x()).toBeCloseTo(54.47)
                expect(t2.v1().y()).toBeCloseTo(97.76)
                expect(t2.v2().x()).toBeCloseTo(45.53)
                expect(t2.v2().y()).toBeCloseTo(102.24)
                expect(t2.v3().x()).toBeCloseTo(79.47)
                expect(t2.v3().y()).toBeCloseTo(147.76)

                const t3 = ts[3]
                expect(t3.v1().x()).toBeCloseTo(45.53)
                expect(t3.v1().y()).toBeCloseTo(102.24)
                expect(t3.v2().x()).toBeCloseTo(79.47)
                expect(t3.v2().y()).toBeCloseTo(147.76)
                expect(t3.v3().x()).toBeCloseTo(70.53)
                expect(t3.v3().y()).toBeCloseTo(152.24)

            })

    })

})
