import { CanvasAffineTransform, CoordinateSystems } from "./coordinate-systems"
import {
    StereoPolyline,
    StereoPolygon
} from "./shapes"
import { WebGL2 } from "./webgl2"

/**
 * Characteristics of a WebGL attibute.
 */
export class Attribute {

    private readonly _name: string
    private readonly _size: GLint
    private readonly _type: GLenum
    private readonly _normalised: GLboolean


    constructor(name: string, size: GLint, type: GLenum, normalised: GLboolean) {
        this._name = name
        this._size = size
        this._type = type
        this._normalised = normalised
    }

    /**
     * Name of the attribute.
     */
    name(): string {
        return this._name
    }

    /**
     * Number of components per vertex attribute.
     */
    size(): GLint {
        return this._size
    }

    /**
     * Data type of each component in the array.
     */
    type(): GLenum {
        return this._type
    }

    /**
     * Whether integer data values should be normalized into a certain range when being casted to a float.
     * Note: for types gl.FLOAT and gl.HALF_FLOAT, this has no effect.
     */
    normalised(): GLboolean {
        return this._normalised
    }

}

/**
 * Holds reference to the program, vertex array object and
 * every buffer (one per attribute) used to draw something.
 */
export class DrawingContext {

    private readonly _program: WebGLProgram
    private readonly _vao: WebGLVertexArrayObject
    private readonly _buffers: Array<WebGLBuffer>

    constructor(program: WebGLProgram, vao: WebGLVertexArrayObject,
        buffers: Array<WebGLBuffer>) {
        this._program = program
        this._vao = vao
        this._buffers = buffers
    }

    program(): WebGLProgram {
        return this._program
    }

    vao(): WebGLVertexArrayObject {
        return this._vao
    }

    buffers(): Array<WebGLBuffer> {
        return this._buffers
    }

}

export class Drawing {

    private readonly _context: DrawingContext
    private readonly _mode: number
    private readonly _count: number

    constructor(context: DrawingContext, mode: number, count: number) {
        this._context = context
        this._mode = mode
        this._count = count
    }

    context(): DrawingContext {
        return this._context
    }
    mode(): number {
        return this._mode
    }

    /** number of indices to be rendered. */
    count(): number {
        return this._count
    }

}

export class Animator {

    private readonly callback: Function
    private readonly fps: number

    private now: number
    private then: number
    private readonly interval: number
    private delta: number
    private handle: number

    constructor(callback: Function, fps: number) {
        this.callback = callback
        this.fps = fps

        this.now = Date.now()
        this.then = Date.now()
        this.interval = 1000 / this.fps
        this.delta = -1
        this.handle = -1
    }

    start() {
        this.render()
    }

    stop() {
        cancelAnimationFrame(this.handle)
    }

    private render() {
        this.handle = requestAnimationFrame(() => this.render());

        this.now = Date.now();
        this.delta = this.now - this.then;

        if (this.delta > this.interval) {
            // update time stuffs

            // Just `then = now` is not enough.
            // Lets say we set fps at 10 which means
            // each frame must take 100ms
            // Now frame executes in 16ms (60fps) so
            // the loop iterates 7 times (16*7 = 112ms) until
            // delta > interval === true
            // Eventually this lowers down the FPS as
            // 112*10 = 1120ms (NOT 1000ms).
            // So we have to get rid of that extra 12ms
            // by subtracting delta (112) % interval (100).
            // Hope that makes sense.

            this.then = this.now - (this.delta % this.interval);

            this.callback()
        }
    }

}

/**
 * Shape rendering on WebGL.
 */
export class Renderer {

    private readonly gl: WebGL2RenderingContext

    private readonly program: WebGLProgram

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        const vertexShader = WebGL2.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = WebGL2.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = WebGL2.createProgram(this.gl, vertexShader, fragmentShader)
    }

    newDrawing(): DrawingContext {
        const stereoPosAtt = new Attribute("a_stereo_pos", 2, this.gl.FLOAT, false)
        return Renderer.newDrawing(this.gl, this.program, [stereoPosAtt])
    }

    deleteDrawing(ctx: DrawingContext) {
        this.gl.useProgram(ctx.program());
        ctx.buffers().forEach(this.gl.deleteBuffer);
        this.gl.deleteVertexArray(ctx.vao())
    }

    setPolylines(ctx: DrawingContext, shapes: Array<StereoPolyline>): Drawing {
        let vs = new Array<number>()
        shapes.forEach(s => Renderer.fromStereoPolyline(s, vs))
        Renderer.setBufferData(ctx, vs, this.gl, this.program)
        const mode = this.gl.LINES
        const count = vs.length / 2
        return new Drawing(ctx, mode, count)
    }

    setPolygons(ctx: DrawingContext, shapes: Array<StereoPolygon>) {
        let vs = new Array<number>()
        shapes.forEach(s => Renderer.fromStereoPolygon(s, vs))
        Renderer.setBufferData(ctx, vs, this.gl, this.program)
        const mode = this.gl.TRIANGLES
        const count = vs.length / 2
        return new Drawing(ctx, mode, count)
    }

    draw(drawings: Array<Drawing>, at: CanvasAffineTransform) {
        this.gl.clearColor(0.85, 0.85, 0.85, 1)
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
        drawings.forEach(d => {
            const projectionUniformLocation = this.gl.getUniformLocation(d.context().program(), "u_projection");
            const proj = CoordinateSystems.canvasToClipspace(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)
            this.gl.uniformMatrix3fv(projectionUniformLocation, false, proj);

            const affineUniformLocation = this.gl.getUniformLocation(d.context().program(), "u_affine");
            this.gl.uniformMatrix3fv(affineUniformLocation, false, at.glMatrix())

            this.gl.bindVertexArray(d.context().vao());
            this.gl.drawArrays(d.mode(), 0, d.count());
        })
    }

    private static newDrawing(gl: WebGL2RenderingContext, program: WebGLProgram,
        attributes: Array<Attribute>): DrawingContext {
        gl.useProgram(program);

        const vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error("Could not create vertex array")
        }
        gl.bindVertexArray(vao)

        let buffers = new Array<WebGLBuffer>()

        attributes.forEach(a => {
            const attLocation = gl.getAttribLocation(program, a.name())
            gl.enableVertexAttribArray(attLocation)

            const attBuff = gl.createBuffer()
            if (attBuff === null) {
                throw new Error("Could not create buffer for attribute: " + a.name())
            }
            buffers.push(attBuff)
            gl.bindBuffer(gl.ARRAY_BUFFER, attBuff)

            /* 0 = move forward size * sizeof(type) each iteration to get the next position */
            const stride = 0;
            /* start at the beginning of the buffer */
            const offset = 0;
            gl.vertexAttribPointer(attLocation, a.size(), a.type(), a.normalised(), stride, offset)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
        })
        gl.bindVertexArray(null);
        return new DrawingContext(program, vao, buffers)
    }

    private static setBufferData(ctx: DrawingContext, vs: Array<number>,
        gl: WebGL2RenderingContext, program: WebGLProgram) {
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, ctx.buffers()[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vs), gl.STATIC_DRAW, 0);
    }

    private static fromStereoPolygon(ts: StereoPolygon, arr: Array<number>) {
        ts.triangles
            .forEach(t => arr.push(
                t.v1().position().x(), t.v1().position().y(),
                t.v2().position().x(), t.v2().position().y(),
                t.v3().position().x(), t.v3().position().y()))
    }

    private static fromStereoPolyline(l: StereoPolyline, arr: Array<number>) {
        /*
         * since we draw with LINES we need to repeat each intermediate point.
         * drawing with LINE_STRIP would not require this but would not allow
         * to draw multiple polyline at once.
         */
        const last = l.points.length - 1
        l.points.forEach((p, i) => {
            arr.push(p.position().x(), p.position().y())
            if (i !== 0 && i !== last) {
                arr.push(p.position().x(), p.position().y())
            }
        })
    }

    private static readonly VERTEX_SHADER = `
      // 3x3 affine transform matrix (row major): stereo -> canvas pixels
      uniform mat3 u_affine;

      // 3x3 projection matrix (row major): canvas pixels to clipspace
      uniform mat3 u_projection;

      // stereographic position
      attribute vec2 a_stereo_pos;

      void main() {
          // convert stereographic position to canvas pixels
          // u_affine is row major so v * m
          vec3 c_pos = (vec3(a_stereo_pos, 1) * u_affine);

          // canvas pixels to clipspace
          // u_projection is row major so v * m
          gl_Position = vec4((c_pos * u_projection).xy, 0, 1);
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
