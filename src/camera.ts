/*===========*\
|  CAMERA.TS  |
\*===========*/

/* SEE ALSO:
 *
 * base.ts for definition of Coord, Pair, and Base, which are all used
 *         occasionally in the Camera class.
 */

/* TODO
 *
 * - Make Camera use multiple texture slots with new Canvas texture methods above.
 * - Comments on interfaces?
 */

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

interface DataStore {
    vao: WebGLVertexArrayObject,
    buffers: WebGLBuffer[]
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
        
        private _loadedTextures: Map<WebGLTexture, number> = new Map(); //A Map storing associations between a loaded WebGLTexture and its number within WebGL.
        private _slotPtr: number = 0; //Pointer of slot for next loaded texture, provided there are no free slots.
        private _freeSlots: number[] = []; //Array of numbers representing freed texture slots.

        private _defaultProgram: WebGLProgram; //The default WebGL shader program to draw with.
        private _defaultTexture: WebGLTexture; //The default texture to use when drawing.
        private _defaultAttribLocation: AttribLocations = {position: undefined, texCoord: undefined}; //Stores the attribute locations for the Prop.js default WebGL inputs.
        private _defaultUniformLocation: UniformLocations = {resolution: undefined, offset: undefined, scale: undefined, rotation: undefined, texture: undefined}; //Stores the uniform locations for the Prop.js default WebGL uniforms.

        private _dataStores: Map<string, DataStore>; //A Map associating name strings with vertex array objects. (Useful for storing a class's drawing and mesh info for all of its children to use.)


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
            
            this._dataStores = new Map(); //Create the vertexArrays map.

            this._loadedTextures = new Map(); //Create the _loadedTextures map.

            this.width = width; //Set width and height of canvas based on parameters.
            this.height = height;
        }


        // GETTERS
        get id(): string { //Get the id of the <canvas> element this Canvas manages. Settable.
            return this._id;
        }

        get width(): number { //Get the width of the <canvas> element. Settable.
            return this._el.width;
        }

        get height(): number { //Get the height of the <canvas> element. Settable.
            return this._el.height;
        }

        get type(): string { //Get the type of this class. Unsettable.
            return "canvas";
        }

        get el(): HTMLCanvasElement { //Get the DOM representation of the <canvas> element this Canvas manages. Unsettable.
            return this._el;
        }

        get gl(): WebGL2RenderingContext { //Get the rendering context. Unsettable.
            return this._gl;
        }

        get defaultProgram(): WebGLProgram { //Get the framework-default WebGL2 shader program. Unsettable.
            return this._defaultProgram;
        }

        get defaultTexture(): WebGLTexture { //Get the framework-default texture. Unsettable.
            return this._defaultTexture;
        }

        get defaultAttribLocation(): AttribLocations { //Get the object containing the locations for the framework-default attributes. Unsettable.
            return this._defaultAttribLocation;
        }

        get defaultUniformLocation(): UniformLocations { //Get the object containing the locations for the framework-default uniforms. Unsettable.
            return this._defaultUniformLocation;
        }

        get loadedTextures(): Map<WebGLTexture, number> { //Get the map of loaded textures and their numbers. Unsettable.
            return this._loadedTextures;
        }


        // SETTERS
        set id(id: string) { //Set the element id of this Canvas, and in doing so reset the <canvas> element and rendering context. Gettable.
            this._id = id;
            this._el = document.getElementById(id) as HTMLCanvasElement;
            this._gl = this._el.getContext("webgl2");
        }

        set width(width: number) { //Set the width of the <canvas> element. Gettable.
            this._el.width = width;
        }

        set height(height: number) { //Set the height of the <canvas> element. Gettable.
            this._el.height = height;
        }
        

        // METHODS

        /* COMPILEPROGRAM METHOD
         * 
         * Parameters: vertex shader source code, fragment shader source code
         * 
         * The compileProgram method takes in two strings which represent the source code for the vertex and fragment shaders, respectively.
         * The method then creates, sets the source of, and attempts to compile both types of shaders. It checks the completion status once done,
         * and exits if an error occurs. It then attempts to attach the two compiled shaders to a program and link that program. If anything fails
         * there, the method exits.
         */
        compileProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
            let vertex = this._gl.createShader(this._gl.VERTEX_SHADER); //Create the vertex shader

            this._gl.shaderSource(vertex, vertexSource); //Set the source code for the vertex shader
            this._gl.compileShader(vertex); //Compile the vertex shader

            if (!this._gl.getShaderParameter(vertex, this._gl.COMPILE_STATUS)) { //Check for a failed status (error)
                console.error(this._gl.getShaderInfoLog(vertex)); //If failed, print the error
                this._gl.deleteShader(vertex); //Delete the failed shader
                throw new Error("WebGL shader compile error on vertex shader!"); //And exit with an error.
            }

            let fragment = this._gl.createShader(this._gl.FRAGMENT_SHADER); //Create the fragment shader

            this._gl.shaderSource(fragment, fragmentSource); //Set the source code for the fragment shader
            this._gl.compileShader(fragment); //Compile the fragment shader

            if (!this._gl.getShaderParameter(fragment, this._gl.COMPILE_STATUS)) { //Check for a failed status (error)
                console.error(this._gl.getShaderInfoLog(fragment)); //If failed, print the error
                this._gl.deleteShader(vertex); //Delete the vertex shader to cleanup
                this._gl.deleteShader(fragment); //Delete the failed shader
                throw new Error("WebGL shader compile error on fragment shader!"); //And exit with an error.
            }

            let program = this._gl.createProgram(); //Create the shader program.
            
            this._gl.attachShader(program, vertex); //Attach the vertex shader
            this._gl.attachShader(program, fragment); //Attach the fragment shader
            this._gl.linkProgram(program); //And link the program

            if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) { //If linking results in failed status (error)
                console.error(this._gl.getProgramInfoLog(program)); //If failed, print the error
                this._gl.deleteShader(vertex); //Cleanup the vertex shader from earlier
                this._gl.deleteShader(fragment); //Cleanup the fragment shader from earlier
                this._gl.deleteProgram(program); //Delete the failed program
                throw new Error("WebGL program linking error!"); //And exit with an error.
            }

            return program; //If nothing failed, return the completed shader program.
        }

        /* ASSIGNDATASTORE METHOD
         *
         * Parameters: string at which to store DataStore
         * 
         * The assignDataStore method will assign the provided DataStore to the provided name in the 
         * _dataStores map. If no DataStore is provided, the method will create a new one and assign it
         * to the provided name.
         */
        assignDataStore(str: string, dataStore: DataStore = undefined): DataStore {
            let out = dataStore;

            if (!out) {
                out = {vao: this._gl.createVertexArray(), buffers: []}
            }

            this._dataStores.set(str, out);

            return out;
        }
        
        /* GETDATASTORE METHOD
         *
         * Parameters: name of DataStore to get
         * 
         * The getDataStore method returns the DataStore under the provided name in the _dataStores
         * map.
         */
        getDataStore(name: string): DataStore {
            return this._dataStores.get(name);
        }

        /* VERTEXARRAYBIND METHOD
         * 
         * Parameters: vertexArray to bind buffer in, buffer to bind, location to bind to, pointer info
         * 
         * The vertexArrayBind method will bind the provided buffer to the specified vertexArray at the specified
         * location.
         */
        vertexArrayBind(vao: WebGLVertexArrayObject, buffer: WebGLBuffer, location: GLint, ptr: VertexPointer = { size: 2, type: this._gl.FLOAT, normalize: false, stride: 0, offset: 0 }) {
            this._gl.bindVertexArray(vao); //Bind the specified vertexArrayObject
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer); //Bind the specified buffer

            this._gl.enableVertexAttribArray(location); //Enable the vertex array.

            this._gl.vertexAttribPointer(location, ptr.size, ptr.type, ptr.normalize, ptr.stride, ptr.offset); //Set all the pointer info.
        }

        /* BUFFERWRITE METHOD
         *
         * Parameters: buffer to write to, data to write, writing mode
         * 
         * The bufferWrite method will write the specified data to the specified buffer, using the specified
         * GL mode.
         */

        bufferWrite(buffer: WebGLBuffer, data: Float32Array, mode: GLint = this._gl.STATIC_DRAW) {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);

            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, mode);
        }

        /* PRELOADDEFAULTS METHOD
         *
         * Parameters: MeshInfo object containing framework-default assortment of meshes, OR array of said objects
         * 
         * The preloadDefaults method takes a MeshInfo object or an array of MeshInfo objects. For each object provided,
         * the method writes all meshes (arrays of points) that the framework handles by default (position and texture coordinates)
         * to a new vertexArrayObject, which is in turn stored in the vertexArrays map under the string provided in the `name` property
         * of the MeshInfo object.
         */
        loadDefaultMeshes(input: MeshInfo | MeshInfo[]) {
            if (Array.isArray(input)) { //If input is array
                input.forEach(meshes => { //For each object in array
                    let dataStore = this.assignDataStore(meshes.name); //Create and assign a new dataStore with the name of this object

                    dataStore.buffers[0] = this._gl.createBuffer(); //Create the two buffers we will use
                    dataStore.buffers[1] = this._gl.createBuffer();

                    this.vertexArrayBind(dataStore.vao, //Bind the position buffer to the vertex array object in the DataStore
                            dataStore.buffers[0],
                            this.defaultAttribLocation.position);
                    this.vertexArrayBind(dataStore.vao, //Bind the texCoord buffer to the vertex array object in the DataStore
                            dataStore.buffers[1],
                            this.defaultAttribLocation.texCoord);
                    
                    this.bufferWrite(dataStore.buffers[0], meshes.triangles); //Write the triangles mesh to the position buffer.
                    this.bufferWrite(dataStore.buffers[1], meshes.texTriangles); //Write the texTriangles mesh to the texCoord buffer.
                });
            } else { //If input is single object
                let dataStore = this.assignDataStore(input.name); //Create and assign a new dataStore with the name of this object

                dataStore.buffers[0] = this._gl.createBuffer();
                dataStore.buffers[1] = this._gl.createBuffer();

                this.vertexArrayBind(dataStore.vao, //Write the position data using the defaults for position
                        dataStore.buffers[0],
                        this.defaultAttribLocation.position);
                this.vertexArrayBind(dataStore.vao, //Write the texture coordinate data using the defaults for texture coordinates
                        dataStore.buffers[1],
                        this.defaultAttribLocation.texCoord);
                
                this.bufferWrite(dataStore.buffers[0], input.triangles); //Write the triangles mesh to the position buffer.
                this.bufferWrite(dataStore.buffers[1], input.texTriangles); //Write the texTriangles mesh to the texCoord buffer.
            }
        }

        /* CREATESOLIDTEX METHOD
         * 
         * Parameters: array of length 3 containing red, green, and blue values.
         * 
         * The createSolidTex method creates a WebGL texture and writes one pixel of the provided color to the texture.
         * It then returns the texture.
         */
        createSolidTex(color: number[]): WebGLTexture {
            let texture = this._gl.createTexture(); //Create the texture.

            this._gl.bindTexture(this._gl.TEXTURE_2D, texture); //Bind the current texture to work on it.
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, 1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, new Uint8Array(color)); //Write one pixel of color.

            return texture; //Return the texture.
        }

        /* CREATEIMAGETEX METHOD
         *
         * Parameters: image source, texture parameters object, image properties object
         * 
         * The createImageTex method takes a provided image source and turns it into a WebGL texture, using the provided texture parameters and image properties
         * where provided. It then returns the texture.
         */
        createImageTex(src: string, texParam: TexParameters = { mag: undefined, min: undefined, s: undefined, t: undefined }, imageProps: ImageProperties = { level: undefined, internalFormat: undefined, width: undefined, height: undefined, border: undefined, srcFormat: undefined, srcType: undefined }): WebGLTexture {
            let texture = this._gl.createTexture(); //Create the texture
            let image = new Image(); //Create the image
            let gl = this._gl; //MESSY!!! Create a local-scope reference to this._gl so that it can be accessed from inside image.onload
            let imageProp = imageProps; //ALSO MESSY!! Another local-scope reassignment so that imageProps can be accessed inside image.onload

            gl.bindTexture(gl.TEXTURE_2D, texture); //Bind the texture as the current working texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, //Write a default solid color to the texture so it can render before the image loads.
                        gl.RGBA,
                        1,
                        1,
                        0,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        new Uint8Array([128, 0, 128, 255]));

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParam.mag ? texParam.mag : gl.LINEAR); //Set the texture parameters if provided, otherwise use defaults.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParam.min ? texParam.min : gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParam.s ? texParam.s : gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParam.t ? texParam.t : gl.REPEAT);

            image.onload = function() { //Define function to run when image is fully loaded
               gl.bindTexture(gl.TEXTURE_2D, texture); //Bind the texture again (in case current working texture has changed).
               gl.texImage2D(gl.TEXTURE_2D, //Write the image data to the texture, using image properties where provided and defaults otherwise.
                            imageProp.level ? imageProp.level : 0,
                            imageProp.internalFormat ? imageProp.internalFormat : gl.RGBA,
                            imageProp.width ? imageProp.width : image.width,
                            imageProp.height ? imageProp.height : image.height,
                            imageProp.border ? imageProp.border : 0,
                            imageProp.srcFormat ? imageProp.srcFormat : gl.RGBA,
                            imageProp.srcType ? imageProp.srcType : gl.UNSIGNED_BYTE, image);
               gl.generateMipmap(gl.TEXTURE_2D); //Generate the mipmaps for the image.
            }

            image.src = src; //Set the image object's source to that provided. Sets events in motion to eventually call image.onload above once image is loaded from the source.

            return texture; //Return the texture (does not contain image at first!)
        }

        /* LOADTEXTURE METHOD
         *
         * Parameters: texture to load
         * 
         * The loadTexture method loads the specified texture into WebGL, using a texture slot which is determined by grabbing
         * the most recently freed texture slot, or the next texture slot available if none are free. If the next texture slot
         * in line is past the computer's texture capacity and no free slots are available, this method resets to the start and
         * is forced to clear the loaded textures.
         * 
         * If the specified texture is already loaded, this method just returns the texture's slot.
         */
        loadTexture(texture: WebGLTexture): number {
            if (this._loadedTextures.has(texture)) { //If the texture is already loaded
                return this.getTextureSlot(texture); //Return the slot
            }

            let slot: number; //Declare slot variable

            if (this._freeSlots[0] !== undefined) { //If freed slots exist
                slot = this._freeSlots.pop(); //Use most recent freed slot
            } else { //Otherwise use next slot in line
                if (this._loadedTextures.size >= this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) { //But, if we have loaded the maximum number of textures
                    console.log("TEXTURE OVERFLOW; all loaded textures reset"); //Notify user about texture overflow, as this isn't a preferred scenario.
                    this._loadedTextures = new Map(); //Clear the loaded textures map
                    this._freeSlots = []; //Reset all free slots
                    this._slotPtr = 0; //Set the slot pointer back to 0
                }

                slot = this._slotPtr; //Resort to next slot on list.

                this._slotPtr++; //Increment the slot pointer.
            }

            this.gl.activeTexture(this.gl.TEXTURE0 + slot); //Set the active texture to the chosen slot.
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture); //Bind the texture to the activated slot.
            this._loadedTextures.set(texture, slot); //Store the texture's slot in the _loadedTextures map.

            return slot; //Return the slot the texture has been loaded in.
        }

        /* GETSLOT METHOD
         *
         * Parameters: texture to get slot of
         * 
         * The getSlot method returns the texture slot that the specified texture is loaded at, according to the _loadedTextures map.
         */
        getTextureSlot(texture: WebGLTexture): number {
            return this._loadedTextures.get(texture);
        }

        /* FREETEXTURE METHOD
         *
         * Parameters: texture to free up the slot of
         * 
         * The freeTexture method removes a texture from the _loadedTextures map and adds its slot to the _freeSlots array, signifying that 
         * the texture is no longer guaranteed to be loaded in any slot, and allowing its previous slot to be used for loading of a new 
         * texture.
         */
        freeTexture(texture: WebGLTexture): number {
            let slot = this.getTextureSlot(texture); //Get slot of specified texture.

            this._freeSlots.push(slot); //Add the slot to array of free slots.
            
            return slot; //Return the freed slot.
        }
    }    

    /* CAMERA CLASS
     *
     * The Camera class manages execution of the draw loop. It does this by taking a Stage object and drawing all of the Props on that stage.
     * This is done by turning each Prop's stage position into a position relative to the canvas. Then the Camera passes this value into the
     * Prop's draw hook. Each Prop's draw method can vary wildly, but the Camera concerns itself with one thing: if the Prop's draw method
     * returns true, it means that the Prop would like the Camera to continue drawing in the default fashion.
     * 
     * This setup allows each Prop to define its own complicated method of drawing within its draw method, or to leave the drawing up 
     * to the framework's default procedures.
     */
    export class Camera extends Base {
        // PROPERTIES
        protected _type: string = "baseCamera" //The type of this class.

        protected _back: number[] = [0, 0, 0, 0]; //The background color this camera will draw with.


        /* CONSTRUCTOR
         *
         * Parameters: the stage to draw from, the canvas to draw on, the position on the stage that the bottom left of the camera sits, the bottom left of the camera's 
         *     drawing bounds on the canvas, the dimensions of the camera on the canvas, how much the camera scales the image before drawing, whether or not to clip the output
         */
        constructor(public stage: Stage, public canvas: Canvas, public stagePos: Coord = new Coord(0, 0), public canvasPos: Coord = new Coord(0, 0), public dimensions: Coord = new Coord(200, 100), public scale: Coord = new Coord(1, 1), public clip: boolean = true) {
            super(); //Call Base constructor

            this.gl.clearColor(this._back[0], this._back[1], this._back[2], this._back[3]); //Set clearColor to default background color.
        }


        // GETTERS
        get gl() { //Get the rendering context of the canvas this camera is drawing on. Unsettable.
            return this.canvas.gl;
        }

        get width(): number { //Get the width of this camera. Settable.
            return this.dimensions[0];
        }

        get height(): number { //Get the height of this camera. Settable.
            return this.dimensions[1];
        }

        get back(): number[] { //Get the background color this Camera will clear with. Settable.
            return this._back;
        }


        // SETTERS
        set width(width: number) { //Set width of this camera. Gettable.
            this.dimensions[0] = width;
        }

        set height(height: number) { //Set height of this camera. Gettable.
            this.dimensions[1] = height;
        }

        set back(arr: number[]) { //Set the background clear color of this Camera and communicate the change to WebGL. Gettable.
            this.back = arr;
            this.gl.clearColor(arr[0], arr[1], arr[2], arr[3]);
        }


        // METHODS
        /* CENTER METHOD
         * 
         * Parameters: Pair or array of length 2 describing point to center on.
         * 
         * The center method sets the Camera's stagePos property in order to center the Camera on the
         * provided point on the stage.
         */
        center(pos: Pair | number[]) {
            this.stagePos.x = pos[0] - this.dimensions.x / 2;
            this.stagePos.y = pos[1] - this.dimensions.y / 2;
        }
        
        /* CENTEREX METHOD
         *
         * Parameters: x coordinate of point to center on, y coordinate of point to center on
         * 
         * Same as center method, but x and y coordinates are split up. Unnecessary?
         */
        centerEx(x: number, y: number) {
            this.center([x, y]);
        }

        /* RESIZE METHOD
         *
         * Parameters: Pair or array of length 2 describing desired width and height of the camera.
         * 
         * The resize method sets the width and height of the Camera on the Canvas to the provided values at once.
         */
        resize(dimensions: Pair | number[]) {
            this.dimensions.set(dimensions[0], dimensions[1]);
        }

        /* DRAW METHOD
         *
         * Parameters: None
         * 
         * The Camera's draw method should be called once per frame. The draw method starts by setting the viewport of the rendering
         * context, and enables scissoring (or clipping) of the context. It then clears the previous frame. After that, the draw method
         * iterates through every Prop in the Camera's Stage, and calls that Prop's draw method, passing in the position of the Prop on the 
         * canvas as calculated using its stage position and the Camera's other settings (stagePos, canvasPos, and scale), as well as the canvas
         * the Camera is drawing on and the type of the Camera. The Prop can use any of this information as desired inside its own draw method.
         * The Prop could decide to go about drawing itself, and return false. If the draw method returns true, however, the Camera will draw 
         * the Prop in a "standard" procedure.
         */
        draw() {
            this.gl.viewport(this.canvasPos.x, this.canvasPos.y, this.dimensions.x, this.dimensions.y); //Set the viewport

            this.gl.enable(this.gl.SCISSOR_TEST); //Enable scissoring
            this.gl.scissor(this.canvasPos.x, this.canvasPos.y, this.dimensions.x, this.dimensions.y); //Set the scissoring dimensions

            this.gl.clear(this.gl.COLOR_BUFFER_BIT); //Clear the viewport

            this.stage.props.forEach(prop => { //For each prop
                let rel = Coord.subtract(Coord.multiply(prop.pos.copy(), this.scale), this.stagePos); //Calculate Prop's position on the canvas
                
                if (prop.draw(rel, this)) { //Call Prop's draw method, continue if returns true
                    let program = (prop.renderInfo.program) ? prop.renderInfo.program : this.canvas.defaultProgram;
                    let vao = (prop.renderInfo.vao) ? prop.renderInfo.vao : this.canvas.getDataStore(prop.type).vao;
                    let meshLength = prop.renderInfo.meshLength;
                    let texture = (prop.renderInfo.texture) ? prop.renderInfo.texture : this.canvas.defaultTexture;
                    let screenPos = (prop.renderInfo.screenPos) ? prop.renderInfo.screenPos : rel;
                    let rotation = (prop.renderInfo.rotation) ? prop.renderInfo.rotation : [Math.sin(prop.radians), Math.cos(prop.radians)];

                    this.gl.useProgram(program); //Use Prop's preferred shader program or default shader program.
                    
                    this.gl.bindVertexArray(vao); //Use the Prop's chosen vertexArrayObject (expected to contain mesh info)

                    let slot = this.canvas.loadTexture(texture); //Get texture slot from Canvas (Canvas will load texture if not already)
                    this.gl.activeTexture(this.gl.TEXTURE0 + slot); //Activate the texture slot

                    this.gl.uniform1i(this.canvas.defaultUniformLocation.texture, slot); //Pass in the current texture slot to WebGL
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.offset, screenPos.x, screenPos.y);
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.scale, this.scale.x, this.scale.y); //Pass in the Camera's scale setting
                    this.gl.uniform2fv(this.canvas.defaultUniformLocation.rotation, rotation); //Pass in the Prop's rotation
                    this.gl.uniform2f(this.canvas.defaultUniformLocation.resolution, this.dimensions.x, this.dimensions.y); //Pass in the Camera's output resolution

                    this.gl.drawArrays(this.gl.TRIANGLES, 0, meshLength / 2); //Call the BIG WebGL function to execute our shader program. Magic happens here!!
                }

                rel.remove(); //Deallocate the Coord storing our Prop's canvas position.
            });
        }
    }
}