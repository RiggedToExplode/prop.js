namespace $P {
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
}