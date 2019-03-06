import { CanvasAffineTransform, CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { DrawMode, GeoShape } from "./shapes"
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
    private readonly _buffers: Map<String, WebGLBuffer>

    constructor(program: WebGLProgram, vao: WebGLVertexArrayObject,
        buffers: Map<String, WebGLBuffer>) {
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

    buffers(): Map<String, WebGLBuffer> {
        return this._buffers
    }

}

export class Drawing {

    private readonly _context: DrawingContext
    private readonly _countTriangles: number
    private readonly _countLines: number

    constructor(context: DrawingContext, countTriangles: number, countLines: number) {
        this._context = context
        this._countTriangles = countTriangles
        this._countLines = countLines
    }

    context(): DrawingContext {
        return this._context
    }

    /** number of indices to be rendered with LINES. */
    countTriangles(): number {
        return this._countTriangles
    }

    /** number of indices to be rendered with LINES. */
    countLines(): number {
        return this._countLines
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
    private readonly aGeoPos: Attribute
    private readonly aOffset: Attribute
    private readonly program: WebGLProgram

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.aGeoPos = new Attribute("a_geo_pos", 3, this.gl.FLOAT, false)
        this.aOffset = new Attribute("a_offset", 2, this.gl.FLOAT, false)
        const vertexShader = WebGL2.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = WebGL2.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = WebGL2.createProgram(this.gl, vertexShader, fragmentShader)
    }

    newDrawing(): DrawingContext {
        return Renderer.newDrawing(this.gl, this.program, [this.aGeoPos, this.aOffset])
    }

    deleteDrawing(ctx: DrawingContext) {
        this.gl.useProgram(ctx.program());
        ctx.buffers().forEach(this.gl.deleteBuffer);
        this.gl.deleteVertexArray(ctx.vao())
    }

    setGeometry(ctx: DrawingContext, shapes: Array<GeoShape>): Drawing {
        /* first the triangles then the lines. */
        const atvs = new Array<Array<number>>()
        const atos = new Array<Array<number>>()
        const alvs = new Array<Array<number>>()
        const alos = new Array<Array<number>>()
        const len = shapes.length
        for (let i = 0; i < len; i++) {
            const s = shapes[i]
            if (s.drawMode() === DrawMode.TRIANGLES) {
                atvs.push(s.vertices())
                atos.push(s.offsets())
            } else if (s.drawMode() === DrawMode.LINES) {
                alvs.push(s.vertices())
                alos.push(s.offsets())
            }
        }
        const tvs = Renderer.flatten(atvs)
        const tos = Renderer.flatten(atos)
        const countTriangles = tvs.length / 3
        const lvs = Renderer.flatten(alvs)
        const los = Renderer.flatten(alos)
        const countLines = lvs.length / 3
        this.gl.useProgram(ctx.program())

        const gb = ctx.buffers().get(this.aGeoPos.name())
        const ob = ctx.buffers().get(this.aOffset.name())
        if (gb === undefined || ob === undefined) {
            throw new Error("Missing buffer for either geocentric position or offset")
        }
        Renderer.setBufferData(gb, tvs.concat(lvs), this.gl)
        Renderer.setBufferData(ob, tos.concat(los), this.gl)
        return new Drawing(ctx, countTriangles, countLines)
    }

    draw(drawings: IterableIterator<Drawing>, sp: StereographicProjection, at: CanvasAffineTransform) {
        this.gl.clearColor(0.85, 0.85, 0.85, 1)
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        const geoCentre = [sp.centre().x(), sp.centre().y(), sp.centre().z()]
        const geoToSys = sp.directRotationGl()
        const canvasToClipspace = CoordinateSystems.canvasToClipspace(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)

        for (const d of drawings) {
            this.gl.useProgram(d.context().program())

            const earthRadiusUniformLocation = this.gl.getUniformLocation(d.context().program(), "u_earth_radius")
            this.gl.uniform1f(earthRadiusUniformLocation, sp.earthRadius())

            const geoCentreUniformLocation = this.gl.getUniformLocation(d.context().program(), "u_geo_centre")
            this.gl.uniform3fv(geoCentreUniformLocation, geoCentre)

            const geoToSysUniformLocation = this.gl.getUniformLocation(d.context().program(), "u_geo_to_system")
            this.gl.uniformMatrix3fv(geoToSysUniformLocation, false, geoToSys)

            const stereoToCanvasLocation = this.gl.getUniformLocation(d.context().program(), "u_stereo_to_canvas")
            this.gl.uniformMatrix3fv(stereoToCanvasLocation, false, at.glMatrix());

            const canvasToClipspaceLocation = this.gl.getUniformLocation(d.context().program(), "u_canvas_to_clipspace");
            this.gl.uniformMatrix3fv(canvasToClipspaceLocation, false, canvasToClipspace)

            this.gl.bindVertexArray(d.context().vao());
            /* first triangles. */
            if (d.countTriangles() > 0) {
                this.gl.drawArrays(this.gl.TRIANGLES, 0, d.countTriangles());
            }
            /* then lines. */
            if (d.countLines() > 0) {
                this.gl.drawArrays(this.gl.LINES, d.countTriangles(), d.countLines());
            }
        }
    }

    private static newDrawing(gl: WebGL2RenderingContext, program: WebGLProgram,
        attributes: Array<Attribute>): DrawingContext {
        gl.useProgram(program);

        const vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error("Could not create vertex array")
        }
        gl.bindVertexArray(vao)

        let buffers = new Map<String, WebGLBuffer>()
        for (const a of attributes) {
            const attLocation = gl.getAttribLocation(program, a.name())
            gl.enableVertexAttribArray(attLocation)

            const attBuff = gl.createBuffer()
            if (attBuff === null) {
                throw new Error("Could not create buffer for attribute: " + a.name())
            }
            buffers.set(a.name(), attBuff)
            gl.bindBuffer(gl.ARRAY_BUFFER, attBuff)

            /* 0 = move forward size * sizeof(type) each iteration to get the next position */
            const stride = 0;
            /* start at the beginning of the buffer */
            const offset = 0;
            gl.vertexAttribPointer(attLocation, a.size(), a.type(), a.normalised(), stride, offset)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }
        gl.bindVertexArray(null);
        return new DrawingContext(program, vao, buffers)
    }

    private static setBufferData(buffer: WebGLBuffer, vs: Array<number>,
        gl: WebGL2RenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vs), gl.STATIC_DRAW, 0);
    }

    private static flatten(arr: Array<Array<number>>): Array<number> {
        let res = new Array<number>()
        for (const a of arr) {
            Array.prototype.push.apply(res, a)
        }
        return res
    }

    private static readonly VERTEX_SHADER =
        `#version 300 es
// geocentric to stereographic conversion
vec2 geocentric_to_stereographic(vec3 geo, float er, vec3 centre, mat3 rotation) {
    // n-vector to system
    vec3 translated = (geo - centre) * er;
    vec3 system = translated * rotation;
    // system to stereo
    float k = (2.0 * er) / (2.0 * er + system.z);
    return (system * k).xy;
}
// -------------------------- //
//  stereographic projection  //
// -------------------------- //

// earth radius (metres)
uniform float u_earth_radius;

// centre of the stereographic projection
uniform vec3 u_geo_centre;

// geocentric to system tranformation matrix (row major)
uniform mat3 u_geo_to_system;

// ----------------------- //
//   stereo to clipspace   //
// ----------------------- //

// 3x3 affine transform matrix (row major): stereo -> canvas pixels
uniform mat3 u_stereo_to_canvas;

// 3x3 projection matrix (row major): canvas pixels to clipspace
uniform mat3 u_canvas_to_clipspace;

// geocentric position
in vec3 a_geo_pos;

// offset in pixels
in vec2 a_offset;

void main() {
    // geocentric to stereographic
    vec2 stereo_pos = geocentric_to_stereographic(a_geo_pos, u_earth_radius, u_geo_centre, u_geo_to_system);

    // convert stereographic position to canvas pixels and add offset
    // u_stereo_to_canvas is row major so v * m
    vec3 c_pos = (vec3(stereo_pos, 1) * u_stereo_to_canvas) + (vec3(a_offset, 0));

    // canvas pixels to clipspace
    // u_projection is row major so v * m
    gl_Position = vec4((c_pos * u_canvas_to_clipspace).xy, 0, 1);
}
`

    private static readonly FRAGMENT_SHADER =
        `#version 300 es
precision mediump float;

out vec4 colour;

void main() {
  colour = vec4(1, 0, 0.5, 1); // return redish-purple
}
`

}
