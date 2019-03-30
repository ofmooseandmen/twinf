import { CanvasAffineTransform, CoordinateSystems, StereographicProjection } from "./coordinate-systems"
import { Colour } from "./colour"
import { DrawMode, Mesh } from "./mesh"
import { WebGL2 } from "./webgl2"

export class Drawing {

    private readonly _batches: ReadonlyArray<GlArrays>

    constructor(batches: ReadonlyArray<GlArrays>) {
        this._batches = batches
    }

    batches(): ReadonlyArray<GlArrays> {
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

    private readonly _drawings: ReadonlyArray<Drawing>
    private readonly _bgColour: Colour
    private readonly _sp: StereographicProjection
    private readonly _at: CanvasAffineTransform

    constructor(drawings: ReadonlyArray<Drawing>, bgColour: Colour,
        sp: StereographicProjection, at: CanvasAffineTransform) {
        this._drawings = drawings
        this._bgColour = bgColour
        this._sp = sp
        this._at = at
    }

    drawings(): ReadonlyArray<Drawing> {
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
    private readonly miterLimit: number
    private readonly aGeoPos: Attribute
    private readonly aPrevGeoPos: Attribute
    private readonly aNextGeoPos: Attribute
    private readonly aHalfWidth: Attribute
    private readonly aOffset: Attribute
    private readonly aRgba: Attribute
    private readonly program: WebGLProgram

    constructor(gl: WebGL2RenderingContext, miterLimit: number) {
        this.gl = gl
        this.miterLimit = miterLimit
        this.aGeoPos = new Attribute("a_geo_pos", 3, this.gl.FLOAT)
        this.aPrevGeoPos = new Attribute("a_prev_geo_pos", 3, this.gl.FLOAT)
        this.aNextGeoPos = new Attribute("a_next_geo_pos", 3, this.gl.FLOAT)
        this.aHalfWidth = new Attribute("a_half_width", 1, this.gl.FLOAT)
        this.aOffset = new Attribute("a_offset", 2, this.gl.FLOAT)
        this.aRgba = new Attribute("a_rgba", 1, this.gl.UNSIGNED_INT)
        const vertexShader = WebGL2.createShader(this.gl, this.gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = WebGL2.createShader(this.gl, this.gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = WebGL2.createProgram(this.gl, vertexShader, fragmentShader)
    }

    createDrawing(meshes: ReadonlyArray<Mesh>): Drawing {
        const len = meshes.length
        if (len === 0) {
            return new Drawing([])
        }
        const attributes = [
            this.aGeoPos,
            this.aPrevGeoPos,
            this.aNextGeoPos,
            this.aHalfWidth,
            this.aOffset,
            this.aRgba
        ]
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

        const miterLimitUniformLocation = gl.getUniformLocation(program, "u_miter_limit")
        gl.uniform1f(miterLimitUniformLocation, this.miterLimit)

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
        if (!state.emptyGeos) {
            batch.addToArray(this.aGeoPos, mesh.geos())
        }
        const extrusion = mesh.extrusion()
        if (extrusion !== undefined) {
            batch.addToArray(this.aPrevGeoPos, extrusion.prevGeos())
            batch.addToArray(this.aNextGeoPos, extrusion.nextGeos())
            batch.addToArray(this.aHalfWidth, extrusion.halfWidths())
        }
        if (!state.emptyOffsets) {
            batch.addToArray(this.aOffset, mesh.offsets())
        }
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

// normal to given direction
vec2 normal(vec2 d) {
    return vec2(-d.y, d.x);
}

// direction from a to b
vec2 direction(vec2 a, vec2 b) {
    return normalize(a - b);
}

// extrudes given pos by given signed half width towards the miter at position.
vec2 extrude_using_adjs(vec2 pos, vec2 prev, vec2 next, float half_width, float miter_limit) {
    // line from prev to pt.
    vec2 line_to = direction(pos, prev);
    vec2 n = normal(line_to);
    // line from pt to next.
    vec2 line_from = direction(next, pos);
    // miter.
    vec2 tangent = normalize(line_to + line_from);
    vec2 miter = normal(tangent);
    float miter_length = half_width / dot(miter, n);
    vec2 res;
    if (miter_length / half_width > miter_limit) {
        res = pos + n * half_width;
    } else {
        res = pos + miter * miter_length;
    }
    return res;
}

// extrudes given pos by given signed half width towards the normal at position.
vec2 extrude_using_adj(vec2 pos, vec2 adj, float half_width) {
    return pos + (normal(direction(adj, pos)) * half_width);
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

// geocentric to canvas
vec2 geocentric_to_canvas(vec3 geo, float er, vec3 centre, mat3 rotation, mat3 stereo_to_canvas, vec2 offset) {
    // geocentric to stereographic
    vec2 stereo = geocentric_to_stereographic(geo, er, centre, rotation);
    // stereographic to canvas
    vec3 c_pos = (vec3(stereo, 1) * stereo_to_canvas) + (vec3(offset, 0));
    return c_pos.xy;
}

// -------------------------- //
//  stereographic projection  //
// -------------------------- //

// earth radius (metres)
uniform float u_earth_radius;

// miter limit
uniform float u_miter_limit;

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

// geocentric position, (0, 0, 0) if none.
in vec3 a_geo_pos;

// previous geocentric position or (0, 0, 0) if none.
in vec3 a_prev_geo_pos;

// next geocentric position or (0, 0, 0) if none.
in vec3 a_next_geo_pos;

// half width for extrusion, when 0 no extrusion is to be done.
// if different from 0 at least one of a_prev_geo_pos or a_next_geo_pos
// is not (0, 0, 0).
in float a_half_width;

// offset in pixels, (0, 0) if none.
in vec2 a_offset;

// colour (rgba)
in uint a_rgba;

// colour for fragment shader
out vec4 v_colour;

void main() {
    vec2 c_pos;
    if (a_half_width == 0.0) {
        // geocentric to canvas
        c_pos = geocentric_to_canvas(a_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
    } else {
        // a_geo_pos: geocentric to canvas
        vec2 c_c_pos =
            geocentric_to_canvas(a_geo_pos, u_earth_radius, u_geo_centre,
                                 u_geo_to_system, u_stereo_to_canvas, a_offset);

        if (length(a_prev_geo_pos) == 0.0) {
            // next: geocentric to canvas
            vec2 c_n_pos =
                geocentric_to_canvas(a_next_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
            // extrude c_c_pos by signed half width
            c_pos = extrude_using_adj(c_c_pos, c_n_pos, a_half_width);
        } else if (length(a_next_geo_pos) == 0.0) {
            // prev: geocentric to canvas
            vec2 c_p_pos =
                geocentric_to_canvas(a_prev_geo_pos, u_earth_radius, u_geo_centre,
                                     u_geo_to_system, u_stereo_to_canvas, a_offset);
            // extrude c_c_pos by signed half width
            c_pos = extrude_using_adj(c_c_pos, c_p_pos, a_half_width);
        } else {
          // prev: geocentric to canvas
          vec2 c_p_pos =
              geocentric_to_canvas(a_prev_geo_pos, u_earth_radius, u_geo_centre,
                                   u_geo_to_system, u_stereo_to_canvas, a_offset);
          // next: geocentric to canvas
          vec2 c_n_pos =
              geocentric_to_canvas(a_next_geo_pos, u_earth_radius, u_geo_centre,
                                   u_geo_to_system, u_stereo_to_canvas, a_offset);
          c_pos = extrude_using_adjs(c_c_pos, c_p_pos, c_n_pos, a_half_width, u_miter_limit);
        }
    }

    // canvas pixels to clipspace
    // u_projection is row major so v * m
    gl_Position = vec4((vec3(c_pos, 1) * u_canvas_to_clipspace).xy, 0, 1);

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

    constructor(name: string, size: GLint, type: GLenum) {
        this._name = name
        this._size = size
        this._type = type
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
        /*
         * disable the vertex array, the attribute will have
         * the default value which the shader can handle.
         */
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
    private readonly attributes: ReadonlyArray<Attribute>
    private readonly attributeCount: Attribute
    private readonly arrays: Map<String, Array<number>>

    constructor(drawMode: GLenum, attributes: ReadonlyArray<Attribute>, attributeCount: Attribute) {
        this.drawMode = drawMode
        this.attributes = attributes
        this.attributeCount = attributeCount
        this.arrays = new Map<String, Array<number>>()
    }

    addToArray(attribute: Attribute, data: ReadonlyArray<number>) {
        let arr = this.arrays.get(attribute.name())
        if (arr === undefined) {
            arr = new Array<number>()
            this.arrays.set(attribute.name(), arr)
        }
        const len = data.length
        for (let i = 0; i < len; i++) {
            arr.push(data[i])
        }
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
                    gl.vertexAttribPointer(attLocation, a.size(), a.type(), false, stride, offset)
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

/**
 * Capture the state of the drawing to create batches.
 */
class State {

    drawMode: GLenum
    emptyGeos: boolean
    private emptyExtrusion: boolean
    emptyOffsets: boolean

    constructor(m: Mesh, gl: WebGLRenderingContext) {
        this.drawMode = State.drawMode(m, gl)
        this.emptyGeos = State.isEmpty(m.geos())
        this.emptyExtrusion = m.extrusion() === undefined
        this.emptyOffsets = State.isEmpty(m.offsets())
    }

    update(m: Mesh, gl: WebGLRenderingContext): boolean {
        const drawMode = State.drawMode(m, gl)
        const emptyGeos = State.isEmpty(m.geos())
        const emptyExtrusion = m.extrusion() === undefined
        const emptyOffsets = State.isEmpty(m.offsets())
        const changed = this.drawMode !== drawMode
            || this.emptyGeos !== emptyGeos
            || this.emptyExtrusion !== emptyExtrusion
            || this.emptyOffsets !== emptyOffsets
        if (changed) {
            this.drawMode = drawMode
            this.emptyGeos = emptyGeos
            this.emptyExtrusion = emptyExtrusion
            this.emptyOffsets = emptyOffsets
        }
        return changed
    }

    private static drawMode(m: Mesh, gl: WebGLRenderingContext): GLenum {
        return m.drawMode() == DrawMode.LINES ? gl.LINES : gl.TRIANGLES
    }

    private static isEmpty(a: ReadonlyArray<number>): boolean {
        return a.length === 0
    }

}
