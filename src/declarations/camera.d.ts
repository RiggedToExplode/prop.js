interface TexParameters {
    mag?: GLint;
    min?: GLint;
    s?: GLint;
    t?: GLint;
}
interface VertexPointer {
    size: GLint;
    type: GLenum;
    normalize: GLboolean;
    stride: GLsizei;
    offset: GLintptr;
}
interface ImageProperties {
    level?: number;
    internalFormat?: number;
    width?: number;
    height?: number;
    border?: number;
    srcFormat?: number;
    srcType?: number;
}
interface AttribLocations {
    position: GLint;
    texCoord: GLint;
}
interface UniformLocations {
    resolution: WebGLUniformLocation;
    offset: WebGLUniformLocation;
    scale: WebGLUniformLocation;
    rotation: WebGLUniformLocation;
    texture: WebGLUniformLocation;
}
interface Buffers {
    position: WebGLBuffer;
    texCoord: WebGLBuffer;
}
interface MeshInfo {
    name: string;
    triangles: Float32Array;
    texTriangles: Float32Array;
}
declare namespace $P {
    class Canvas {
        private _id;
        static defaultShaderSource: {
            vertex: string;
            fragment: string;
        };
        private _type;
        private _el;
        private _gl;
        private _loadedTextures;
        private _defaultProgram;
        private _defaultTexture;
        private _defaultAttribLocation;
        private _defaultUniformLocation;
        private _defaultBuffer;
        vertexArrays: Map<string, WebGLVertexArrayObject>;
        customPrograms: WebGLProgram[];
        constructor(_id: string, width?: number, height?: number);
        set id(id: string);
        set width(width: number);
        set height(height: number);
        get type(): string;
        get el(): HTMLCanvasElement;
        get gl(): WebGL2RenderingContext;
        get defaultProgram(): WebGLProgram;
        get defaultTexture(): WebGLTexture;
        get defaultAttribLocation(): AttribLocations;
        get defaultBuffer(): Buffers;
        get defaultUniformLocation(): UniformLocations;
        get id(): string;
        get width(): number;
        get height(): number;
        private _compileProgram;
        createProgram(vertexSource: string, shaderSource: string): WebGLProgram;
        assignVertexArray(str: string): void;
        assignVertexArrays(arr: string[]): void;
        getVertexArray(name: string): any;
        preloadDefaults(input: MeshInfo | MeshInfo[]): void;
        vertexArrayWrite(vao: WebGLVertexArrayObject, buffer: WebGLBuffer, location: GLint, data: Float32Array, mode?: GLint, ptr?: VertexPointer): void;
        createSolidTex(color: number[]): WebGLTexture;
        createImageTex(src: string, texParam?: TexParameters, imageProps?: ImageProperties): WebGLTexture;
    }
    class Camera extends Base {
        stage: Stage;
        canvas: Canvas;
        stagePos: Coord;
        canvasPos: Coord;
        dimensions: Coord;
        scale: Coord;
        clip: boolean;
        protected _type: string;
        back: string;
        constructor(stage: Stage, canvas: Canvas, stagePos?: Coord, canvasPos?: Coord, dimensions?: Coord, scale?: Coord, clip?: boolean);
        set width(width: number);
        set height(height: number);
        get width(): number;
        get height(): number;
        get gl(): WebGL2RenderingContext;
        center(pos: Pair | number[]): void;
        centerEx(x: number, y: number): void;
        resize(dimensions: Pair | number[]): void;
        draw(): void;
    }
}
