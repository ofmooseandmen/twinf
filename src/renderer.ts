import { CanvasAffineTransform, CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { Colour } from "./colour"
import { DrawMode, Mesh } from "./mesh"
import { WebGL2 } from "./webgl2"

export class Drawing {

    private readonly _batches: Array<GlArrays>

    constructor(batches: Array<GlArrays>) {
        this._batches = batches
    }

    batches(): Array<GlArrays> {
        return this._batches
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

    private readonly _drawings: Array<Drawing>
    private readonly _bgColour: Colour
    private readonly _sp: StereographicProjection
    private readonly _at: CanvasAffineTransform

    constructor(drawings: Array<Drawing>, bgColour: Colour,
        sp: StereographicProjection, at: CanvasAffineTransform) {
        this._drawings = drawings
        this._bgColour = bgColour
        this._sp = sp
        this._at = at
    }

    drawings(): Array<Drawing> {
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
 * WebGL renderer.
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

    createDrawing(meshes: Array<Mesh>): Drawing {
        const len = meshes.length
        if (len === 0) {
            return new Drawing([])
        }
        const attributes = [this.aGeoPos, this.aOffset, this.aRgba]
        let batches = new Array<Batch>()

        let mesh = meshes[0]
        const state = new State(mesh, this.gl)
        let batch = this.createBatch(state, attributes)
        batches.push(batch)

        this.fillBatch(batch, state, mesh)

        for (let i = 1; i < len; i++) {
            mesh = meshes[i]
            // new batch if different drawing mode or any array changes from empty/non empty
            const newBatch = state.update(mesh, this.gl)
            if (newBatch) {
                batch = this.createBatch(state, attributes)
                batches.push(batch)
            }
            this.fillBatch(batch, state, mesh)
        }
        return new Drawing(batches.map(b => b.createGlArrays(this.gl, this.program)))
    }

    deleteDrawing(drawing: Drawing) {
        this.gl.useProgram(this.program)
        drawing.batches().forEach(b => b.delete(this.gl))
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

        for (let i = 0; i < drawings.length; i++) {
            const bs = drawings[i].batches()
            for (let j = 0; j < bs.length; j++) {
                bs[j].draw(this.gl)
            }
        }
    }

    private createBatch(state: State, attributes: Array<Attribute>): Batch {
        /* count is driven by geos if not empty, offsets otherwise. */
        const attCount = state.emptyGeos ? this.aOffset : this.aGeoPos
        return new Batch(state.drawMode, attributes, attCount)
    }

    private fillBatch(batch: Batch, state: State, mesh: Mesh) {
        if (!state.emptyGeos) { batch.addToArray(this.aGeoPos, mesh.geos()) }
        if (!state.emptyOffsets) { batch.addToArray(this.aOffset, mesh.offsets()) }
        batch.addToArray(this.aRgba, mesh.colours())
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

/**
 * Characteristics of a WebGL attibute.
 */
class Attribute {

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
 * VAO, VBOs and constant attributes to be rendered by one draw call.
 */
class GlArrays {

    private readonly drawMode: GLenum
    private readonly vao: WebGLVertexArrayObject
    private readonly buffers: Array<WebGLBuffer>
    private readonly constants: Array<number>
    private readonly count: number

    constructor(drawMode: GLenum, vao: WebGLVertexArrayObject,
        buffers: Array<WebGLBuffer>, constants: Array<number>,
        count: number) {
        this.drawMode = drawMode
        this.vao = vao
        this.buffers = buffers
        this.constants = constants
        this.count = count
    }

    draw(gl: WebGL2RenderingContext) {
        gl.bindVertexArray(this.vao)
        this.constants.forEach(c => gl.disableVertexAttribArray(c))
        gl.drawArrays(this.drawMode, 0, this.count)
    }

    delete(gl: WebGL2RenderingContext) {
        this.buffers.forEach(b => gl.deleteBuffer(b))
        gl.deleteVertexArray(this.vao)
    }

}

/**
 * Batch of meshes to be rendered with the same draw mode and enables VBOs.
 */
class Batch {

    private readonly drawMode: GLenum
    private readonly attributes: Array<Attribute>
    private readonly attributeCount: Attribute
    private readonly arrays: Map<String, Array<number>>

    constructor(drawMode: GLenum, attributes: Array<Attribute>, attributeCount: Attribute) {
        this.drawMode = drawMode
        this.attributes = attributes
        this.attributeCount = attributeCount
        this.arrays = new Map<String, Array<number>>()
    }

    addToArray(attribute: Attribute, data: Array<number>) {
        let arr = this.arrays.get(attribute.name())
        if (arr === undefined) {
            arr = new Array<number>()
            this.arrays.set(attribute.name(), arr)
        }
        Array.prototype.push.apply(arr, data)
    }

    createGlArrays(gl: WebGL2RenderingContext, program: WebGLProgram): GlArrays {
        gl.useProgram(program);

        const vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error("Could not create vertex array")
        }
        gl.bindVertexArray(vao)

        let buffers = new Array<WebGLBuffer>()
        let constants = new Array<number>()
        for (const a of this.attributes) {
            const attName = a.name()
            const attLocation = gl.getAttribLocation(program, attName)
            const arr = this.arrays.get(attName)
            if (arr === undefined) {
                gl.disableVertexAttribArray(attLocation)
                constants.push(attLocation)
            } else {
                gl.enableVertexAttribArray(attLocation)

                const attBuff = gl.createBuffer()
                if (attBuff === null) {
                    throw new Error("Could not create buffer for attribute: " + attName)
                }
                buffers.push(attBuff)
                gl.bindBuffer(gl.ARRAY_BUFFER, attBuff)

                /* 0 = move forward size * sizeof(type) each iteration to get the next position */
                const stride = 0;
                /* start at the beginning of the buffer */
                const offset = 0;
                if (a.type() == gl.UNSIGNED_INT) {
                    gl.vertexAttribIPointer(attLocation, a.size(), a.type(), stride, offset)
                    gl.bufferData(gl.ARRAY_BUFFER, new Uint32Array(arr), gl.STATIC_DRAW, 0);
                } else {
                    gl.vertexAttribPointer(attLocation, a.size(), a.type(), a.normalised(), stride, offset)
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW, 0);
                }
            }
        }
        gl.bindVertexArray(null);
        const refArray = this.arrays.get(this.attributeCount.name())
        if (refArray === undefined) {
            throw new Error("No array for attribute: " + this.attributeCount.name())
        }
        const count = refArray.length / this.attributeCount.size()
        return new GlArrays(this.drawMode, vao, buffers, constants, count)
    }

}

class State {

    drawMode: GLenum
    emptyGeos: boolean
    emptyOffsets: boolean

    constructor(m: Mesh, gl: WebGLRenderingContext) {
        this.drawMode = State.drawMode(m, gl)
        this.emptyGeos = State.isEmpty(m.geos())
        this.emptyOffsets = State.isEmpty(m.offsets())
    }

    update(m: Mesh, gl: WebGLRenderingContext): boolean {
        const drawMode = State.drawMode(m, gl)
        const emptyGeos = State.isEmpty(m.geos())
        const emptyOffsets = State.isEmpty(m.offsets())
        const changed = this.drawMode !== drawMode
            || this.emptyGeos != emptyGeos
            || this.emptyOffsets != emptyOffsets
        if (changed) {
            this.drawMode = drawMode
            this.emptyGeos = emptyGeos
            this.emptyOffsets = emptyOffsets
        }
        return changed
    }

    private static drawMode(m: Mesh, gl: WebGLRenderingContext): GLenum {
        return m.drawMode() == DrawMode.LINES ? gl.LINES : gl.TRIANGLES
    }

    private static isEmpty(a: Array<number>): boolean {
        return a.length === 0
    }

}
