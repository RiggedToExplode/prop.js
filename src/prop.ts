namespace $P { //$P being the namespace for Prop.js:
    export class MemoryManager { //Wrapper class for WebAssembly.Memory object, provides a TypedArray interface with "memory management".
        public arr: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array; //Declare TypedArray interface
        protected target: number = 0; //Declare location pointer for any new written values.
        protected free: number[] = []; //Array of free memory locations to write to.

        constructor(protected memory: WebAssembly.Memory, arrayType: string = "Float32Array") {
            switch (arrayType) { //Initialize arr based on data type provided as parameter.
                case "Int8Array":
                    this.arr = new Int8Array(this.memory.buffer);
                break;
                case "Int16Array":
                    this.arr = new Int16Array(this.memory.buffer);
                break;
                case "Int32Array":
                    this.arr = new Int32Array(this.memory.buffer);
                break;
                case "Uint8Array":
                    this.arr = new Uint8Array(this.memory.buffer);
                break;
                case "Uint16Array":
                    this.arr = new Uint16Array(this.memory.buffer);
                break;
                case "Uint32Array":
                    this.arr = new Uint32Array(this.memory.buffer);
                break;
                case "Uint8ClampedArray":
                    this.arr = new Uint8ClampedArray(this.memory.buffer);
                break;
                case "Float32Array":
                    this.arr = new Float32Array(this.memory.buffer);
                break;
                case "Float64Array":
                    this.arr = new Float64Array(this.memory.buffer);
                break;
                default:
                    console.error("TypedArray type '" + arrayType + "' not recognized while constructing AssemblyMemory buffer!");
                break;
            }
        }

        write(val: number, loc: number = undefined) { //Write a value to the buffer via this.arr TypedArray
            if (loc !== undefined) { //If a location is provided, write there.
                this.arr[loc] = val;

                return loc;
            } else { //Otherwise use automatic allocation.
                if (this.free[0] !== undefined) { //If there are any free memory locations
                   let out = this.free.pop(); //Get the last free location and remove it

                   this.arr[out] = val; //Write to the free location

                   return out; //Return the location where written
                } else { //Otherwise, resort to the target pointer to write at end of array.
                    let out = this.target;

                    this.arr[out] = val; //Write at the end of the array.

                    this.target++; //Increment the pointer for next time we need it.

                    if (this.target >= this.arr.length) { //If target exceeds length of this.arr
                        this.memory.grow(1); //Grow the buffer by 1 page (64kB) and thus extend the array.
                        this.arr = new Float32Array(this.memory.buffer);
                    }

                    return out; //Return the location where written.
                }
            }
        }
        
        query(loc: number) { //Get a value from the this.arr
            return this.arr[loc];
        }

        remove(loc: number) { //Free up a location in this.arr
            this.free.push(loc); //Add location to free array to signify writabililty. Value isn't actually affected until write() uses this free location.
        }
    }

    export class BlockMemoryManager extends MemoryManager{ //AssemblyMemory, but meant to manage "blocks" (or arrays) of specified blockSize (length) at a time.
        constructor(memory: WebAssembly.Memory, arrayType: string = "Float32Array", private blockSize: number = 2 /* length pf each block */) {
            super(memory, arrayType);
        }

        write(val: number, loc: number = undefined): number { //Write a single value; only works if location is provided.
            if (loc !== undefined) { //If location is provided, write there.
                this.arr[loc] = val;
                
                return loc;
            } else { //Otherwise throw an error because AssemblyBlockMemory cannot manage single values.
                throw new Error("Cannot automatically allocate new values in AssemblyBlockMemory! Try using writeArr instead.");
            }
        }

        writeBlock(val: number[], loc: number = undefined) { //Write a block of values.
            val.length = this.blockSize; //Truncate or extend val parameter to the correct length.

            if (loc !== undefined) { //If a location is provided
                this.arr.set(val, loc); //Write the block there.

                return loc;
            } else { //Otherwise
                if (this.free[0] !== undefined) { //If there are free locations (free array stores first location in block)
                    let out = this.free.pop(); //Get & remove the last one

                    this.arr.set(val, out); //Write the block to the free location

                    return out; //Return the location of the first value written.
                } else { //Otherwise resort to target pointer
                    let out = this.target;

                    this.arr.set(val, out); //Write block at target pointer

                    this.target += this.blockSize; //Increment target pointer by the size of a block

                    if (this.target >= this.arr.length) { //If target pointer exceeds this.arr length
                        this.memory.grow(1); //Grow the buffer by 1 page (64kB), thus extending this.arr
                        this.arr = new Float32Array(this.memory.buffer);
                    }

                    return out; //Return the location written (the location of the first value).
                }
            }
        }

        remove(loc: number): number { //Method to overwrite inherited remove() method, as AssemblyBlockMemory cannot handle removing single values.
            throw new Error("Cannot remove singular value in AssemblyBlockMemory! Try removeArr instead.");
        }

        removeBlock(loc: number) { //Free up a block of values.
            this.free.push(loc); //Add the first location to the this.free array, thus signifying that the entire block is free.
        }
    }

    export class AssemblyModule { //Wrapper class for WebAssembly modules, handles loading via init() method.
        private _exports: any; //Declare exports array of exposed functions from WebAssembly
        private _module: any; //Declare WebAssembly module property.

        constructor(public src: string) { //Store src string and AssemblyMemory that this module will use.

        }

        async init(memory: WebAssembly.Memory): Promise<any> { //Initialize this module by loading, compiling, and instantiating source.
            let obj = await fetch(this.src) //Fetch the source code,
                           .then(response => //then
                               response.arrayBuffer() //Feed the source code into an array buffer,
                           )
                           .then(bytes => { //then
                               return WebAssembly.instantiate(bytes, {js: {mem: memory}}); //Compile & instantiate the module from the source code and given AssemblyMemory.
                           });
                
            this._module = obj.module; //Set the module property.
            this._exports = obj.instance.exports; //Set the array of exported functions! We get to use these! :)
        }

        get exports(): any { //Get exported functions publicly, as to keep from editing or overwriting them.
            return this._exports;
        }

        get memory(): WebAssembly.Memory {
            return this._exports.memory;
        }

        get module(): any { //Get module publicly, as to keep from editing it.
            return this._module;
        }
    }

    export var coreMemoryManager: BlockMemoryManager = undefined; //Declare the AssemblyBlockMemory that will be used for Prop.js' core functionalities.

    export const coreModule: AssemblyModule = undefined; //Declare the AssemblyModule that holds the WebAssembly parts of Prop.js

    export async function init(src: string = "prop.wasm", arrayType: string = undefined, pagesInitial: number = 1, pagesMax: number = 256) { //Init the framework with either default values or stand-ins.
        this.coreModule = new AssemblyModule(src); //Create the module for all our WebAssembly.

        await this.coreModule.init(new WebAssembly.Memory({initial: pagesInitial, maximum: pagesMax})); //Init the module (load source code & compile).

        this.coreMemoryManager = new BlockMemoryManager(this.coreModule.exports.memory, arrayType, 2); //Create the memory managerwe will use.
    }



    export class Base { //Base class for nearly everything to inherit from; provides unique IDs
        static genUID(): string { //Static method to generate unique ID based on epoch millis and a random number.
            return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
        }


        private _uid: string; //Initialize private _uid string.

        constructor() { this._uid = Base.genUID(); } //Set _uid string to unique id.


        get uid(): string { //Get _uid as public string.
            return this._uid;
        }
    }

    export class Coord { //Class to store two-dimensional coordinate values and manipulate them with WebAssembly.
        static addCoords(coord1: Coord, coord2: Coord) { //Add two two Coords together and store the result in the first Coord.
            coreModule.exports.addCoords(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static subCoords(coord1: Coord, coord2: Coord) { //Subtract second Coord from first Coord and store the result in the first Coord.
            coreModule.exports.subCoords(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static multCoord(coord: Coord, factor: number) { //Multiply the Coord by factor, storing the result in the Coord.
            coreModule.exports.multCoord(coord.ptr, factor);
            return coord;
        }

        static multCoords(coord1: Coord, coord2: Coord) { //Multiply two Coords by each other, storing the result in the first Coord.
            coreModule.exports.multCoords(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static divCoord(coord: Coord, factor: number) { //Divide a Coord by a factor, storing the result in the Coord.
            coreModule.exports.divCoord(coord.ptr, factor);
            return coord;
        }
        
        static divCoords(coord1: Coord, coord2: Coord) { //Divide two Coords by each other, storing the result in the first Coord.
            coreModule.exports.divCoords(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static dist(coord1: Coord, coord2: Coord) { //Find the distance between two Coords.
            return coreModule.exports.dist(coord1.ptr, coord2.ptr);
        }

        private ptr: number; //Declare address of the x (first) value of this Coord in memory.
        private loc: number; //Declare index of the x (first) value of this Coord in memory/TypedArray.
        private yLoc: number; //Declare index of the y (second) value of this Coord in memory/TypedArray.

        constructor (x: number, y: number) { //Take x and y values for this Coord.
            this.loc = coreMemoryManager.writeBlock([x, y]); //Write them to block memory and store the index.

            this.yLoc = this.loc + 1; //Find the index of the y value simply by adding 1.

            this.ptr = this.loc * coreMemoryManager.arr.BYTES_PER_ELEMENT; //Find and store the address of this Coord (by first value) in memory.
        }

        get x(): number { //Get the x value of this Coord by querying memory.
            return coreMemoryManager.query(this.loc);
        }

        get y(): number { //Get the y value of this Coord by querying memory.
            return coreMemoryManager.query(this.yLoc);
        }

        set x(val: number) { //Set the x value of this Coord by writing to its location in memory.
            coreMemoryManager.write(val, this.loc);
        }

        set y(val: number) { //Set the y value of this Coord by writing to its location in memory.
            coreMemoryManager.write(val, this.yLoc);
        }

        copy(): Coord { //Copy this Coord by returning a new Coord with the same values.
            return new Coord(this.x, this.y);
        }

        toArr(): number[] { //Return this Coord in the form of an array with two numbers.
            return [this.x, this.y];
        }

        remove() { //Remove this Coord, thus freeing up its memory.
            coreMemoryManager.removeBlock(this.loc);
        }
    }

    export class Canvas { //Canvas class to provide an integrated interface for <canvas> elements. 
        private _el: HTMLCanvasElement; //Initialize private property to store the DOM canvas element.
        private _gl: WebGL2RenderingContext; //The WebGL2 rendering context of this Canvas object's <canvas> element.
        public texIndex: WebGLTexture[];
        

        constructor (private _id: string, width: number = 200, height: number = 100) {
            this._el = document.getElementById(_id) as HTMLCanvasElement; //Store the DOM-represented <canvas> element based on the _id parameter.
            this._gl = this._el.getContext("webgl2"); //Get the rendering context based on the _contextType parameter.

            this.texIndex = [];
            this.createSolidTex([0, 255, 0, 255]);

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

        createSolidTex(color: number[], level: number = 0): number {
            let texture = this.gl.createTexture();

            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, level, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array(color));

            return this.texIndex.push(texture);
        }

        loadImageTex(src: string, level: number = 0, internalFormat: number = this.gl.RGBA, srcFormat: number = this.gl.RGBA, srcType: number = this.gl.UNSIGNED_BYTE): number {
            let texture = this.gl.createTexture();
            let image = new Image();
            let gl = this.gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 0, 128, 255]));

            image.onload = function() {
               gl.bindTexture(gl.TEXTURE_2D, texture);
               gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
               gl.generateMipmap(gl.TEXTURE_2D);
            }

            image.src = src;

            return this.texIndex.push(texture);
        }
    }

    export class Stage extends Base { //Stage class to store and manage Prop objects.
        constructor(private _props: Prop[] = []) {
            super();
        }


        get props(): Prop[] { //Public getter for _props array.
            return this._props;
        }


        getIndex(prop: Prop): number { //Get the index of the given Prop.
            return this._props.indexOf(prop);
        }

        addProp(prop: Prop, index: number = -1, quiet: boolean = false): number { //Add the given prop to the _props array at the given index.
            if (index >= 0) { //If the index is provided:
                this._props.splice(index, 0, prop); //Insert the prop at the index.
            } else {
                this._props.push(prop); //Push the prop to the end of the _props array.
            }
            prop.stage = this; //Set the prop's stage to this stage.
            prop.init(quiet); //Call the prop's initialize method.
            return this._props.length; //Return the new length of the _props array.
        }

        addProps(arr: Prop[], index: number = -1, quiet: boolean = false): number { //Add an array of props to the _props array, starting at the given index.
            if (index >= 0) { //If the index is provided:
                arr.forEach(prop => this._props.splice(index, 0, prop)); //Iterate through the given props and add each one to the _props array, starting at the given index.
            } else {
                arr.forEach(prop => this._props.push(prop)); //Iterate through the given props and push each one to the end of the _props array.
            }

            arr.forEach(prop => { //Iterate through each given prop and:
                prop.stage = this; //Set their stage to this stage
                prop.init(quiet); //Call their initialize method
            });

            return this._props.length; //Return the new length of the _props array.
        }

        removeProp(prop: Prop, quiet: boolean = false): number { //Remove the given prop from the _props array.
            let index = prop.index; //Get the index of the prop.

            if (index !== -1) { //If the index does not equal -1 (prop is in _props array)
                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.
                return index; //Return the index that the prop was at.
            }

            return -1; //Return -1 if the prop is not in the _props array.
        }

        removePropByUID(uid: string, quiet: boolean = false): {prop: Prop, index: number} { //Remove the prop with the given UID from the _props array.
            let prop = this._props.find(prop => prop.uid === uid); //Find the prop by UID.

            if (prop) { //If the prop could be found:
                let index = prop.index; //Store the prop's index.

                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return {prop: prop, index: index}; //Return an object containing the prop that was removed and the index it was at.
            }

            return {prop: null, index: -1}; //Return an object with null and -1 values to indicate that a prop with the given UID could not be found.
        }

        removePropByIndex(index: number, quiet: boolean = false): Prop { //Remove the prop at the given index.
            if (this._props[index]) { //If a prop exists at the given index:
                let prop = this._props[index]; //Store the prop.

                prop.remove(quiet); //Call the prop's remove method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.

                return prop; //Return the prop that was removed.
            }

            return null; //Return null to indicate that a prop did not exist at the given index.
        }

        moveProp(curIndex: number, newIndex: number): number { //Move a prop at the given index to a new index.
            let prop = this._props.splice(curIndex, 1)[0]; //Store the prop we are moving, and remove it from its place in the _props array.
            let index: number; //Declare index variable.
            
            if (newIndex < 0 || newIndex >= this._props.length) { //If the new index is less than 0 or more than the _props array length:
                index = this._props.push(prop) - 1; //Add the prop to the end of the array.
                return index; //Return the index the prop was added at.
            }
            
            this._props.splice(newIndex, 0, prop); //Add the prop at the provided index.
            return newIndex; //Return the provided index.
        }

        update(dt: number) { //Update all props in the _props array.
            this._props.forEach(prop => prop.beforeUpdate(dt));

            this._props.forEach(prop => prop.update(dt));

            this._props.forEach(prop => prop.afterUpdate(dt));
        }

        updateLoop(interval: number = 1) {
            let lastUpdate = Date.now();

            window.setInterval(() => {
                let now = Date.now();
                let dt = now - lastUpdate;
                lastUpdate = now;

                this.update(dt);
            }, interval);
        }
    }

    export class Prop extends Base { //Prop class to create, manage, and display 'objects' in the application.
        static toDegrees(radians: number): number { //Static method to convert radians to degrees.
            return (radians / Math.PI) * 180;
        }

        static toRadians(degrees: number): number { //Static method to convert degrees to radians.
            return (degrees / 180) * Math.PI;
        }

        static perSecond(val: number): number { //Static method to convert a value into a 'per-millisecond' version, for use with update() and dt.
            return val / 1000;
        }

        
        public stage: Stage; //Declare the stage property.
        public triangles: Float32Array; //The triangles that make up this Prop's shape.
        public texTriangles: Float32Array; //The triangles that make up this Prop's texture coordinates.
        public texID: number; //Declare the texture for this Prop.


        constructor(public pos: Coord = new Coord(0, 0), public radians: number = 0, public bounds: Coord[] = [new Coord(-10, -10), new Coord(10, -10), new Coord(10, 10), new Coord(-10, 10)]) {
            super();

            this.texID = 0;
        }
        

        set x(x: number) { //Set x coord
            this.pos.x = x;
        }
        
        set y(y: number) { //Set y coord
            this.pos.y = y;
        }
        
        set degrees(degrees: number) { //Convert & set radians
            this.radians = Prop.toRadians(degrees);
        }


        get x(): number { //Get x coord
            return this.pos.x;
        }
        
        get y(): number { //Get y coord
            return this.pos.y;
        }
        
        get degrees(): number { //Convert & get degrees
            return $P.Prop.toDegrees(this.radians);
        }
        
        get index() { //Get index of this prop in the parent stage's props array.
            if (this.stage) {
                return this.stage.props.indexOf(this);
            } else {
                return -1;
            }
        }


        setPos(x: number, y: number) { //Set position of this prop using separate x and y coordinate arguments.
            this.pos[0] = x;
            this.pos[1] = y;
        }

        move(vect: Coord): Coord { //Move this prop by coordinates specified in provided Coord.
            return this.pos = Coord.addCoords(this.pos, vect);
        }

        moveEx(x: number, y: number): Coord { //Move this prop by coordinates specified by specific x and y coordinate arguments.
            return this.pos = Coord.addCoords(this.pos, new Coord(x, y));
        }

        rotate(radians: number): number { //Rotate this prop by provided radians amount.
            this.radians += radians % 2 * Math.PI; //Rotate the prop by the amount, modulo operator to wrap around after 2PI radians.

            if (this.radians <= 0) { //If resultant radians is less than zero
                this.radians = 2 * Math.PI + this.radians; //Loop back to 2PI
            } else if (this.radians >= Math.PI) { //Otherwise, if resultant radians is more than 2PI
                this.radians -= 2 * Math.PI; //Loop back to 0.
            }

            return this.radians; //Return the new radians value.
        }

        rotateDegrees(degrees: number) { //Rotate this prop by provided degrees amount.
            return Prop.toDegrees(this.rotate(Prop.toRadians(degrees)));
        }

        remove(quiet: boolean) {} //Empty remove method to be redefined by derivative objects and classes.

        init(quiet: boolean) {} //Empty init method to be redefined by derivative objects and classes.

        
        beforeUpdate(dt: number) {} //Empty beforeUpdate method to be redefined by derivative objects and classes.

        update(dt: number) { //Default update method to be redefined by derivative objects and classes.
            this.rotateDegrees(0.18 * dt);
        }

        afterUpdate(dt: number) {} //Empty afterUpdate method to be redefined by derivative objects and classes.

        draw(gl: WebGL2RenderingContext, rel: Coord, scale: Coord) { //Default draw method to be redefined by derivative objects and classes.

        }
    }

    export class Camera extends Base { //Camera class to manage drawing Props from Stage onto Canvas.
        static shaderSource: {vertex: string, fragment: string} = {
            vertex: `#version 300 es //VERTEX SHADER
                in vec2 a_position; //Take a vec2 position value as input.
                in vec2 a_texCoord; //Take a vec2 for texture coordinates.

                uniform vec2 u_resolution; //Take the current Canvas width and height as a uniform.
                uniform vec2 u_offset; //Take the offset from the top-left of the Canvas that the current Prop is being drawn at.

                out vec2 v_texCoord; //Pass texture coordinates to fragment shader.

                void main() { //Main loop
                    vec2 relToZero = a_position + u_offset; //Get the position of the current vertex relative to the top left of the canvas.
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

        static createShader: Function = function (gl, type, source) { //WebGL2 shader creation method
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

        static createProgram: Function = function(gl, vertexShader, fragmentShader) { //WebGL2 program creation method
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

        private shaders: {vertex: WebGLShader, fragment: WebGLShader} = {vertex: undefined, fragment: undefined};
        private program: WebGLProgram;

        private attribLocation: {position: GLint, texCoord: GLint} = {position: undefined, texCoord: undefined};
        private uniformLocation: {resolution: WebGLUniformLocation, offset: WebGLUniformLocation, texture: WebGLUniformLocation} = {resolution: undefined, offset: undefined, texture: undefined};

        private buffers: {position: WebGLBuffer, texCoord: WebGLBuffer} = {position: undefined, texCoord: undefined};

        private vertexArrayObjects: {position: WebGLVertexArrayObject, texCoord: WebGLVertexArrayObject} = {position: undefined, texCoord: undefined};

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
            this.uniformLocation.texture = this.gl.getUniformLocation(this.program, "u_texture"); //Get location of texture uniform.

            this.buffers.position = this.gl.createBuffer(); //Create position buffer.
            this.buffers.texCoord = this.gl.createBuffer(); //Create texture buffer.
            
            this.vertexArrayObjects.position = this.gl.createVertexArray(); //Create the vertex array.
            this.vertexArrayObjects.texCoord = this.gl.createVertexArray();

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
                let rel = Coord.divCoords( //Find the prop's position relative to the top left of the canvas.
                              Coord.addCoords(
                                  Coord.subCoords(prop.pos.copy(), this.stagePos),
                              this.canvasPos),
                          this.scale);
                
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, prop.triangles, this.gl.DYNAMIC_DRAW);
                
                this.gl.bindVertexArray(this.vertexArrayObjects.position);
                this.gl.enableVertexAttribArray(this.attribLocation.position);

                this.gl.vertexAttribPointer(
                    this.attribLocation.position,
                    2, //Size
                    this.gl.FLOAT, //Type
                    false, //Normalize
                    0, //Stride
                    0 //Offset
                );

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texCoord);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, prop.texTriangles, this.gl.DYNAMIC_DRAW);

                this.gl.bindVertexArray(this.vertexArrayObjects.texCoord);
                this.gl.enableVertexAttribArray(this.attribLocation.texCoord);

                this.gl.vertexAttribPointer(
                    this.attribLocation.texCoord,
                    2, //Size
                    this.gl.FLOAT, //Type
                    false, //Normalize
                    0, //Stride
                    0 //Offset
                );

                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.canvas.texIndex[prop.texID]);

                this.gl.uniform1i(this.uniformLocation.texture, 0);
                this.gl.uniform2f(this.uniformLocation.offset, rel.x, rel.y);
                this.gl.uniform2f(this.uniformLocation.resolution, this.canvas.width, this.canvas.height);

                rel.remove();

                this.gl.drawArrays(this.gl.TRIANGLES, 0, prop.triangles.length / 2);
            });
        }
    }
}