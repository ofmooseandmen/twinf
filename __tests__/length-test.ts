import { Length } from "../src/length"

describe("Length", () => {

    describe("Converting lengths", () => {
        test("convert metres to kilometres", () => {
            expect(Length.ofMetres(1000).kilometres()).toEqual(1.0)
        })
        test("convert metres to nautical miles", () => {
            expect(Length.ofMetres(1000).nauticalMiles()).toEqual(0.5399568034557235)
        })
        test("convert kilometres to nautical miles", () => {
            expect(Length.ofKilometres(1000).nauticalMiles()).toEqual(539.95680345572355)
        })
        test("convert nautical miles to metres", () => {
            expect(Length.ofNauticalMiles(10.5).metres()).toEqual(19446)
        })
        test("convert nautical miles to kilometres", () => {
            expect(Length.ofNauticalMiles(10.5).kilometres()).toEqual(19.446)
        })
        test("convert feet to metres", () => {
            expect(Length.ofFeet(25000).metres()).toEqual(7620)
        })
        test("convert metres to feet", () => {
            expect(Length.ofMetres(7620).feet()).toEqual(25000)
        })
    })

    describe("Resolution", () => {
        test("length resolution handles 1 kilometre", () => {
            expect(Length.ofKilometres(1).kilometres()).toEqual(1)
        })
        test("length resolution handles 1 metre", () => {
            expect(Length.ofMetres(1).metres()).toEqual(1)
        })
        test("length resolution handles 1 nautical mile", () => {
            expect(Length.ofNauticalMiles(1).nauticalMiles()).toEqual(1)
        })
        test("length resolution handles 1 foot", () => {
            expect(Length.ofFeet(1).feet()).toEqual(1)
        })
    })

    test("fromLiteral", () => {
        const l = Length.ofFeet(25000)
        const data = JSON.parse(JSON.stringify(l))
        expect(Length.fromLiteral(data)).toEqual(l)
    })

})
