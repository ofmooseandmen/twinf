import { CoordinateSystems } from "../src/coordinate-systems"
import { LatLong } from "../src/latlong"
import { Vector2d } from "../src/space2d"
import { Vector3d } from "../src/space3d"

export const ystad = nv(55.4295, 13.82)
export const malmo = nv(55.6050, 13.0038)
export const lund = nv(55.7047, 13.1910)
export const helsingborg = nv(56.0465, 12.6945)
export const kristianstad = nv(56.0294, 14.1567)
export const bangui = nv(4.3947, 18.5582)
export const juba = nv(4.8594, 31.5713)
export const narobi = nv(-1.2921, 36.8219)
export const dar_es_salaam = nv(-6.7924, 39.2083)
export const harare = nv(-17.8252, 31.0335)
export const kinshasa = nv(-4.4419, 15.2663)
export const djibouti = nv(11.8251, 42.5903)
export const antananrivo = nv(-18.8792, 47.5079)

export function nv(lat: number, lon: number): Vector3d {
    return CoordinateSystems.latLongToGeocentric(LatLong.ofDegrees(lat, lon))
}

export function assertLLEquals(expected: LatLong, actual: LatLong) {
    expect(actual.latitude().degrees()).toBeCloseTo(expected.latitude().degrees(), 8)
    expect(actual.longitude().degrees()).toBeCloseTo(expected.longitude().degrees(), 8)
}

export function assertV2Equals(expected: Vector2d, actual: Vector2d) {
    expect(actual.x()).toBeCloseTo(expected.x(), 8)
    expect(actual.y()).toBeCloseTo(expected.y(), 8)
}

export function assertV3Equals(expected: Vector3d, actual: Vector3d) {
    expect(actual.x()).toBeCloseTo(expected.x(), 8)
    expect(actual.y()).toBeCloseTo(expected.y(), 8)
    expect(actual.z()).toBeCloseTo(expected.z(), 8)
}

test("", () => {
    // test utilities
})
