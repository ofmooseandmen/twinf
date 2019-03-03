/**
 * Static utility methods for manipulation WebGL2 constructs.
 */
export class WebGL2 {

    private constructor() { }

    static createShader(gl: WebGL2RenderingContext, type: number,
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

    static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader,
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

}
