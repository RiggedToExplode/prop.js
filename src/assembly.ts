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
        protected target: number = 0; //What index to write new values at, provided there are no free indices.
        protected free: number[] = []; //Array of indices that have been 'freed' and can be written to.

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


        /* write Method
         * 
         * Parameters: Value to write, Location to write at
         * 
         * Writes the given value to this.arr at the provided location. If no location is provided, the value
         * will be written at the next index listed in this.free. If this.free is empty, the value will be 
         * written at the 'end' of the array. Once this.arr is full, the memory buffer is grown to accomodate
         * more values.
         */
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
        
        /* query Method
         * 
         * Parameters: Location to query
         * 
         * Reads and returns a value from this.arr given the index to read.
         */
        query(loc: number) {
            return this.arr[loc];
        }

        /* remove Method
         * 
         * Parameters: Location to free
         * 
         * Marks an index in this.arr as free to write to by pushing the index to this.free.
         */
        remove(loc: number) {
            this.free.push(loc); //Add location to free array to signify writabililty. Value isn't actually affected until write() uses this free location.
        }
    }

    /* BLOCKMEMORYMANAGER CLASS
     * 
     * Class to manage writing number data in such a way that WebAssembly can understand it, same as
     * MemoryManager, in blocks of two or more at once.
     */
    export class BlockMemoryManager extends MemoryManager{
        // PROPERTIES
        private _blockSize: number; //Length of the blocks this manager will manage.
        protected _type = "blockmemorymanager"; //Protected _type string to store the type of this class.

        /* CONSTRUCTOR
         * 
         * Parameters: WebAssembly.Memory to manage, Array type, Size of blocks
         * 
         * Creates a new TypedArray of provided Array Type and assigns the buffer of the provided
         * WebAssembly.Memory object to the buffer of the TypedArray. Stores blockSize parameter.
         */
        constructor(memory: WebAssembly.Memory, arrayType: string = "Float32Array", blockSize: number = 2) {
            super(memory, arrayType);

            this._blockSize = blockSize;
        }


        // GETTERS
        get blockSize(): number { //Get the block size of this memory manager. Unsettable.
            return this._blockSize;
        }


        /* write Method
         * 
         * Parameters:
         */
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
        private _type: string = "assemblymodule";
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

        get type(): string {
            return this._type;
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
}