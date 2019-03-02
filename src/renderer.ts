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
        let ts = new Array<number>()
        let ps = new Array<number>()
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
        if (ts.length > 0) {
            Renderer.glDraw(ts, this.gl.TRIANGLES, this.gl, this.program, at)
        }
        if (ps.length > 0) {
            Renderer.glDraw(ps, this.gl.LINES, this.gl, this.program, at)
        }
    }

    private static glDraw(vs: Array<number>, mode: number,
        gl: WebGL2RenderingContext, program: WebGLProgram, at: CanvasAffineTransform) {
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        const afUniformLocation = gl.getUniformLocation(program, "u_affine");
        gl.uniformMatrix4fv(afUniformLocation, false, at.glMatrix())

        const positionAttributeLocation = gl.getAttribLocation(program, "a_stereo_pos")

        const positionBuffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vs), gl.STATIC_DRAW)

        gl.enableVertexAttribArray(positionAttributeLocation)

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

        const size = 2 // take 2 elements from the buffer at the time (x, y)
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        const first = 0
        const count = vs.length / 2
        gl.drawArrays(mode, first, count);
    }

    private static fromWT(ts: WorldTriangles, arr: Array<number>) {
        ts.triangles
            .forEach(t => arr.push(
                t.v1().x(), t.v1().y(),
                t.v2().x(), t.v2().y(),
                t.v3().x(), t.v3().y()))
    }

    private static fromWL(l: WorldPolyline, arr: Array<number>) {
        /*
         * since we draw with LINES we need to repeat each intermediate point.
         * drawing with LINE_STRIP would not require this but would not allow
         * to draw multiple polyline at once.
         */
        const last = l.points.length - 1
        l.points.forEach((p, i) => {
            arr.push(p.x(), p.y())
            if (i !== 0 && i !== last) {
                arr.push(p.x(), p.y())
            }
        })
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
      // 3x3 affine transform matrix: stereo -> screen pixels
      uniform mat4 u_affine;

      // resolution (canvas width and height): screen pixels to clip space
      uniform vec2 u_resolution;

      // stereographic position
      attribute vec2 a_stereo_pos;

      void main() {
          // convert stereographic position to pixels
          vec4 c_pos = u_affine * vec4(a_stereo_pos, 0, 1);

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
