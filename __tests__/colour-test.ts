import { Colour } from "../src/colour"

describe("Colour", () => {

    test("hsl", () => {
        const c = Colour.hsl(9, 1.0, 0.64)
        expect(c).toEqual(Colour.rgba(255, 99, 71, 1.0))
    })

    test("hsla", () => {
        const c = Colour.hsla(9, 1.0, 0.64, 0.3)
        expect(c).toEqual(Colour.rgba(255, 99, 71, 0.3))
    })

    test("hex", () => {
        const c = Colour.hex("#ff6347")
        expect(c).toEqual(Colour.rgba(255, 99, 71, 1.0))
    })

    test("hexa", () => {
        const c = Colour.hexa("#ff6347", 0.5)
        expect(c).toEqual(Colour.rgba(255, 99, 71, 0.5))
    })

    test("rgb", () => {
        const c = Colour.rgb(255, 99, 71)
        expect(c.red()).toEqual(1.0)
        expect(c.green()).toEqual(99 / 255)
        expect(c.blue()).toEqual(71 / 255)
        expect(c.alpha()).toEqual(1.0)
    })

    test("rgba", () => {
        const c = Colour.rgba(255, 99, 71, 0.5)
        expect(c.red()).toEqual(1.0)
        expect(c.green()).toEqual(99 / 255)
        expect(c.blue()).toEqual(71 / 255)
        expect(c.alpha()).toEqual(0.5)
    })

    test("fromLiteral", () => {
        const c = Colour.rgba(255, 99, 71, 0.5)
        const data = JSON.parse(JSON.stringify(c))
        expect(Colour.fromLiteral(data)).toEqual(c)
    })

})
