/*=============*\
|  ASSEMBLY.TS  |
\*=============*/

namespace $P {
    /* MEMORYMANAGER CLASS
     *
     * Class to manage writing number data in such a way that WebAssembly can understand it, by utilizing
     * TypedArrays and the access they provide to their underlying ArrayBuffer.
     */
    export class MemoryManager {
        // PROPERTIES
        protected _target: number = 0; //What index to write new values at if there are no other free indices.
        protected _free: number[] = []; //Array of indices that have been 'freed' and can be written to.

        protected _type = "memorymanager"; //Protected _type string to store the type of this class.

        public arr: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array; //The TypedArray this MemoryManager will use.


        /* CONSTRUCTOR
         * 
         * Parameters: WebAssembly.Memory to manage, Array Type
         * 
         * Creates a new TypedArray of provided Array Type and assigns the buffer of the provided
         * WebAssembly.Memory object to the buffer of the TypedArray.
         */
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


        // GETTERS
        get type(): string { //Get the type of this class. Unsettable.
            return this._type;
        }


        /* WRITE METHOD
         * 
         * Parameters: Value to write, Location to write at
         * 
         * Writes the given value to this.arr at the provided location. If no location is provided, the value
         * will be written at the next index listed in this._free. If this._free is empty, the value will be 
         * written at the 'end' of the array. Once this.arr is full, the memory buffer is grown to accomodate
         * more values.
         */
        write(val: number, loc: number = undefined) {
            if (loc !== undefined) { //If a location is provided, write there.
                this.arr[loc] = val;

                return loc;
            } else { //Otherwise use automatic allocation.
                if (this._free[0] !== undefined) { //If there are any free memory locations
                   let out = this._free.pop(); //Get the last free location and remove it

                   this.arr[out] = val; //Write to the free location

                   return out; //Return the location where written
                } else { //Otherwise, resort to the _target pointer to write at end of array.
                    let out = this._target;

                    this.arr[out] = val; //Write at the end of the array.

                    this._target++; //Increment the pointer for next time we need it.

                    if (this._target >= this.arr.length) { //If _target exceeds length of this.arr
                        this.memory.grow(1); //Grow the buffer by 1 page (64kB) and thus extend the array.
                        this.arr = new Float32Array(this.memory.buffer);
                    }

                    return out; //Return the location where written.
                }
            }
        }
        
        /* QUERY METHOD
         * 
         * Parameters: Location to query
         * 
         * Reads and returns a value from this.arr given the index to read.
         */
        query(loc: number) {
            return this.arr[loc];
        }

        /* FREE METHOD
         * 
         * Parameters: Location to free
         * 
         * Marks an index in this.arr as free to write to by pushing the index to this._free.
         */
        free(loc: number) {
            this._free.push(loc); //Add location to _free array to signify writabililty. Value isn't actually affected until write() uses this free location.
        }
    }

    /* BLOCKMEMORYMANAGER CLASS
     * 
     * Class to manage writing number data in such a way that WebAssembly can understand it, same as
     * MemoryManager, but in blocks of two or more at once.
     */
    export class BlockMemoryManager extends MemoryManager {
        // PROPERTIES
        private _blockSize: number; //Length of the blocks this manager will manage.
        protected _type = "blockmemorymanager"; //Protected _type string to store the type of this class.

        /* CONSTRUCTOR
         * 
         * Parameters: WebAssembly.Memory to manage, Array type, Size of blocks
         * 
         * Creates a new TypedArray of provided Array Type and assigns the buffer of the provided
         * WebAssembly.Memory object to the buffer of the TypedArray. Sets _blockSize property from parameter.
         */
        constructor(memory: WebAssembly.Memory, arrayType: string = "Float32Array", blockSize: number = 2) {
            super(memory, arrayType); //Call the super constructor to setup this class as a MemoryManager

            this._blockSize = blockSize; //Set the private _blockSize property from the parameter.
        }


        // GETTERS
        get blockSize(): number { //Get the block size of this memory manager. Unsettable.
            return this._blockSize;
        }


        /* WRITE METHOD
         * 
         * Parameters: value to write, location to write at
         * 
         * The write method writes the provided value to the provided location. This method will throw an Error
         * if no location is provided as, unlike a regular MemoryManager, a BlockMemoryManager cannot allocate
         * space for single values.
         */
        write(val: number, loc: number): number {
            if (loc !== undefined) { //If location is provided, write there.
                this.arr[loc] = val; //Write the value.
                
                return loc; //Return location written to.
            } else { //Otherwise throw an error because BlockMemoryManager cannot manage single values.
                throw new Error("Cannot automatically allocate new single values in AssemblyBlockMemory! Try using writeArr instead.");
            }
        }

        /* WRITEBLOCK METHOD
         *
         * Parameters: array of values to write, location to write to
         * 
         * The writeBlock method writes a set of numbers (a block) to a given location in this manager's array. If no location is
         * provided, the method finds a location to write the values by checking the _free array and then resorting to the _target
         * pointer if the _free array is empty.
         */
        writeBlock(val: number[], loc: number = undefined) {
            val.length = this.blockSize; //Truncate or extend val parameter to the correct length. (Force input to fit blockLength)

            if (loc !== undefined) { //If a location is provided
                this.arr.set(val, loc); //Write the block there.

                return loc;
            } else { //Otherwise
                if (this._free[0] !== undefined) { //If there are free locations (this._free array stores indices where first item in block is stored)
                    let out = this._free.pop(); //Get & remove the last one

                    this.arr.set(val, out); //Write the block to the free location

                    return out; //Return the location of the first value written.
                } else { //Otherwise resort to _target pointer
                    let out = this._target;

                    this.arr.set(val, out); //Write block at _target pointer

                    this._target += this.blockSize; //Increment _target pointer by the size of a block

                    if (this._target >= this.arr.length) { //If _target pointer exceeds this.arr length
                        this.memory.grow(1); //Grow the buffer by 1 page (64kB), thus extending this.arr
                        this.arr = new Float32Array(this.memory.buffer);
                    }

                    return out; //Return the location written (the location of the first value).
                }
            }
        }
    }

    /* ASSEMBLYMODULE CLASS
     *
     * The AssemblyModule class manages the creation and initialization of a WebAssembly module from source. It exposes
     * the compiled WebAssembly functions for ease of access, and makes the process of creating the WebAssembly module easier.
     */
    export class AssemblyModule {
        // PROPERTIES
        private _type: string = "assemblymodule"; //The type of this class
        private _exports: any; //Array of exposed functions from WebAssembly
        private _module: any; //The WebAssembly module


        /* CONSTRUCTOR
         *
         * Parameters: source code for WebAssembly module
         * 
         * This constructor function only stores the source code of the WebAssembly module.
         */
        constructor(public src: string) {
        }


        // GETTERS
        get type(): string { //Get type of this class. Unsettable.
            return this._type;
        }

        get exports(): any { //Get exported functions publicly, as to keep from editing or overwriting them. Unsettable.
            return this._exports;
        }

        get memory(): WebAssembly.Memory { //Shortcut getter to access WebAssembly.memory. Unsettable.
            return this._exports.memory;
        }

        get module(): any { //Get WebAssembly module publicly, as to keep from editing it. Unsettable.
            return this._module;
        }


        // METHODS
        /* INIT ASYNCHRONOUS METHOD
         *
         * Parameters: memory options to initialize with
         * 
         * The init method starts the process of instantiating the WebAssembly module by fetching the source code
         * from the src URL that was provided on construction. It then puts the source code into an array buffer
         * and uses the array buffer to instantiate the module with the provided memory options.
         */
        async init(memory: WebAssembly.Memory): Promise<any> {
            let obj = await fetch(this.src) //Fetch the source code,
                           .then(response =>
                               response.arrayBuffer() //Get source code as array buffer
                           )
                           .then(bytes => {
                               return WebAssembly.instantiate(bytes, {js: {mem: memory}}); //Compile & instantiate the module from the source code (in buffer) and given AssemblyMemory.
                           });
                
            this._module = obj.module; //Set the module property.
            this._exports = obj.instance.exports; //Set the array of exported functions! We get to use these! :)
        }
    }

    /* COREMEMORYMANAGER OBJECT
     *
     * The coreMemoryManager object is the memory manager that Prop.js uses for its core funcitonalities, which are mainly
     * Coord manipulations.
     */
    export var coreMemoryManager: BlockMemoryManager = undefined;

    /* COREMODULE OBJECT
     *
     * The coreModule object is the compiled & instantiated WebAssembly module that Prop.js gets the functions from to perform
     * its core functionalities, mainly Coord manipulations.
     */
    export const coreModule: AssemblyModule = undefined;

    /* INIT FUNCTION
     *
     * Parameters: source code for the WebAssembly module, type of array to use for memory manipulation, initial number of memory pages, maximum number of memory pages
     * 
     * The init function initializes the framework's core WebAssembly module and creates the core memory manager the module will use.
     */
    export async function init(src: string = "prop.wasm", arrayType: string = undefined, pagesInitial: number = 1, pagesMax: number = 256) {
        this.coreModule = new AssemblyModule(src); //Create the module for all our WebAssembly.

        await this.coreModule.init(new WebAssembly.Memory({initial: pagesInitial, maximum: pagesMax})); //Init the module (load source code & compile), while passing in memory options.

        this.coreMemoryManager = new BlockMemoryManager(this.coreModule.memory, arrayType, 2); //Create the memory manager we will use.
    }
}