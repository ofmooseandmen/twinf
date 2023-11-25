import { Colour } from '../src/colour'
import { LatLong } from '../src/latlong'
import { Length } from '../src/length'
import { Offset } from '../src/pixels'
import * as S from '../src/shapes'

describe('shapes', () => {

    describe('stoke', () => {
        test('fromLiteral', () => {
            const s = new S.Stroke(Colour.ALICEBLUE, 15)
            const data = JSON.parse(JSON.stringify(s))
            expect(S.Stroke.fromLiteral(data)).toEqual(s)
        })
    })

    describe('paint', () => {
        test('fromLiteral, stroke', () => {
            const p = S.Paint.stroke(new S.Stroke(Colour.ALICEBLUE, 15))
            const data = JSON.parse(JSON.stringify(p))
            expect(S.Paint.fromLiteral(data)).toEqual(p)
        })

        test('fromLiteral, fill', () => {
            const p = S.Paint.fill(Colour.HOTPINK)
            const data = JSON.parse(JSON.stringify(p))
            expect(S.Paint.fromLiteral(data)).toEqual(p)
        })

        test('fromLiteral, complete', () => {
            const p = S.Paint.complete(
                new S.Stroke(Colour.ALICEBLUE, 15),
                Colour.HOTPINK)
            const data = JSON.parse(JSON.stringify(p))
            expect(S.Paint.fromLiteral(data)).toEqual(p)
        })
    })

    test('fromLiteral, GeoCircle', () => {
        const s = new S.GeoCircle(
            LatLong.ofDegrees(24, -76),
            Length.ofKilometres(154),
            S.Paint.fill(Colour.ANTIQUEWHITE))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoPolygon', () => {
        const s = new S.GeoPolygon(
            [LatLong.ofDegrees(24, -76), LatLong.ofDegrees(23, -75), LatLong.ofDegrees(22, -77)],
            S.Paint.fill(Colour.ANTIQUEWHITE))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoPolyline', () => {
        const s = new S.GeoPolyline(
            [LatLong.ofDegrees(24, -76), LatLong.ofDegrees(23, -75), LatLong.ofDegrees(22, -77)],
            new S.Stroke(Colour.BLUEVIOLET, 15))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoRelativeCircle', () => {
        const s = new S.GeoRelativeCircle(
            LatLong.ofDegrees(24, -76),
            new Offset(10, 30),
            154,
            S.Paint.fill(Colour.ANTIQUEWHITE))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoRelativeText', () => {
        const s = new S.GeoRelativeText(
            LatLong.ofDegrees(24, -76),
            new Offset(10, 30),
            Colour.ANTIQUEWHITE,
            "HM3")
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoRelativePolygon', () => {
        const s = new S.GeoRelativePolygon(
            LatLong.ofDegrees(24, -76),
            [new Offset(24, -76), new Offset(23, -75), new Offset(22, -77)],
            S.Paint.fill(Colour.ANTIQUEWHITE))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

    test('fromLiteral, GeoRelativePolyline', () => {
        const s = new S.GeoRelativePolyline(
            LatLong.ofDegrees(24, -76),
            [new Offset(24, -76), new Offset(23, -75), new Offset(22, -77)],
            new S.Stroke(Colour.BLUEVIOLET, 15))
        const data = JSON.parse(JSON.stringify(s))
        expect(S.fromLiteral(data)).toEqual(s)
    })

})
