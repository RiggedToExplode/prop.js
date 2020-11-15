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
        private _slotPtr;
        private _freeSlots;
        private _defaultProgram;
        private _defaultTexture;
        private _defaultAttribLocation;
        private _defaultUniformLocation;
        private _defaultBuffer;
        vertexArrays: Map<string, WebGLVertexArrayObject>;
        constructor(_id: string, width?: number, height?: number);
        get id(): string;
        get width(): number;
        get height(): number;
        get type(): string;
        get el(): HTMLCanvasElement;
        get gl(): WebGL2RenderingContext;
        get defaultProgram(): WebGLProgram;
        get defaultTexture(): WebGLTexture;
        get defaultAttribLocation(): AttribLocations;
        get defaultBuffer(): Buffers;
        get defaultUniformLocation(): UniformLocations;
        get loadedTextures(): Map<WebGLTexture, number>;
        set id(id: string);
        set width(width: number);
        set height(height: number);
        compileProgram(vertexSource: string, fragmentSource: string): WebGLProgram;
        assignVertexArray(str: string, vertexArray?: WebGLVertexArrayObject): void;
        getVertexArray(name: string): any;
        vertexArrayWrite(vao: WebGLVertexArrayObject, buffer: WebGLBuffer, location: GLint, data: Float32Array, mode?: GLint, ptr?: VertexPointer): void;
        loadDefaultMeshes(input: MeshInfo | MeshInfo[]): void;
        createSolidTex(color: number[]): WebGLTexture;
        createImageTex(src: string, texParam?: TexParameters, imageProps?: ImageProperties): WebGLTexture;
        loadTexture(texture: WebGLTexture): number;
        getSlot(texture: WebGLTexture): number;
        freeTexture(texture: WebGLTexture): number;
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
        protected _back: number[];
        constructor(stage: Stage, canvas: Canvas, stagePos?: Coord, canvasPos?: Coord, dimensions?: Coord, scale?: Coord, clip?: boolean);
        get gl(): WebGL2RenderingContext;
        get width(): number;
        get height(): number;
        get back(): number[];
        set width(width: number);
        set height(height: number);
        set back(arr: number[]);
        center(pos: Pair | number[]): void;
        centerEx(x: number, y: number): void;
        resize(dimensions: Pair | number[]): void;
        draw(): void;
    }
}
