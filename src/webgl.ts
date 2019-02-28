import { Angle } from "./angle"
import { LatLong } from "./latlong"
import {
    CoordinateSystems,
    CanvasAffineTransform,
    CanvasDimension
} from "./coordinate-systems"
import * as S from "./shapes"
import { Triangle } from "./triangles"
import { Vector2d } from "./space2d"

export class WebGL {

    private constructor() { }

    static createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
        const shader = gl.createShader(type);
        if (shader === null) {
            throw new Error("Invalid shader type " + type)
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        gl.deleteShader(shader);
        throw new Error("Invalid shader (type =" + type + ")")
    }

    static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
        const program = gl.createProgram();
        if (program === null) {
            throw new Error("WebGL is not supported")
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }

        gl.deleteProgram(program);
        throw new Error("Invalid shader(s)")
    }

    static draw(gl: WebGL2RenderingContext) {
        const cd = new CanvasDimension(gl.canvas.width, gl.canvas.height)

        const ystad = LatLong.ofDegrees(55.4295, 13.82)
        const malmo = LatLong.ofDegrees(55.6050, 13.0038)
        const lund = LatLong.ofDegrees(55.7047, 13.1910)
        const helsingborg = LatLong.ofDegrees(56.0465, 12.6945)
        const kristianstad = LatLong.ofDegrees(56.0294, 14.1567)
        const goteborg = LatLong.ofDegrees(57.7089, 11.9746)
        const stockholm = LatLong.ofDegrees(59.3293, 18.0686)

        const p = new S.GeoPolygon([ystad, malmo, lund, helsingborg, kristianstad])
        const c1 = new S.GeoCircle(stockholm, 20000)
        const c2 = new S.GeoCircle(goteborg, 20000)

        const earthRadius = 6_371_000 // 6371 km

        // goteborg is the projection centre
        const sp = CoordinateSystems.computeStereographicProjection(goteborg, earthRadius)

        // world is centred at stockholm
        const range = 1_000_000 // 1000 km
        const af = CoordinateSystems.computeCanvasAffineTransform(stockholm, Angle.ofDegrees(0), range, cd, sp)

        const shapes = [
            S.ShapeConverter.toRenderableShape(p, sp),
            S.ShapeConverter.toRenderableShape(c1, sp),
            S.ShapeConverter.toRenderableShape(c2, sp)
        ]
        var ts: Array<Triangle<Vector2d>>
        ts = new Array
        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i]
            if (s.type == S.RenderableShapeType.WorldTriangles) {
                ts = ts.concat(ts, s.triangles)
            }
        }
        WebGL.drawTriangles(gl, ts, af)
    }

    private static readonly VERTEX_SHADER = `
        // 3x3 affine transform matrix: stereo -> screen pixels.
        uniform mat4 af_matrix;

        // resolution (canvas width and height): screen pixels to clip space
        uniform vec2 u_resolution;

        // stereographic position
        attribute vec2 stereo_position;

        void main() {
            // convert stereographic position to pixels
            vec4 c_pos = af_matrix * vec4(stereo_position, 0, 1);

            // convert the position from pixels to 0.0 to 1.0
            vec2 zero_to_one = vec2(c_pos.x, c_pos.y) / u_resolution;

            // convert from 0->1 to 0->2
            vec2 zero_to_two = zero_to_one * 2.0;

            // convert from 0->2 to -1->+1 (clipspace)
            vec2 clip_space = zero_to_two - 1.0;

            // positive Y as up and negative Y as down
            gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
        }
    `

    private static readonly FRAGMENT_SHADER = `
        // fragment shaders don't have a default precision so we need
        // to pick one. mediump is a good default
        precision mediump float;

        void main() {
          // gl_FragColor is a special variable a fragment shader
          // is responsible for setting
          gl_FragColor = vec4(1, 0, 0.5, 1); // return redish-purple
        }
    `

    private static drawTriangles(gl: WebGL2RenderingContext, ts: Array<Triangle<Vector2d>>, af: CanvasAffineTransform) {

        const vertexShader = WebGL.createShader(gl, gl.VERTEX_SHADER, WebGL.VERTEX_SHADER)
        const fragmentShader = WebGL.createShader(gl, gl.FRAGMENT_SHADER, WebGL.FRAGMENT_SHADER)

        const program = WebGL.createProgram(gl, vertexShader, fragmentShader)
        gl.useProgram(program)


        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        const afUniformLocation = gl.getUniformLocation(program, "af_matrix");
        gl.uniformMatrix4fv(afUniformLocation, false, af.glMatrix())

        const positionAttributeLocation = gl.getAttribLocation(program, "stereo_position")

        const positionBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        const positions =
            ts.map(t => [t.v1().x(), t.v1().y(), t.v2().x(), t.v2().y(), t.v3().x(), t.v3().y()])
                .reduce((a, b) => a.concat(b), [])

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        gl.clearColor(0.75, 0.75, 0.75, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.enableVertexAttribArray(positionAttributeLocation)

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        var size = 2 // take 2 elements from the buffer at the time (x, y)
        var type = gl.FLOAT
        var normalize = false
        var stride = 0
        var offset = 0
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        var primitiveType = gl.TRIANGLES
        var offset = 0
        var count = ts.length * 3
        gl.drawArrays(primitiveType, offset, count);
    }

}
