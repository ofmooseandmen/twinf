# The World Is Not Flat
[![NPM package][npm]][npm-url]
[![license][license]][license-url]


Rendering shapes defined by latitude and longitude with WebGL2.

Only tested on Chrome so far.

## Build

```bash
npm run test
```

## Demo

[click me!][demo-url]

Allow some time for the coastline and tracks to be fetched, then use arrow
keys to pan and +/- to zoom in/out. Tracks are fetched every 10 seconds from [opensky][opensky-url].

## Concepts

TWINF allows to draw shapes defined by latitude and longitude on a canvas using
the WebGL2 context.

The following transformations are applied to shapes:

- In the CPU: [conversion](https://en.wikipedia.org/wiki/Geographic_coordinate_conversion) from latitude/longitude coordinate system to [geocentric coordinate system](https://en.wikipedia.org/wiki/ECEF) assuming a spherical earth model
- In the CPU: triangulation of spherical and planar polygons
- In the GPU: conversion from geocentric coordinate system to [stereographic coordinate system](https://en.m.wikipedia.org/wiki/Stereographic_projection)
- In the GPU: conversion from stereographic coordinate system to canvas coordinate system
- In the GPU: conversion from canvas to [WebGL](https://webgl2fundamentals.org) clipspace

[npm]: https://img.shields.io/npm/v/twinf.svg
[npm-url]: https://www.npmjs.com/package/twinf
[license]: https://img.shields.io/badge/license-MIT-lightgray.svg
[license-url]: https://opensource.org/licenses/MIT
[demo-url]: https://ofmooseandmen.github.io/twinf
[opensky-url]: https://opensky-network.org
