import { Triangle } from '../src/triangle'
import { Triangulator } from '../src/triangulation'
import { Vector3d } from '../src/space3d'

import * as U from './util'

describe('Triangulator', () => {

    describe('spherical polygons', () => {

        test('triangle', () => {
            assertTrianglesEquals(
                [[U.ystad, U.malmo, U.helsingborg]],
                Triangulator.SPHERICAL.triangulate([U.ystad, U.malmo, U.helsingborg]))
        });

        test('convex polygon (4 vertices) in clockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.ystad, U.malmo, U.helsingborg],
                    [U.helsingborg, U.kristianstad, U.ystad]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.ystad, U.malmo, U.helsingborg, U.kristianstad
                ])
            )
        })

        test('convex polygon (4 vertices) in counterclockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.ystad, U.kristianstad, U.helsingborg],
                    [U.helsingborg, U.malmo, U.ystad]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.ystad, U.kristianstad, U.helsingborg, U.malmo
                ])
            )
        })

        test('concave polygon (5 vertices) in clockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.ystad, U.kristianstad, U.helsingborg],
                    [U.ystad, U.helsingborg, U.lund],
                    [U.lund, U.malmo, U.ystad]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.ystad, U.malmo, U.lund, U.helsingborg, U.kristianstad
                ])
            )
        })

        test('concave polygon (5 vertices) in counterclockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.malmo, U.ystad, U.lund],
                    [U.lund, U.kristianstad, U.helsingborg],
                    [U.lund, U.helsingborg, U.malmo]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.ystad, U.lund, U.kristianstad, U.helsingborg, U.malmo
                ])
            )
        })

        test('convex polygon (6 vertices) in clockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.bangui, U.kinshasa, U.harare],
                    [U.bangui, U.harare, U.dar_es_salaam],
                    [U.bangui, U.dar_es_salaam, U.narobi],
                    [U.narobi, U.juba, U.bangui]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.bangui, U.juba, U.narobi, U.dar_es_salaam, U.harare, U.kinshasa
                ])
            )
        })

        test('concave polygon (7 vertices) in clockwise order', () => {
            assertTrianglesEquals(
                [
                    [U.narobi, U.kinshasa, U.dar_es_salaam],
                    [U.narobi, U.dar_es_salaam, U.antananrivo],
                    [U.narobi, U.antananrivo, U.djibouti],
                    [U.narobi, U.djibouti, U.juba],
                    [U.narobi, U.juba, U.bangui]
                ],
                Triangulator.SPHERICAL.triangulate([
                    U.bangui, U.juba, U.djibouti,
                    U.antananrivo, U.dar_es_salaam, U.kinshasa, U.narobi
                ])
            )
        })

        function assertTrianglesEquals(expected: ReadonlyArray<ReadonlyArray<Vector3d>>,
            actual: ReadonlyArray<Triangle<Vector3d>>) {
            expect(actual.length).toEqual(expected.length)
            for (var i = 0; i < expected.length; i++) {
                expect(actual[i].v1()).toBe(expected[i][0])
                expect(actual[i].v2()).toBe(expected[i][1])
                expect(actual[i].v3()).toBe(expected[i][2])
            }
        }

    })
})
