import { Geometry2d, Vector2d } from "../src/space2d"

describe("Math2d", () => {

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

})
