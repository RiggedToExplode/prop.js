namespace $P {
    export class Canvas { //Canvas class to provide an integrated interface for <canvas> elements. 
        private _el: HTMLCanvasElement; //Initialize private property to store the DOM canvas element.
        private _gl: WebGL2RenderingContext; //The WebGL2 rendering context of this Canvas object's <canvas> element.
        public defaultTexture: WebGLTexture;
        

        constructor (private _id: string, width: number = 200, height: number = 100) {
            this._el = document.getElementById(_id) as HTMLCanvasElement; //Store the DOM-represented <canvas> element based on the _id parameter.
            this._gl = this._el.getContext("webgl2"); //Get the rendering context based on the _contextType parameter.

            this.defaultTexture = this.createSolidTex([0, 255, 0, 255]);

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


        get el(): HTMLCanvasElement { //Get the DOM representation of the <canvas> element.
            return this._el;
        }

        get gl() { //Get the rendering context
            return this._gl;
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

        createSolidTex(color: number[], texParam: {mag?: GLint, min?: GLint, s?: GLint, t?: GLint} = {mag: undefined, min: undefined, s: undefined, t: undefined}, level: number = 0): WebGLTexture {
            let texture = this.gl.createTexture();

            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(color));

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, texParam.mag ? texParam.mag : this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, texParam.min ? texParam.min : this.gl.NEAREST_MIPMAP_LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, texParam.s ? texParam.s : this.gl.REPEAT);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, texParam.t ? texParam.t : this.gl.REPEAT);

            return texture;
        }

        loadImageTex(src: string, texParam: {mag?: GLint, min?: GLint, s?: GLint, t?: GLint} = {mag: undefined, min: undefined, s: undefined, t: undefined}, level: number = 0, internalFormat: number = this.gl.RGBA, srcFormat: number = this.gl.RGBA, srcType: number = this.gl.UNSIGNED_BYTE): WebGLTexture {
            let texture = this.gl.createTexture();
            let image = new Image();
            let gl = this.gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 0, 128, 255]));

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParam.mag ? texParam.mag : gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParam.min ? texParam.min : gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParam.s ? texParam.s : gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParam.t ? texParam.t : gl.REPEAT);

            image.onload = function() {
               gl.bindTexture(gl.TEXTURE_2D, texture);
               gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
               gl.generateMipmap(gl.TEXTURE_2D);
            }

            image.src = src;

            return texture;
        }
    }    

    export class Camera extends Base { //Camera class to manage drawing Props from Stage onto Canvas.
        static shaderSource: {vertex: string, fragment: string} = {
            vertex: `#version 300 es //VERTEX SHADER
                in vec2 a_position; //Take a vec2 position value as input.
                in vec2 a_texCoord; //Take a vec2 for texture coordinates.

                uniform vec2 u_resolution; //Take the current Canvas width and height as a uniform.
                uniform vec2 u_rotation;
                uniform vec2 u_offset; //Take the offset from the top-left of the Canvas that the current Prop is being drawn at.

                out vec2 v_texCoord; //Pass texture coordinates to fragment shader.

                void main() { //Main loop
                    vec2 rotated = vec2(
                        a_position.x * u_rotation.y + a_position.y * u_rotation.x,
                        a_position.y * u_rotation.y - a_position.x * u_rotation.x
                    );
                    vec2 relToZero = rotated + u_offset; //Get the position of the current vertex relative to the top left of the canvas.
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

        static createShader(gl: WebGL2RenderingContext, type: number, source: string) { //WebGL2 shader creation method
            let shader = gl.createShader(type); //Create a WebGL2 shader
            gl.shaderSource(shader, source); //Set the source code of the shader
            gl.compileShader(shader); //Attempt to compile the shader

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { //If compilation succeeded
                return shader; //Return the shader
            }

            
            console.error(gl.getShaderInfoLog(shader)); //Otherwise print an error,
            gl.deleteShader(shader); //Delete the failed shader
            throw new Error("WebGL shader compile error!"); //And exit with an error.
        }

        static createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) { //WebGL2 program creation method
            var program = gl.createProgram(); //Create a WebGL2 program
            gl.attachShader(program, vertexShader); //Attach the provided vertex shader to the program
            gl.attachShader(program, fragmentShader); //Attach the provided fragment shader to the program
            gl.linkProgram(program); //Attempt to link the completed program to the WebGL2 context.

            if (gl.getProgramParameter(program, gl.LINK_STATUS)) { //If link was succesful
                return program; //Return the program.
            }

            console.error(gl.getProgramInfoLog(program)); //Otherwise print an error
            gl.deleteProgram(program); //Delete the failed program
            throw new Error("WebGL program attach error!"); //And exit with an error.
        }

        static bufferWrite(gl: WebGL2RenderingContext, buffer: WebGLBuffer, data: Float32Array, mode: number) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, mode);
        }

        private shaders: {vertex: WebGLShader, fragment: WebGLShader} = {vertex: undefined, fragment: undefined};
        private program: WebGLProgram;

        private attribLocation: {position: GLint, texCoord: GLint} = {position: undefined, texCoord: undefined};
        private uniformLocation: {resolution: WebGLUniformLocation, offset: WebGLUniformLocation, rotation: WebGLUniformLocation, texture: WebGLUniformLocation} = {resolution: undefined, offset: undefined, rotation: undefined, texture: undefined};

        private buffers: {position: WebGLBuffer, texCoord: WebGLBuffer} = {position: undefined, texCoord: undefined};

        private vertexArrayObject: WebGLVertexArrayObject;

        public back: string = "black"; //Declare and initialize background color property



        constructor(public stage: Stage, public canvas: Canvas, public stagePos: Coord = new Coord(0, 0), public canvasPos: Coord = new Coord(0, 0), public dimensions: Coord = new Coord(200, 100), public scale: Coord = new Coord(1, 1), public clip: boolean = true) {
            super();

            this.shaders.vertex = Camera.createShader(this.gl, this.gl.VERTEX_SHADER, Camera.shaderSource.vertex); //Create the vertex shader.
            this.shaders.fragment = Camera.createShader(this.gl, this.gl.FRAGMENT_SHADER, Camera.shaderSource.fragment); //Create the fragment shader.
            this.program = Camera.createProgram(this.gl, this.shaders.vertex, this.shaders.fragment); //Create the WebGL2 program

            this.attribLocation.position = this.gl.getAttribLocation(this.program, "a_position"); //Get location of position attribute.
            this.attribLocation.texCoord = this.gl.getAttribLocation(this.program, "a_texCoord"); //Get location of texture coordinate attribute.

            this.uniformLocation.resolution = this.gl.getUniformLocation(this.program, "u_resolution"); //Get location of resolution uniform.
            this.uniformLocation.offset = this.gl.getUniformLocation(this.program, "u_offset"); //Get location of offset uniform.
            this.uniformLocation.rotation = this.gl.getUniformLocation(this.program, "u_rotation");
            this.uniformLocation.texture = this.gl.getUniformLocation(this.program, "u_texture"); //Get location of texture uniform.

            this.buffers.position = this.gl.createBuffer(); //Create position buffer.
            this.buffers.texCoord = this.gl.createBuffer(); //Create texture buffer.
            
            this.vertexArrayObject = this.gl.createVertexArray(); //Create the vertex array.

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


        center(pos: number[]) { //Center this camera on a given position in the stage.
            this.stagePos.x = pos[0] - this.dimensions.x / 2;
            this.stagePos.y = pos[1] - this.dimensions.y / 2;
        }

        centerEx(x: number, y: number) { //Center this camera on a position given by two specific number coordinates on the stage.
            this.center([x, y]);
        }

        resize() { //Method to reset resolution uniform when canvas is resized.
            this.gl.uniform2f(this.uniformLocation.resolution, this.gl.canvas.width, this.gl.canvas.height);
        }


        draw() {
            this.gl.useProgram(this.program);

            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.stage.props.forEach(prop => {
                let rel = Coord.divide( //Find the prop's position relative to the top left of the canvas.
                              Coord.add(
                                  Coord.subtract(prop.pos.copy(), this.stagePos),
                              this.canvasPos),
                          this.scale);
                
                if (prop.draw(rel)) {
                    this.gl.bindVertexArray(this.vertexArrayObject);

                    this.gl.enableVertexAttribArray(this.attribLocation.position);
                    Camera.bufferWrite(this.gl, this.buffers.position, prop.view.triangles, this.gl.DYNAMIC_DRAW);
                    this.gl.vertexAttribPointer(
                        this.attribLocation.position,
                        2, //Size
                        this.gl.FLOAT, //Type
                        false, //Normalize
                        0, //Stride
                        0 //Offset
                    );

                    this.gl.enableVertexAttribArray(this.attribLocation.texCoord);
                    Camera.bufferWrite(this.gl, this.buffers.texCoord, prop.view.texTriangles, this.gl.DYNAMIC_DRAW);
                    this.gl.vertexAttribPointer(
                        this.attribLocation.texCoord,
                        2, //Size
                        this.gl.FLOAT, //Type
                        false, //Normalize
                        0, //Stride
                        0 //Offset
                    );

                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, ( prop.view.texture ? prop.view.texture : this.canvas.defaultTexture ));

                    this.gl.uniform1i(this.uniformLocation.texture, 0);
                    this.gl.uniform2f(this.uniformLocation.offset, prop.view.screenPos.x, prop.view.screenPos.y);
                    this.gl.uniform2fv(this.uniformLocation.rotation, prop.view.rotation);
                    this.gl.uniform2f(this.uniformLocation.resolution, this.canvas.width, this.canvas.height);

                    this.gl.drawArrays(this.gl.TRIANGLES, 0, prop.view.triangles.length / 2);
                }
                rel.remove();    
            });
        }
    }
}