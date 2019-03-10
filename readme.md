# The World Is Not Flat

Rendering shapes defined by latitude and longitude with WebGL2.

Only tested on Chrome so far.

## Build

```bash
npm run test
```

## Demo

```bash
npm run demo
(cd build; http-server -e js)
```

Open Chrome at ```http://localhost:8080/demo/index.html```

Use arrow keys to pan and +/- to zoom in/out

## Concepts

TWINF allows to draw shapes defined by latitude and longitude on a canvas using
the WebGL2 context.

The following transformation are applied to shapes:

- In the CPU: [conversion](https://en.wikipedia.org/wiki/Geographic_coordinate_conversion) from latitude/longitude coordinate system to [geocentric coordinate system](https://en.wikipedia.org/wiki/ECEF) assuming a spherical earth model
- In the CPU: triangulation of spherical and planar polygons
- In the GPU: conversion from geocentric coordinate system to [stereographic coordinate system](https://en.m.wikipedia.org/wiki/Stereographic_projection)
- In the GPU: conversion from stereographic coordinate system to canvas coordinate system
- In the GPU: conversion from canvas to [WebGL](https://webgl2fundamentals.org) clipspace
