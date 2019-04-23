import { Batch, BatchManager, BatchFactory } from '../src/batches'
import { Colour } from './colour'
import {
    CanvasAffineTransform,
    CoordinateSystems,
    StereographicProjection
} from './coordinate-systems'
import { RenderableGraphic } from './graphic'
import { DrawMode, Mesh } from './mesh'
import { WebGL2 } from './webgl2'

/**
 * Characteristics of a WebGL attibute.
 */
class Attribute {

    private readonly _name: string
    private readonly _size: GLint
    private readonly _type: GLenum
    private readonly _extractor: (mesh: Mesh) => ReadonlyArray<number>

    constructor(name: string, size: GLint, type: GLenum,
        extractor: (mesh: Mesh) => ReadonlyArray<number>) {
        this._name = name
        this._size = size
        this._type = type
        this._extractor = extractor
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
     * Function to extract the data relevant to this
     * attribute from a mesh.
     */
    extractor(): (mesh: Mesh) => ReadonlyArray<number> {
        return this._extractor
    }

}
/**
 * All attributes used to render mesh.
 */
class Attributes {

    private readonly atts: ReadonlyArray<Attribute>

    constructor(gl: WebGL2RenderingContext) {
        this.atts = [
            new Attribute('a_geo_pos', 3, gl.FLOAT, m => m.geos()),
            new Attribute('a_prev_geo_pos', 3, gl.FLOAT,
                m => {
                    const e = m.extrusion()
                    return e === undefined ? [] : e.prevGeos()
                }),
            new Attribute('a_next_geo_pos', 3, gl.FLOAT,
                m => {
                    const e = m.extrusion()
                    return e === undefined ? [] : e.nextGeos()
                }),
            new Attribute('a_half_width', 1, gl.FLOAT,
                m => {
                    const e = m.extrusion()
                    return e === undefined ? [] : e.halfWidths()
                }),
            new Attribute('a_offset', 2, gl.FLOAT, m => m.offsets()),
            new Attribute('a_rgba', 1, gl.UNSIGNED_INT, m => m.colours())
        ]
    }

    enabled(mesh: Mesh): ReadonlyArray<string> {
        let res = new Array<string>()
        if (mesh.geos().length > 0) {
            res.push('a_geo_pos')
        }
        const extrusion = mesh.extrusion()
        if (extrusion !== undefined) {
            res.push('a_prev_geo_pos')
            res.push('a_next_geo_pos')
            res.push('a_half_width')
        }
        if (mesh.offsets().length > 0) {
            res.push('a_offset')
        }
        res.push('a_rgba')
        return res
    }

    disabled(mesh: Mesh): ReadonlyArray<string> {
        let res = new Array<string>()
        if (mesh.geos().length === 0) {
            res.push('a_geo_pos')
        }
        const extrusion = mesh.extrusion()
        if (extrusion === undefined) {
            res.push('a_prev_geo_pos')
            res.push('a_next_geo_pos')
            res.push('a_half_width')
        }
        if (mesh.offsets().length === 0) {
            res.push('a_offset')
        }
        return res
    }

    /* count is geos if not empty, offsets otherwise. */
    counter(mesh: Mesh): string {
        return mesh.geos().length === 0 ? 'a_offset' : 'a_geo_pos'
    }

    named(attName: string): Attribute {
        const att = this.atts.find(a => a.name() === attName)
        if (att === undefined) {
            throw new Error('Unknown attribute: ' + attName)
        }
        return att
    }

}

class GlBatch extends Batch {

    private readonly enabled: ReadonlyArray<string>
    private readonly _disabled: ReadonlyArray<string>
    private readonly counter: string
    private readonly _drawMode: DrawMode

    private readonly gl: WebGL2RenderingContext
    private readonly program: WebGLProgram
    private readonly vao: WebGLVertexArrayObject
    private readonly attributes: Attributes
    private readonly buffers: Map<string, WebGLBuffer>
    private count: number

    constructor(enabled: ReadonlyArray<string>,
        disabled: ReadonlyArray<string>, counter: string,
        drawMode: DrawMode, gl: WebGL2RenderingContext,
        program: WebGLProgram, attributes: Attributes) {
        super()
        this.enabled = enabled
        this._disabled = disabled
        this.counter = counter
        this._drawMode = drawMode

        this.gl = gl
        this.program = program
        this.attributes = attributes
        this.count = 0

        const vao = gl.createVertexArray();
        if (vao === null) {
            throw new Error('Could not create vertex array')
        }
        this.vao = vao
        this.buffers = new Map<string, WebGLBuffer>()
        for (const attName of this.enabled) {
            const attBuff = gl.createBuffer()
            if (attBuff === null) {
                throw new Error('Could not create buffer for attribute: ' + attName)
            }
            this.buffers.set(attName, attBuff)
        }
    }

    destroy() {
        const gl = this.gl
        for (const att of this.buffers.entries()) {
            gl.deleteBuffer(att[1])
        }
        gl.deleteVertexArray(this.vao)
    }

    draw() {
        const gl = this.gl
        gl.bindVertexArray(this.vao)
        if (this.isDirty()) {
            this.update(this.meshes())
            this.unsetDirty()
        }
        /*
         * disable the vertex array, the attribute will have
         * the default value which the shader can handle.
         */
        const len = this._disabled.length
        for (let i = 0; i < len; i++) {
            const attLocation = gl.getAttribLocation(this.program, this._disabled[i])
            gl.disableVertexAttribArray(attLocation)
        }
        const drawMode = this._drawMode == DrawMode.LINES
            ? gl.LINES
            : gl.TRIANGLES
        gl.drawArrays(drawMode, 0, this.count)
    }

    disabled(): ReadonlyArray<string> {
        return this._disabled
    }

    drawMode(): DrawMode {
        return this._drawMode
    }

    private update(meshes: ReadonlyArray<Mesh>) {
        const gl = this.gl
        for (const att of this.buffers.entries()) {
            const attName = att[0]
            const a = this.attributes.named(attName)
            const arr = a.type() == gl.UNSIGNED_INT
                ? this.mkUint32Array(meshes, a.extractor())
                : this.mkFloat32Array(meshes, a.extractor())
            const attLocation = gl.getAttribLocation(this.program, attName)
            gl.enableVertexAttribArray(attLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, att[1])
            /* 0 = move forward size * sizeof(type) each iteration to get the next position */
            const stride = 0;
            /* start at the beginning of the buffer */
            const offset = 0;
            if (a.type() == gl.UNSIGNED_INT) {
                gl.vertexAttribIPointer(attLocation, a.size(), a.type(), stride, offset)
            } else {
                gl.vertexAttribPointer(attLocation, a.size(), a.type(), false, stride, offset)
            }
            gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW, 0);
            if (attName === this.counter) {
                this.count = arr.length / a.size()
            }
        }
    }

    private mkFloat32Array(ms: ReadonlyArray<Mesh>,
        extract: (m: Mesh) => ReadonlyArray<number>): Float32Array {
        const len = ms.length
        let length = 0
        for (let i = 0; i < len; i++) {
            length += extract(ms[i]).length;
        }
        let result = new Float32Array(length);
        let offset = 0;
        for (let i = 0; i < len; i++) {
            const arr = extract(ms[i])
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }

    private mkUint32Array(ms: ReadonlyArray<Mesh>,
        extract: (m: Mesh) => ReadonlyArray<number>): Uint32Array {
        const len = ms.length
        let length = 0
        for (let i = 0; i < len; i++) {
            length += extract(ms[i]).length;
        }
        let result = new Uint32Array(length);
        let offset = 0;
        for (let i = 0; i < len; i++) {
            const arr = extract(ms[i])
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }


}

class GlBatchFactory implements BatchFactory<GlBatch> {

    private readonly gl: WebGL2RenderingContext
    private readonly program: WebGLProgram
    private readonly attributes: Attributes

    constructor(gl: WebGL2RenderingContext,
        program: WebGLProgram, attributes: Attributes) {
        this.gl = gl
        this.program = program
        this.attributes = attributes
    }

    fits(mesh: Mesh, batch: GlBatch): boolean {
        const od = this.attributes.disabled(mesh)
        return mesh.drawMode() === batch.drawMode()
            && GlBatchFactory.arraysEqual(od, batch.disabled())
    }

    createBatch(mesh: Mesh): GlBatch {
        return new GlBatch(
            this.attributes.enabled(mesh),
            this.attributes.disabled(mesh),
            this.attributes.counter(mesh),
            mesh.drawMode(),
            this.gl, this.program, this.attributes)
    }

    private static arraysEqual(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
        if (a === b) return true;
        if (a.length != b.length) return false;
        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

}
/**
 * Contextual information to draw meshes.
 */
export class DrawingContext {

    private readonly _bgColour: Colour
    private readonly _sp: StereographicProjection
    private readonly _at: CanvasAffineTransform

    constructor(bgColour: Colour, sp: StereographicProjection,
        at: CanvasAffineTransform) {
        this._bgColour = bgColour
        this._sp = sp
        this._at = at
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
    private readonly program: WebGLProgram
    private readonly bm: BatchManager<GlBatch>

    constructor(gl: WebGL2RenderingContext, miterLimit: number) {
        this.gl = gl
        this.miterLimit = miterLimit
        const vertexShader = WebGL2.createShader(gl, gl.VERTEX_SHADER, Renderer.VERTEX_SHADER)
        const fragmentShader = WebGL2.createShader(gl, gl.FRAGMENT_SHADER, Renderer.FRAGMENT_SHADER)
        this.program = WebGL2.createProgram(gl, vertexShader, fragmentShader)
        const attributes = new Attributes(gl)
        const factory = new GlBatchFactory(gl, this.program, attributes)
        this.bm = new BatchManager<GlBatch>(factory)
    }

    insert(graphic: RenderableGraphic) {
        this.gl.useProgram(this.program)
        this.bm.insert(graphic)
    }

    delete(graphicName: string) {
        this.gl.useProgram(this.program)
        this.bm.delete(graphicName)
    }

    draw(ctx: DrawingContext) {
        const bgColour = ctx.bgColour()
        this.gl.clearColor(bgColour.red(), bgColour.green(), bgColour.blue(), bgColour.alpha())
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        const sp = ctx.sp()
        const geoCentre = [sp.centre().x(), sp.centre().y(), sp.centre().z()]
        const geoToSys = sp.directRotationGl()
        const canvasToClipspace = CoordinateSystems.canvasToClipspace(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)

        const earthRadiusMetres = sp.earthRadius()
        const gl = this.gl
        const program = this.program
        gl.useProgram(program)

        /* uniforms. */
        const earthRadiusUniformLocation = gl.getUniformLocation(program, 'u_earth_radius')
        gl.uniform1f(earthRadiusUniformLocation, earthRadiusMetres)

        const miterLimitUniformLocation = gl.getUniformLocation(program, 'u_miter_limit')
        gl.uniform1f(miterLimitUniformLocation, this.miterLimit)

        const geoCentreUniformLocation = gl.getUniformLocation(program, 'u_geo_centre')
        gl.uniform3fv(geoCentreUniformLocation, geoCentre)

        const geoToSysUniformLocation = gl.getUniformLocation(program, 'u_geo_to_system')
        gl.uniformMatrix3fv(geoToSysUniformLocation, false, geoToSys)

        const stereoToCanvasLocation = gl.getUniformLocation(program, 'u_stereo_to_canvas')
        gl.uniformMatrix3fv(stereoToCanvasLocation, false, ctx.at().glMatrix());

        const canvasToClipspaceLocation = gl.getUniformLocation(program, 'u_canvas_to_clipspace');
        gl.uniformMatrix3fv(canvasToClipspaceLocation, false, canvasToClipspace)

        const layers = this.bm.layers()
        const ll = layers.length
        for (let i = 0; i < ll; i++) {
            const layer = layers[i]
            const bl = layer.length
            for (let j = 0; j < bl; j++) {
                layer[j].draw()
            }
        }
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
