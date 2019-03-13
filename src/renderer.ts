import { CanvasAffineTransform, CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { Colour } from "./colour"
import { DrawMode, Mesh } from "./mesh"
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
 * Holds reference to vertex array object and
 * every buffer (one per attribute) used to draw something.
 */
export class DrawingContext {

    private readonly _vao: WebGLVertexArrayObject
    private readonly _buffers: Map<String, WebGLBuffer>

    constructor(vao: WebGLVertexArrayObject, buffers: Map<String, WebGLBuffer>) {
        this._vao = vao
        this._buffers = buffers
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
 * A scene contains all the drawings and required attributed to render them.
 */
export class Scene {

    private readonly _drawings: IterableIterator<Drawing>
    private readonly _bgColour: Colour
    private readonly _sp: StereographicProjection
    private readonly _at: CanvasAffineTransform

    constructor(drawings: IterableIterator<Drawing>, bgColour: Colour,
        sp: StereographicProjection, at: CanvasAffineTransform) {
        this._drawings = drawings
        this._bgColour = bgColour
        this._sp = sp
        this._at = at
    }

    drawings(): IterableIterator<Drawing> {
        return this._drawings
    }

    bgColour(): Colour {
        return this._bgColour
    }

    sp(): StereographicProjection {
        return this._sp
    }

    at(): CanvasAffineTransform {
        return this._at
    }

}

/**
 * Shape rendering on WebGL.
 */
export class Renderer {

    private readonly gl: WebGL2RenderingContext
    private readonly aGeoPos: Attribute
    private readonly aOffset: Attribute
    private readonly aRgba: Attribute
    private readonly program: WebGLProgram

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl
        this.aGeoPos = new Attribute("a_geo_pos", 3, this.gl.FLOAT, false)
        this.aOffset = new Attribute("a_offset", 2, this.gl.FLOAT, false)
        this.aRgba = new Attribute("a_rgba", 1, this.gl.UNSIGNED_INT, false)
        const vertexShader = WebGL2.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = WebGL2.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = WebGL2.createProgram(this.gl, vertexShader, fragmentShader)
    }

    newDrawing(): DrawingContext {
        const gl = this.gl
        const program = this.program
        const attributes = [this.aGeoPos, this.aOffset, this.aRgba]
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
            if (a.type() == gl.UNSIGNED_INT) {
                gl.vertexAttribIPointer(attLocation, a.size(), a.type(), stride, offset)
            } else {
                gl.vertexAttribPointer(attLocation, a.size(), a.type(), a.normalised(), stride, offset)
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }
        gl.bindVertexArray(null);
        return new DrawingContext(vao, buffers)
    }

    deleteDrawing(ctx: DrawingContext) {
        this.gl.useProgram(this.program);
        ctx.buffers().forEach(this.gl.deleteBuffer);
        this.gl.deleteVertexArray(ctx.vao())
    }

    setGeometry(ctx: DrawingContext, meshes: Array<Mesh>): Drawing {
        /* first the triangles then the lines. */
        const atgs = new Array<Array<number>>()
        const atos = new Array<Array<number>>()
        const atcs = new Array<Array<number>>()
        const algs = new Array<Array<number>>()
        const alos = new Array<Array<number>>()
        const alcs = new Array<Array<number>>()
        const len = meshes.length
        for (let i = 0; i < len; i++) {
            const m = meshes[i]
            if (m.drawMode() === DrawMode.TRIANGLES) {
                atgs.push(m.geos())
                atos.push(m.offsets())
                atcs.push(m.colours())
            } else if (m.drawMode() === DrawMode.LINES) {
                algs.push(m.geos())
                alos.push(m.offsets())
                alcs.push(m.colours())
            }
        }
        const tgs = Renderer.flatten(atgs)
        const tos = Renderer.flatten(atos)
        const tcs = Renderer.flatten(atcs)
        const countTriangles = tgs.length / 3
        const lgs = Renderer.flatten(algs)
        const los = Renderer.flatten(alos)
        const lcs = Renderer.flatten(alcs)
        const countLines = lgs.length / 3

        const gl = this.gl
        gl.useProgram(this.program)

        const gb = Renderer.buffer(ctx, this.aGeoPos.name())
        const ob = Renderer.buffer(ctx, this.aOffset.name())
        const cb = Renderer.buffer(ctx, this.aRgba.name())
        Renderer.setBufferData(gb, new Float32Array(tgs.concat(lgs)), gl)
        Renderer.setBufferData(ob, new Float32Array(tos.concat(los)), gl)
        Renderer.setBufferData(cb, new Uint32Array(tcs.concat(lcs)), gl)
        return new Drawing(ctx, countTriangles, countLines)
    }

    draw(scene: Scene) {
        const bgColour = scene.bgColour()
        this.gl.clearColor(bgColour.red(), bgColour.green(), bgColour.blue(), bgColour.alpha())
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        const sp = scene.sp()
        const geoCentre = [sp.centre().x(), sp.centre().y(), sp.centre().z()]
        const geoToSys = sp.directRotationGl()
        const canvasToClipspace = CoordinateSystems.canvasToClipspace(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)

        const drawings = scene.drawings()
        const earthRadiusMetres = sp.earthRadius()
        const gl = this.gl
        const program = this.program
        gl.useProgram(program)

        /* uniforms. */
        const earthRadiusUniformLocation = gl.getUniformLocation(program, "u_earth_radius")
        gl.uniform1f(earthRadiusUniformLocation, earthRadiusMetres)

        const geoCentreUniformLocation = gl.getUniformLocation(program, "u_geo_centre")
        gl.uniform3fv(geoCentreUniformLocation, geoCentre)

        const geoToSysUniformLocation = gl.getUniformLocation(program, "u_geo_to_system")
        gl.uniformMatrix3fv(geoToSysUniformLocation, false, geoToSys)

        const stereoToCanvasLocation = gl.getUniformLocation(program, "u_stereo_to_canvas")
        gl.uniformMatrix3fv(stereoToCanvasLocation, false, scene.at().glMatrix());

        const canvasToClipspaceLocation = gl.getUniformLocation(program, "u_canvas_to_clipspace");
        gl.uniformMatrix3fv(canvasToClipspaceLocation, false, canvasToClipspace)

        for (const d of drawings) {
            gl.bindVertexArray(d.context().vao());
            /* first triangles. */
            if (d.countTriangles() > 0) {
                gl.drawArrays(gl.TRIANGLES, 0, d.countTriangles());
            }
            /* then lines. */
            if (d.countLines() > 0) {
                gl.drawArrays(gl.LINES, d.countTriangles(), d.countLines());
            }
        }
    }

    private static setBufferData(buffer: WebGLBuffer, vs: Uint32Array | Float32Array,
        gl: WebGL2RenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vs, gl.STATIC_DRAW, 0);
    }

    private static flatten(arr: Array<Array<number>>): Array<number> {
        let res = new Array<number>()
        for (const a of arr) {
            Array.prototype.push.apply(res, a)
        }
        return res
    }

    private static buffer(ctx: DrawingContext, attName: string): WebGLBuffer {
        const b = ctx.buffers().get(attName)
        if (b === undefined) {
            throw new Error("Missing buffer for attribute " + attName)
        }
        return b
    }

    private static readonly VERTEX_SHADER =
        `#version 300 es

// rgba uint to vec4
vec4 rgba_to_colour(uint rgba) {
    float r = float((rgba >> 24u) & 255u) / 255.0;
    float g = float((rgba >> 16u) & 255u) / 255.0;
    float b = float((rgba >> 8u) & 255u) / 255.0;
    float a = float(rgba & 255u) / 100.0;
    return vec4(r, g, b, a);
}

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

// colour (rgba)
in uint a_rgba;

// colour for fragment shader
out vec4 v_colour;

void main() {
    // geocentric to stereographic
    vec2 stereo_pos = geocentric_to_stereographic(a_geo_pos, u_earth_radius, u_geo_centre, u_geo_to_system);

    // convert stereographic position to canvas pixels and add offset
    // u_stereo_to_canvas is row major so v * m
    vec3 c_pos = (vec3(stereo_pos, 1) * u_stereo_to_canvas) + (vec3(a_offset, 0));

    // canvas pixels to clipspace
    // u_projection is row major so v * m
    gl_Position = vec4((c_pos * u_canvas_to_clipspace).xy, 0, 1);

    v_colour = rgba_to_colour(a_rgba);
}
`

    private static readonly FRAGMENT_SHADER =
        `#version 300 es
precision mediump float;

in vec4 v_colour;

out vec4 colour;

void main() {
  colour = v_colour;
}
`

}
