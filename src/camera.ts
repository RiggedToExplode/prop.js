/*===========*\
|  CAMERA.TS  |
\*===========*/

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

interface MeshInfo {
    name: string,
    triangles: Float32Array,
    texTriangles: Float32Array
}

namespace $P {
    /* CANVAS CLASS
     * 
     * Canvas class interfaces with the actual HTML <canvas> element and manages the WebGL context that will be used
     * to draw on that element.
     */
    export class Canvas {

        // STATIC PROPERTIES
        static defaultShaderSource: {vertex: string, fragment: string} = { //Stores the source code for the default Prop.js shader program. Split into vertex and fragment source.
            vertex: `#version 300 es //VERTEX SHADER
                in vec2 a_position; //Take a vec2 position value as input.
                in vec2 a_texCoord; //Take a vec2 for texture coordinates.

                uniform vec2 u_resolution; //Take the current Canvas width and height as a uniform.
                uniform vec2 u_rotation; //Take rotation as a uniform.
                uniform vec2 u_scale; //Take scale as a uniform.
                uniform vec2 u_offset; //Take the offset from the bottom-left of the Canvas that the current Prop is being drawn at.

                out vec2 v_texCoord; //Pass texture coordinates to fragment shader.

                void main() { //Main loop
                    vec2 scaled = a_position * u_scale; //Scale position value based on u_scale.
                    vec2 rotated = vec2( //Rotate the scaled position with u_rotation.
                        scaled.x * u_rotation.y + scaled.y * u_rotation.x,
                        scaled.y * u_rotation.y - scaled.x * u_rotation.x
                    );
                    vec2 toZero = rotated + u_offset; //Turn the rotated position into WebGL canvas coordinates using u_offset.
                    vec2 zeroToOne = toZero / u_resolution; //Turn position into a position between 0 and 1, using u_resolution.
                    vec2 zeroToTwo = zeroToOne * 2.0; //Convert 0 to 1 to 0 to 2
                    vec2 clipSpace = zeroToTwo - 1.0; //Convert 0 to 2 to -1 to 1 clip space coordinates.

                    gl_Position = vec4(clipSpace, 0, 1); //Send the clip space position to the fragment shader.
                    v_texCoord = a_texCoord; //Pass the texture coordinate through.
                }`,
            fragment: `#version 300 es //FRAGMENT SHADER
                precision highp float;

                in vec2 v_texCoord; //Take in the texture coordinate varying.
                
                uniform sampler2D u_texture; //Take in the texture uniform.

                out vec4 outColor; //Declare the output color.

                void main() {
                    outColor = texture(u_texture, v_texCoord); //Return the output color by grabbing from the texture uniform.
                }`
        }
        
        // PROPERTIES
        private _type: string = "canvas"; //The type of this class.
        
        private _el: HTMLCanvasElement; //The canvas element this object deals with.
        private _gl: WebGL2RenderingContext; //The WebGL2 rendering context being used to draw.
        
        private _loadedTextures: Map<WebGLTexture, number>; //A Map storing associations between a loaded WebGLTexture and its number within WebGL.

        private _defaultProgram: WebGLProgram; //The default WebGL shader program to draw with.
        private _defaultTexture: WebGLTexture; //The default texture to use when drawing.
        private _defaultAttribLocation: AttribLocations = {position: undefined, texCoord: undefined}; //Stores the attribute locations for the Prop.js default WebGL inputs.
        private _defaultUniformLocation: UniformLocations = {resolution: undefined, offset: undefined, scale: undefined, rotation: undefined, texture: undefined}; //Stores the uniform locations for the Prop.js default WebGL uniforms.
        private _defaultBuffer: Buffers = {position: undefined, texCoord: undefined}; //Stores the Prop.js default WebGL buffers.

        public vertexArrays: Map<string, WebGLVertexArrayObject>; //A Map associating name strings with vertex array objects. (Useful for storing a class's drawing and mesh info for all of its children to use.)


        /* CONSTRUCTOR
         * 
         * Parameters: _id of HTML <canvas> element to manage, desired width of the canvas, desired height of the canvas.
         * 
         * Gets and stores the <canvas> element to manage using _id, and then generates a WebGL2 context from that. This
         * constructor also creates a default (green) texture and compiles the default shader program. This constructor then
         * stores all of the information needed to pass the default meshes and data into WebGL (attribute and uniform locations, buffers).
         */
        constructor (private _id: string, width: number = 200, height: number = 100) {
            this._el = document.getElementById(_id) as HTMLCanvasElement; //Store the DOM-represented <canvas> element by fetching it with _id.
            this._gl = this._el.getContext("webgl2"); //Create the WebGL2 rendering context.

            this._defaultTexture = this.createSolidTex([0, 255, 0, 255]); //Create the default, flat green texture.
            this._defaultProgram = this.compileProgram(Canvas.defaultShaderSource.vertex, Canvas.defaultShaderSource.fragment); //Create the default WebGL2 shader program.

            this._defaultAttribLocation.position = this._gl.getAttribLocation(this._defaultProgram, "a_position"); //Store location of position attribute.
            this._defaultAttribLocation.texCoord = this._gl.getAttribLocation(this._defaultProgram, "a_texCoord"); //Store location of texture coordinate attribute.
            
            this._defaultUniformLocation.resolution = this._gl.getUniformLocation(this._defaultProgram, "u_resolution"); //Store location of resolution uniform.
            this._defaultUniformLocation.offset = this._gl.getUniformLocation(this._defaultProgram, "u_offset"); //Store location of offset uniform.
            this._defaultUniformLocation.scale = this._gl.getUniformLocation(this._defaultProgram, "u_scale"); //Store location of scale uniform.
            this._defaultUniformLocation.rotation = this._gl.getUniformLocation(this._defaultProgram, "u_rotation"); //Store location of rotation uniform.
            this._defaultUniformLocation.texture = this._gl.getUniformLocation(this._defaultProgram, "u_texture"); //Store location of texture uniform.

            this._defaultBuffer.position = this._gl.createBuffer(); //Create the position buffer.
            this._defaultBuffer.texCoord = this._gl.createBuffer(); //Create the texCoord buffer.
            
            this.vertexArrays = new Map(); //Create the vertexArrays map.

            this._loadedTextures = new Map(); //Create the _loadedTextures map.

            this.width = width; //Set width and height of canvas based on parameters.
            this.height = height;
        }


        // GETTERS
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

        get loadedTextures(): Map<WebGLTexture, number> {
            return this._loadedTextures;
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


        // SETTERS
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
        

        // METHODS
        compileProgram(vertexSource: string, fragmentSource: string) {
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


        assignVertexArray(str: string) {
            this.vertexArrays.set(str, this._gl.createVertexArray());
        }

        getVertexArray(name: string) {
            return this.vertexArrays[name];
        }

        vertexArrayWrite(vao: WebGLVertexArrayObject, buffer: WebGLBuffer, location: GLint, data: Float32Array, mode: GLint = this._gl.DYNAMIC_DRAW, ptr: VertexPointer = { size: 2, type: this._gl.FLOAT, normalize: false, stride: 0, offset: 0 }) {
            this._gl.bindVertexArray(vao);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);

            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, mode);

            this._gl.enableVertexAttribArray(location);

            this._gl.vertexAttribPointer(location, ptr.size, ptr.type, ptr.normalize, ptr.stride, ptr.offset);
        }

        preloadDefaults(input: MeshInfo | MeshInfo[]) {
            if (Array.isArray(input)) {
                input.forEach(meshes => {
                    this.assignVertexArray(meshes.name);

                    this.vertexArrayWrite(this.getVertexArray(meshes.name),
                            this.defaultBuffer.position,
                            this.defaultAttribLocation.position, 
                            meshes.triangles);
                    this.vertexArrayWrite(this.getVertexArray(meshes.name),
                            this.defaultBuffer.texCoord,
                            this.defaultAttribLocation.texCoord,
                            meshes.texTriangles);
                });
            } else {
                this.assignVertexArray(input.name);

                this.vertexArrayWrite(this.getVertexArray(input.name),
                        this.defaultBuffer.position,
                        this.defaultAttribLocation.position, 
                        input.triangles);
                this.vertexArrayWrite(this.getVertexArray(input.name),
                        this.defaultBuffer.texCoord,
                        this.defaultAttribLocation.texCoord,
                        input.texTriangles);
            }
        }


        createSolidTex(color: number[]): WebGLTexture {
            let texture = this._gl.createTexture();

            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, 1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array(color));

            return texture;
        }

        createImageTex(src: string, texParam: TexParameters = { mag: undefined, min: undefined, s: undefined, t: undefined }, imageProps: ImageProperties = { level: undefined, internalFormat: undefined, width: undefined, height: undefined, border: undefined, srcFormat: undefined, srcType: undefined }): WebGLTexture {
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

        resize(dimensions: Pair | number[]) {
            this.dimensions.set(dimensions[0], dimensions[1]);
        }


        draw() {
            this.gl.viewport(this.canvasPos.x, this.canvasPos.y, this.dimensions.x, this.dimensions.y);

            this.gl.enable(this.gl.SCISSOR_TEST);
            this.gl.scissor(this.canvasPos.x, this.canvasPos.y, this.dimensions.x, this.dimensions.y);

            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.stage.props.forEach(prop => {
                let rel = Coord.subtract(Coord.multiply(prop.pos.copy(), this.scale), this.stagePos);
                
                if (prop.draw(rel, this.canvas, this._type)) {
                    this.gl.useProgram(prop.view.program);
                    
                    this.gl.bindVertexArray(prop.view.vao);

                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, prop.view.texture);

                    this.gl.uniform1i(this.canvas.defaultUniformLocation.texture, 0);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.offset, prop.view.screenPos.x, prop.view.screenPos.y);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.scale, this.scale.x, this.scale.y);
                    this.gl.uniform2fv(this.canvas.defaultUniformLocation.rotation, prop.view.rotation);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.resolution, this.dimensions.x, this.dimensions.y);

                    this.gl.drawArrays(this.gl.TRIANGLES, 0, prop.view.meshLength / 2);
                }

                rel.remove();    
            });
        }
    }
}