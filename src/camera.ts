interface TexParameters {
    mag?: GLint,
    min?: GLint,
    s?: GLint,
    t?: GLint
}

interface VertexPointer {
    size: GLint,
    type: GLenum,
    normalize: GLboolean,
    stride: GLsizei,
    offset: GLintptr
}

interface ImageProperties {
    level?: number,
    internalFormat?: number,
    width?: number,
    height?: number,
    border?: number,
    srcFormat?: number,
    srcType?: number
}

interface AttribLocations {
    position: GLint,
    texCoord: GLint
}

interface UniformLocations {
    resolution: WebGLUniformLocation,
    offset: WebGLUniformLocation,
    scale: WebGLUniformLocation,
    rotation: WebGLUniformLocation,
    texture: WebGLUniformLocation
}

interface Buffers {
    position: WebGLBuffer,
    texCoord: WebGLBuffer
}

namespace $P {
    export class Canvas { //Canvas class to provide an integrated interface for <canvas> elements. 
        static defaultShaderSource: {vertex: string, fragment: string} = {
            vertex: `#version 300 es //VERTEX SHADER
                in vec2 a_position; //Take a vec2 position value as input.
                in vec2 a_texCoord; //Take a vec2 for texture coordinates.

                uniform vec2 u_resolution; //Take the current Canvas width and height as a uniform.
                uniform vec2 u_rotation;
                uniform vec2 u_scale;
                uniform vec2 u_offset; //Take the offset from the top-left of the Canvas that the current Prop is being drawn at.

                out vec2 v_texCoord; //Pass texture coordinates to fragment shader.

                void main() { //Main loop
                    vec2 rotated = vec2(
                        a_position.x * u_rotation.y + a_position.y * u_rotation.x,
                        a_position.y * u_rotation.y - a_position.x * u_rotation.x
                    );
                    vec2 scaled = vec2(
                        rotated.x * u_scale.x,
                        rotated.y * u_scale.y
                    );
                    vec2 relToZero = scaled + u_offset; //Get the position of the current vertex relative to the top left of the canvas.
                    vec2 zeroToOne = relToZero / u_resolution; //Get a 0 to 1 clipspace position from the gamespace position.
                    vec2 zeroToTwo = zeroToOne * 2.0; //Convert 0 to 1 to 0 to 2
                    vec2 clipSpace = zeroToTwo - 1.0; //Convert 0 to 2 to -1 to 1 clip space coordinates.

                    gl_Position = vec4(clipSpace, 0, 1); //Send the clip space position to the fragment shader.
                    v_texCoord = a_texCoord;
                }`,
            fragment: `#version 300 es //FRAGMENT SHADER
                precision highp float;

                in vec2 v_texCoord; //Take in the texture coordinate varying.
                
                uniform sampler2D u_texture; //Take in the texture uniform.

                out vec4 outColor; //Declare the output color.

                void main() {
                    outColor = texture(u_texture, v_texCoord);
                }`
        }
        

        private _type: string = "canvas";
        
        private _el: HTMLCanvasElement; //Initialize private property to store the DOM canvas element.
        private _gl: WebGL2RenderingContext; //The WebGL2 rendering context of this Canvas object's <canvas> element.
        
        private _buffer: WebGLBuffer;
        private _defaultProgram: WebGLProgram;
        private _defaultTexture: WebGLTexture;
        private _defaultAttribLocation: AttribLocations = {position: undefined, texCoord: undefined};
        private _defaultUniformLocation: UniformLocations = {resolution: undefined, offset: undefined, scale: undefined, rotation: undefined, texture: undefined};
        private _defaultBuffer: Buffers = {position: undefined, texCoord: undefined};

        public vertexArrayObjects: Map<string, WebGLVertexArrayObject>;
        public customPrograms: WebGLProgram[];


        constructor (private _id: string, width: number = 200, height: number = 100) {
            this._el = document.getElementById(_id) as HTMLCanvasElement; //Store the DOM-represented <canvas> element based on the _id parameter.
            this._gl = this._el.getContext("webgl2"); //Get the rendering context based on the _contextType parameter.
            
            this._buffer = this._gl.createBuffer();

            this._defaultTexture = this.createSolidTex([0, 255, 0, 255]);
            this._defaultProgram = this._compileProgram(Canvas.defaultShaderSource.vertex, Canvas.defaultShaderSource.fragment); //Create the WebGL2 program

            this._defaultAttribLocation.position = this._gl.getAttribLocation(this._defaultProgram, "a_position"); //Get location of position attribute.
            this._defaultAttribLocation.texCoord = this._gl.getAttribLocation(this._defaultProgram, "a_texCoord"); //Get location of texture coordinate attribute.

            this._defaultBuffer.position = this._gl.createBuffer();
            this._defaultBuffer.texCoord = this._gl.createBuffer();

            this._defaultUniformLocation.resolution = this._gl.getUniformLocation(this._defaultProgram, "u_resolution"); //Get location of resolution uniform.
            this._defaultUniformLocation.offset = this._gl.getUniformLocation(this._defaultProgram, "u_offset"); //Get location of offset uniform.
            this._defaultUniformLocation.scale = this._gl.getUniformLocation(this._defaultProgram, "u_scale");
            this._defaultUniformLocation.rotation = this._gl.getUniformLocation(this._defaultProgram, "u_rotation");
            this._defaultUniformLocation.texture = this._gl.getUniformLocation(this._defaultProgram, "u_texture"); //Get location of texture uniform.
            
            this.vertexArrayObjects = new Map();
            this.customPrograms = [];

            this.width = width; //Set width and height based on parameters.
            this.height = height;
        }


        set id(id: string) { //Set the element id of this Canvas, and in doing so re-get the <canvas> element and rendering context.
            this._id = id;
            this._el = document.getElementById(id) as HTMLCanvasElement;
            this._gl = this._el.getContext("webgl2");
        }

        set width(width: number) { //Set the width of the <canvas> element.
            this._el.width = width;
        }

        set height(height: number) { //Set the height of the <canvas> element.
            this._el.height = height;
        }


        get type(): string {
            return "canvas";
        }

        get el(): HTMLCanvasElement { //Get the DOM representation of the <canvas> element.
            return this._el;
        }

        get gl(): WebGL2RenderingContext { //Get the rendering context
            return this._gl;
        }

        get defaultProgram(): WebGLProgram {
            return this._defaultProgram;
        }

        get defaultTexture(): WebGLTexture {
            return this._defaultTexture;
        }

        get defaultAttribLocation(): AttribLocations {
            return this._defaultAttribLocation;
        }

        get defaultBuffer(): Buffers {
            return this._defaultBuffer;
        }

        get defaultUniformLocation(): UniformLocations {
            return this._defaultUniformLocation;
        }

        get id(): string {
            return this._id;
        }


        get width(): number { //Get the width of the <canvas> element.
            return this._el.width;
        }

        get height(): number { //Get the height of the <canvas> element.
            return this._el.height;
        }


        private _compileProgram(vertexSource: string, fragmentSource: string) {
            let vertex = this._gl.createShader(this._gl.VERTEX_SHADER);

            this._gl.shaderSource(vertex, vertexSource);
            this._gl.compileShader(vertex);

            if (!this._gl.getShaderParameter(vertex, this._gl.COMPILE_STATUS)) {
                console.error(this._gl.getShaderInfoLog(vertex)); //Otherwise print an error,
                this._gl.deleteShader(vertex); //Delete the failed shader
                throw new Error("WebGL shader compile error on vertex shader!"); //And exit with an error.
            }

            let fragment = this._gl.createShader(this._gl.FRAGMENT_SHADER);

            this._gl.shaderSource(fragment, fragmentSource);
            this._gl.compileShader(fragment);

            if (!this._gl.getShaderParameter(fragment, this._gl.COMPILE_STATUS)) {
                console.error(this._gl.getShaderInfoLog(fragment)); //Otherwise print an error,
                this._gl.deleteShader(fragment); //Delete the failed shader
                throw new Error("WebGL shader compile error on fragment shader!"); //And exit with an error.
            }

            let program = this._gl.createProgram();
            
            this._gl.attachShader(program, vertex);
            this._gl.attachShader(program, fragment);
            this._gl.linkProgram(program);

            if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
                console.error(this._gl.getProgramInfoLog(program));
                this._gl.deleteProgram(program);
                throw new Error("WebGL program linking error!");
            }

            return program;
        }

        createProgram(vertexSource: string, shaderSource: string) {
            let program = this._compileProgram(vertexSource, shaderSource);
            this.customPrograms.push(program);
            return program;
        }

        createVertexArray(key: string) {
            let vao = this._gl.createVertexArray();
            this.vertexArrayObjects.set(key, vao);
            return vao;
        }

        assignVAO(str: string) {
            this.vertexArrayObjects.set(str, this._gl.createVertexArray());
        }

        assignVAOs(arr: string[]) {
            arr.forEach(element => {
                this.assignVAO(element);
            });
        }


        vertexArrayWrite(vao: WebGLVertexArrayObject, buffer: WebGLBuffer, location: GLint, data: Float32Array, mode: GLint = this._gl.DYNAMIC_DRAW, ptr: VertexPointer = { size: 2, type: this._gl.FLOAT, normalize: false, stride: 0, offset: 0 }) {
            this._gl.bindVertexArray(vao);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);

            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, mode);

            this._gl.enableVertexAttribArray(location);

            this._gl.vertexAttribPointer(location, ptr.size, ptr.type, ptr.normalize, ptr.stride, ptr.offset);
        }

        createSolidTex(color: number[]): WebGLTexture {
            let texture = this._gl.createTexture();

            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, 1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array(color));

            return texture;
        }

        loadImageTex(src: string, texParam: TexParameters = { mag: undefined, min: undefined, s: undefined, t: undefined }, imageProps: ImageProperties = { level: undefined, internalFormat: undefined, width: undefined, height: undefined, border: undefined, srcFormat: undefined, srcType: undefined }): WebGLTexture {
            let texture = this._gl.createTexture();
            let image = new Image();
            let gl = this._gl;
            let imageProp = imageProps;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0,
                        gl.RGBA,
                        1,
                        1,
                        0,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        new Uint8Array([128, 0, 128, 255]));

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParam.mag ? texParam.mag : gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParam.min ? texParam.min : gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParam.s ? texParam.s : gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParam.t ? texParam.t : gl.REPEAT);

            image.onload = function() {
               gl.bindTexture(gl.TEXTURE_2D, texture);
               gl.texImage2D(gl.TEXTURE_2D,
                            imageProp.level ? imageProp.level : 0,
                            imageProp.internalFormat ? imageProp.internalFormat : gl.RGBA,
                            imageProp.width ? imageProp.width : image.width,
                            imageProp.height ? imageProp.height : image.height,
                            imageProp.border ? imageProp.border : 0,
                            imageProp.srcFormat ? imageProp.srcFormat : gl.RGBA,
                            imageProp.srcType ? imageProp.srcType : gl.UNSIGNED_BYTE, image);
               gl.generateMipmap(gl.TEXTURE_2D);
            }

            image.src = src;

            return texture;
        }
    }    

    export class Camera extends Base { //Camera class to manage drawing Props from Stage onto Canvas.
        protected _type: string = "baseCamera"
        public back: string = "black"; //Declare and initialize background color property


        constructor(public stage: Stage, public canvas: Canvas, public stagePos: Coord = new Coord(0, 0), public canvasPos: Coord = new Coord(0, 0), public dimensions: Coord = new Coord(200, 100), public scale: Coord = new Coord(1, 1), public clip: boolean = true) {
            super();

            this.gl.clearColor(0, 0, 0, 0);
        }


        set width(width: number) { //Set width and height of this camera.
            this.dimensions[0] = width;
        }

        set height(height: number) {
            this.dimensions[1] = height;
        }


        get width(): number { //Get the width and height of this camera.
            return this.dimensions[0];
        }

        get height(): number {
            return this.dimensions[1];
        }


        get gl() { //Get the rendering context for this camera.
            return this.canvas.gl;
        }


        center(pos: Pair | number[]) { //Center this camera on a given position in the stage.
            this.stagePos.x = pos[0] - this.dimensions.x / 2;
            this.stagePos.y = pos[1] - this.dimensions.y / 2;
        }

        centerEx(x: number, y: number) { //Center this camera on a position given by two specific number coordinates on the stage.
            this.center([x, y]);
        }


        draw() {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.stage.props.forEach(prop => {
                let rel = Coord.add( //Find the prop's position relative to the top left of the canvas.
                            Coord.subtract(prop.pos.copy(), this.stagePos),
                          this.canvasPos);
                
                if (prop.draw(rel, this._type)) {
                    this.gl.useProgram(prop.view.program ? prop.view.program : this.canvas.defaultProgram);
                    
                    this.gl.bindVertexArray(prop.view.vao);

                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, ( prop.view.texture ? prop.view.texture : this.canvas.defaultTexture ));

                    this.gl.uniform1i(this.canvas.defaultUniformLocation.texture, 0);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.offset, prop.view.screenPos.x, prop.view.screenPos.y);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.scale, this.scale.x, this.scale.y);
                    this.gl.uniform2fv(this.canvas.defaultUniformLocation.rotation, prop.view.rotation);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.resolution, this.canvas.width, this.canvas.height);

                    this.gl.drawArrays(this.gl.TRIANGLES, 0, prop.view.meshLength / 2);
                }

                rel.remove();    
            });
        }
    }
}