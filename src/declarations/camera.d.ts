declare namespace $P {
    class Canvas {
        private _id;
        private _el;
        private _gl;
        defaultTexture: WebGLTexture;
        constructor(_id: string, width?: number, height?: number);
        set id(id: string);
        set width(width: number);
        set height(height: number);
        get el(): HTMLCanvasElement;
        get gl(): WebGL2RenderingContext;
        get id(): string;
        get width(): number;
        get height(): number;
        createSolidTex(color: number[], level?: number): WebGLTexture;
        loadImageTex(src: string, level?: number, internalFormat?: number, srcFormat?: number, srcType?: number): WebGLTexture;
    }
    class Camera extends Base {
        stage: Stage;
        canvas: Canvas;
        stagePos: Coord;
        canvasPos: Coord;
        dimensions: Coord;
        scale: Coord;
        clip: boolean;
        static shaderSource: {
            vertex: string;
            fragment: string;
        };
        static createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader;
        static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram;
        static bufferWrite(gl: WebGL2RenderingContext, buffer: WebGLBuffer, data: Float32Array, mode: number): void;
        private shaders;
        private program;
        private attribLocation;
        private uniformLocation;
        private buffers;
        private vertexArrayObject;
        back: string;
        constructor(stage: Stage, canvas: Canvas, stagePos?: Coord, canvasPos?: Coord, dimensions?: Coord, scale?: Coord, clip?: boolean);
        set width(width: number);
        set height(height: number);
        get width(): number;
        get height(): number;
        get gl(): WebGL2RenderingContext;
        center(pos: number[]): void;
        centerEx(x: number, y: number): void;
        resize(): void;
        draw(): void;
    }
}
