import { CanvasAffineTransform } from "./coordinate-systems"
import {
    RenderableShape,
    RenderableShapeType,
    WorldPolyline,
    WorldTriangles
} from "./shapes"

/**
 * Shape renderered on WebGL.
 */
export class Renderer {

    private readonly gl: WebGL2RenderingContext

    private readonly program: WebGLProgram

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        const vertexShader = Renderer.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = Renderer.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = Renderer.createProgram(this.gl, vertexShader, fragmentShader)

        this.gl.useProgram(this.program)
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.gl.clearColor(0.75, 0.75, 0.75, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }

    draw(shapes: Array<RenderableShape>, at: CanvasAffineTransform) {
        var ts: Array<number>
        ts = new Array
        var ps: Array<number>
        ps = new Array
        for (let i = 0; i < shapes.length; i++) {
            const s = shapes[i]
            switch (s.type) {
                case RenderableShapeType.WorldTriangles: {
                    Renderer.fromWT(s, ts)
                    break
                }
                case RenderableShapeType.WorldPolyline: {
                    Renderer.fromWL(s, ps)
                    break
                }
                case RenderableShapeType.WorldRelativeTriangles |
                    RenderableShapeType.WorldRelativePolyline: {
                        // empty
                        break
                    }
            }
        }
        /* first draw the triangles, then the lines. */
        Renderer.glDraw(ts, this.gl.TRIANGLES, this.gl, this.program, at)
        Renderer.glDraw(ps, this.gl.LINE_STRIP, this.gl, this.program, at)
    }

    private static glDraw(vs: Array<number>, mode: number,
        gl: WebGL2RenderingContext, program: WebGLProgram, at: CanvasAffineTransform) {
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        const afUniformLocation = gl.getUniformLocation(program, "af_matrix");
        gl.uniformMatrix4fv(afUniformLocation, false, at.glMatrix())

        const positionAttributeLocation = gl.getAttribLocation(program, "stereo_position")

        const positionBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vs), gl.STATIC_DRAW)

        gl.enableVertexAttribArray(positionAttributeLocation)

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        var size = 2 // take 2 elements from the buffer at the time (x, y)
        var type = gl.FLOAT
        var normalize = false
        var stride = 0
        var offset = 0
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        var offset = 0
        var count = vs.length / 2
        gl.drawArrays(mode, offset, count);
    }

    private static fromWT(ts: WorldTriangles, arr: Array<number>) {
        ts.triangles
            .forEach(t => arr.push(
                t.v1().x(), t.v1().y(),
                t.v2().x(), t.v2().y(),
                t.v3().x(), t.v3().y()))
    }

    private static fromWL(l: WorldPolyline, arr: Array<number>) {
        l.points.forEach(p => arr.push(p.x(), p.y()))
    }

    private static createShader(gl: WebGL2RenderingContext, type: number,
        source: string): WebGLShader {
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

    private static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader,
        fragmentShader: WebGLShader): WebGLProgram {
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

}
