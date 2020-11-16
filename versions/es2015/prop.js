var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*=============*\
|  ASSEMBLY.TS  |
\*=============*/
var $P;
(function ($P) {
    /* MEMORYMANAGER CLASS
     *
     * Class to manage writing number data in such a way that WebAssembly can understand it, by utilizing
     * TypedArrays and the access they provide to their underlying ArrayBuffer.
     */
    class MemoryManager {
        /* CONSTRUCTOR
         *
         * Parameters: WebAssembly.Memory to manage, Array Type
         *
         * Creates a new TypedArray of provided Array Type and assigns the buffer of the provided
         * WebAssembly.Memory object to the buffer of the TypedArray.
         */
        constructor(memory, arrayType = "Float32Array") {
            this.memory = memory;
            // PROPERTIES
            this._target = 0; //What index to write new values at if there are no other free indices.
            this._free = []; //Array of indices that have been 'freed' and can be written to.
            this._type = "memorymanager"; //Protected _type string to store the type of this class.
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
        get type() {
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
        write(val, loc = undefined) {
            if (loc !== undefined) { //If a location is provided, write there.
                this.arr[loc] = val;
                return loc;
            }
            else { //Otherwise use automatic allocation.
                if (this._free[0] !== undefined) { //If there are any free memory locations
                    let out = this._free.pop(); //Get the last free location and remove it
                    this.arr[out] = val; //Write to the free location
                    return out; //Return the location where written
                }
                else { //Otherwise, resort to the _target pointer to write at end of array.
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
        query(loc) {
            return this.arr[loc];
        }
        /* FREE METHOD
         *
         * Parameters: Location to free
         *
         * Marks an index in this.arr as free to write to by pushing the index to this._free.
         */
        free(loc) {
            this._free.push(loc); //Add location to _free array to signify writabililty. Value isn't actually affected until write() uses this free location.
        }
    }
    $P.MemoryManager = MemoryManager;
    /* BLOCKMEMORYMANAGER CLASS
     *
     * Class to manage writing number data in such a way that WebAssembly can understand it, same as
     * MemoryManager, but in blocks of two or more at once.
     */
    class BlockMemoryManager extends MemoryManager {
        /* CONSTRUCTOR
         *
         * Parameters: WebAssembly.Memory to manage, Array type, Size of blocks
         *
         * Creates a new TypedArray of provided Array Type and assigns the buffer of the provided
         * WebAssembly.Memory object to the buffer of the TypedArray. Sets _blockSize property from parameter.
         */
        constructor(memory, arrayType = "Float32Array", blockSize = 2) {
            super(memory, arrayType); //Call the super constructor to setup this class as a MemoryManager
            this._type = "blockmemorymanager"; //Protected _type string to store the type of this class.
            this._blockSize = blockSize; //Set the private _blockSize property from the parameter.
        }
        // GETTERS
        get blockSize() {
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
        write(val, loc) {
            if (loc !== undefined) { //If location is provided, write there.
                this.arr[loc] = val; //Write the value.
                return loc; //Return location written to.
            }
            else { //Otherwise throw an error because BlockMemoryManager cannot manage single values.
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
        writeBlock(val, loc = undefined) {
            val.length = this.blockSize; //Truncate or extend val parameter to the correct length. (Force input to fit blockLength)
            if (loc !== undefined) { //If a location is provided
                this.arr.set(val, loc); //Write the block there.
                return loc;
            }
            else { //Otherwise
                if (this._free[0] !== undefined) { //If there are free locations (this._free array stores indices where first item in block is stored)
                    let out = this._free.pop(); //Get & remove the last one
                    this.arr.set(val, out); //Write the block to the free location
                    return out; //Return the location of the first value written.
                }
                else { //Otherwise resort to _target pointer
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
    $P.BlockMemoryManager = BlockMemoryManager;
    /* ASSEMBLYMODULE CLASS
     *
     * The AssemblyModule class manages the creation and initialization of a WebAssembly module from source. It exposes
     * the compiled WebAssembly functions for ease of access, and makes the process of creating the WebAssembly module easier.
     */
    class AssemblyModule {
        /* CONSTRUCTOR
         *
         * Parameters: source code for WebAssembly module
         *
         * This constructor function only stores the source code of the WebAssembly module.
         */
        constructor(src) {
            this.src = src;
            // PROPERTIES
            this._type = "assemblymodule"; //The type of this class
        }
        // GETTERS
        get type() {
            return this._type;
        }
        get exports() {
            return this._exports;
        }
        get memory() {
            return this._exports.memory;
        }
        get module() {
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
        init(memory) {
            return __awaiter(this, void 0, void 0, function* () {
                let obj = yield fetch(this.src) //Fetch the source code,
                    .then(response => response.arrayBuffer() //Get source code as array buffer
                )
                    .then(bytes => {
                    return WebAssembly.instantiate(bytes, { js: { mem: memory } }); //Compile & instantiate the module from the source code (in buffer) and given AssemblyMemory.
                });
                this._module = obj.module; //Set the module property.
                this._exports = obj.instance.exports; //Set the array of exported functions! We get to use these! :)
            });
        }
    }
    $P.AssemblyModule = AssemblyModule;
    /* COREMEMORYMANAGER OBJECT
     *
     * The coreMemoryManager object is the memory manager that Prop.js uses for its core funcitonalities, which are mainly
     * Coord manipulations.
     */
    $P.coreMemoryManager = undefined;
    /* COREMODULE OBJECT
     *
     * The coreModule object is the compiled & instantiated WebAssembly module that Prop.js gets the functions from to perform
     * its core functionalities, mainly Coord manipulations.
     */
    $P.coreModule = undefined;
    /* INIT FUNCTION
     *
     * Parameters: source code for the WebAssembly module, type of array to use for memory manipulation, initial number of memory pages, maximum number of memory pages
     *
     * The init function initializes the framework's core WebAssembly module and creates the core memory manager the module will use.
     */
    function init(src = "prop.wasm", arrayType = undefined, pagesInitial = 1, pagesMax = 256) {
        return __awaiter(this, void 0, void 0, function* () {
            this.coreModule = new AssemblyModule(src); //Create the module for all our WebAssembly.
            yield this.coreModule.init(new WebAssembly.Memory({ initial: pagesInitial, maximum: pagesMax })); //Init the module (load source code & compile), while passing in memory options.
            this.coreMemoryManager = new BlockMemoryManager(this.coreModule.memory, arrayType, 2); //Create the memory manager we will use.
        });
    }
    $P.init = init;
})($P || ($P = {}));
/*=========*\
|  BASE.TS  |
\*=========*/
/* SEE ALSO:
 *
 * assembly.ts for definition of coreModule (used by Coord) and its respective
 *      class 'AssemblyModule,' as well as coreMemory and its respective class
 *      'BlockMemoryManager'.
 */
var $P;
(function ($P) {
    /* BASE CLASS
     *
     * Base class for most other Prop.js classes to inherit from. Automatically
     * assigns unique IDs based on time and random string.
     */
    class Base {
        /* CONSTRUCTOR
         *
         * Parameters: None
         */
        constructor() {
            this._type = "base"; //Protected _type string to store the type of this class.
            this._uid = Base.genUID();
        } //Generate new UID and assign to _uid property.
        // STATIC METHODS
        /* genUID Static Method
         *
         * Parameters: None
         *
         * Generates unique ID based on epoch time and a random number, used to
         * automatically assign UIDs to objects.
         */
        static genUID() {
            return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
        }
        // GETTERS
        get uid() {
            return this._uid;
        }
        get type() {
            return this._type;
        }
    }
    $P.Base = Base;
    /* COORD CLASS
     *
     * Class to store two-dimensional coordinate pairs in WebAssembly and manipulate
     * them using functions written in C or other compiled languages.
     */
    class Coord {
        /* CONSTRUCTOR
         *
         * Parameters: X Coordinate, Y Coordinate
         *
         * This constructor takes in two numbers to represent the X and Y coordinates of the point meant to be
         * described by the Coord, and then puts those points into WebAssembly memory by writing them with
         * coreMemoryManager. The constructor then stores the indices of the X and Y points in the
         * TypedArray as _loc and _yLoc, and uses those indices to calculate a pointer to the Coord.
         */
        constructor(x, y) {
            this._type = "coord"; //Private _type string to store the type of this class.
            this._loc = $P.coreMemoryManager.writeBlock([x, y]); //Write coordinates into block memory and get the index of X back.
            this._yLoc = this._loc + 1; //Find the index of the y value simply by adding 1.
            this._ptr = this._loc * $P.coreMemoryManager.arr.BYTES_PER_ELEMENT; //Find and store the address of this Coord (by first value) in memory.
        }
        /* add Static Method
         *
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'add'.
         * WebAssembly 'add' adds the two Coords together, storing the result in the first Coord.
         */
        static add(coord1, coord2) {
            $P.coreModule.exports.add(coord1.ptr, coord2.ptr);
            return coord1;
        }
        /* subtract Static Method
         *
         * Parameters: First Coord to add, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'subtract'.
         * WebAssembly 'subtract' subtracts second Coord from first Coord, storing the result in the first Coord.
         */
        static subtract(coord1, coord2) {
            $P.coreModule.exports.subtract(coord1.ptr, coord2.ptr);
            return coord1;
        }
        /* factor Static Method
         *
         * Parameters: Coord to multiply, Factor of multiplication
         *
         * Passes provided Coord pointer and factor value into Prop.js standard WebAssembly function 'factor'.
         * WebAssembly 'factor' multiplies both Coord values by 'val', storing the result in the Coord.
         */
        static factor(coord, val) {
            $P.coreModule.exports.factor(coord.ptr, val);
            return coord;
        }
        /* multiply Static Method
         *
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'multiply'.
         * WebAssembly 'multiply' multiplies first and second Coords together, storing the result in the first Coord.
         */
        static multiply(coord1, coord2) {
            $P.coreModule.exports.multiply(coord1.ptr, coord2.ptr);
            return coord1;
        }
        /* divisor Static Method
         *
         * Parameters: Coord to divide, Divisor
         *
         * Passes provided Coord pointer and divisor value into Prop.js standard WebAssembly function 'divisor'.
         * WebAssembly 'divisor' divides both Coord values by 'val', storing the result in the first Coord.
         */
        static divisor(coord, val) {
            $P.coreModule.exports.divisor(coord.ptr, val);
            return coord;
        }
        /* divide Static Method
         *
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'divide'.
         * WebAssembly 'divide' divides first Coord by second Coord, storing the result in the first Coord.
         */
        static divide(coord1, coord2) {
            $P.coreModule.exports.divide(coord1.ptr, coord2.ptr);
            return coord1;
        }
        /* dist Static Method
         *
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'dist'.
         * WebAssembly 'dist' finds distance between the two points described by the two Coords, and returns the value.
         */
        static dist(coord1, coord2) {
            return $P.coreModule.exports.dist(coord1.ptr, coord2.ptr);
        }
        // GETTERS
        get x() {
            return $P.coreMemoryManager.query(this._loc);
        }
        get y() {
            return $P.coreMemoryManager.query(this._yLoc);
        }
        get ptr() {
            return this._ptr;
        }
        get type() {
            return this._type;
        }
        // SETTERS
        set x(val) {
            $P.coreMemoryManager.write(val, this._loc);
        }
        set y(val) {
            $P.coreMemoryManager.write(val, this._yLoc);
        }
        /* set Method
         *
         * Parameters: X Coordinate or Array representing X and Y Coordinates, Y Coordinate
         *
         * Simultaneously sets the X and Y coordinates of this Coord in one function call.
         */
        set(x, y = undefined) {
            if (Array.isArray(x)) { //If first parameter is array.
                this.x = x[0]; //Assign X from first element in array.
                this.y = x[1]; //Assign Y from second element in array.
            }
            else {
                this.x = x; //Assign X from x parameter.
                this.y = y; //Assign Y from y parameter.
            }
        }
        /* copy Method
         *
         * Parameters: None
         *
         * Returns a new Coord with the same coordinate data as this Coord.
         */
        copy() {
            return new Coord(this.x, this.y);
        }
        /* toArr Method
         *
         * Parameters: None
         *
         * Returns a new Array of two elements, where the first element is the X coordinate
         * of this Coord, and the second element is the Y element of this Coord.
         */
        toArr() {
            return [this.x, this.y];
        }
        /* toPair Method
         *
         * Parameters: None
         *
         * Returns a new Pair with the same coordinate data as this Coord.
         */
        toPair() {
            return new Pair(this.x, this.y);
        }
        /* remove Method
         *
         * Parameters: None
         *
         * Removes the memory allocation for this Coord from WebAssembly memory,
         * effectively deleting the Coord. This function is very important, and must
         * be used to deallocate unneeded Coords in order to avoid memory leaks.
         */
        remove() {
            $P.coreMemoryManager.free(this._loc);
        }
    }
    $P.Coord = Coord;
    /* PAIR CLASS
     *
     * Class to store coordinate pairs, accesible via x and y getters and setters or 'virtual' array
     * indices.
     */
    class Pair {
        /* CONSTRUCTOR
         *
         * Parameters: X Coordinate, Y Coordinate
         *
         * Assigns provided X and Y values to the x and y properties of this pair.
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
            // PROPERTIES
            this._type = "pair"; //Private _type string to store the type of this class.
        }
        /* add Static Method
         *
         * Parameters: First Pair, Second Pair
         *
         * Adds coordinate pairs of first and second Pairs together, returning a new Pair with the results.
         */
        static add(pair1, pair2) {
            return new Pair(pair1[0] + pair2[0], pair1[1] + pair2[1]);
        }
        /* subtract Static Method
         *
         * Parameters: First Pair, Second Pair
         *
         * Subtracts coordinate pair of second Pair from coordinate pair of first Pair, returning a new Pair
         * with the results.
         */
        static subtract(pair1, pair2) {
            return new Pair(pair1[0] - pair2[0], pair1[1] - pair2[1]);
        }
        /* factor Static Method
         *
         * Parameters: Pair to multiply, Multiplication factor
         *
         * Multiply both coordinate values of provided Pair by provided factor, returning a new Pair with the results.
         */
        static factor(pair, factor) {
            return new Pair(pair[0] * factor, pair[1] * factor);
        }
        /* multiply Static Method
         *
         * Parameters: First Pair, Second Pair
         *
         * Multiply the coordinate pairs of first Pair and second Pair together, returning a new Pair with the results.
         */
        static multiply(pair1, pair2) {
            return new Pair(pair1[0] * pair2[0], pair1[1] * pair2[1]);
        }
        /* divisor Static Method
         *
         * Parameters: Pair to divide, Divisor
         *
         * Divide both values of the provided Pair by provided divisor value, returning a new Pair with the results.
         */
        static divisor(pair, divisor) {
            return new Pair(pair[0] / divisor, pair[1] / divisor);
        }
        /* divide Static Method
         *
         * Parameters: First Pair, Second Pair
         *
         * Divide the coordinate pair of first Pair by coordinate pair of second Pair, returning a new Pair with the results.
         */
        static divide(pair1, pair2) {
            return new Pair(pair1[0] / pair2[0], pair1[1] / pair2[1]);
        }
        /* dist Static Method
         *
         * Parameters: First Pair, Second Pair
         *
         * Return distance between point described by first Pair to point described by second Pair.
         */
        static dist(pair1, pair2) {
            return Math.sqrt(Math.pow(pair2[0] - pair1[0], 2) + Math.pow(pair2[1] - pair1[1], 2));
        }
        // GETTERS
        get 0() {
            return this.x;
        }
        get 1() {
            return this.y;
        }
        get type() {
            return this._type;
        }
        // SETTERS
        set 0(x) {
            this.x = x;
        }
        set 1(y) {
            this.y = y;
        }
        /* set Method
         *
         * Parameters: X Coordinate or Array representing X and Y Coordinates, Y Coordinate
         *
         * Simultaneously sets the X and Y coordinates of this Pair in one function call.
         */
        set(x, y = undefined) {
            if (Array.isArray(x)) {
                this.x = x[0];
                this.y = x[1];
            }
            else {
                this.x = x;
                this.y = y;
            }
        }
        /* copy Method
         *
         * Parameters: None
         *
         * Returns a new Pair with the same coordinate values as this Pair.
         */
        copy() {
            return new Pair(this.x, this.y);
        }
        /* toArr Method
         *
         * Parameters: None
         *
         * Returns a new Array where the first element is the X coordinate of this pair, and the
         * second index is the Y coordinate of this pair.
         */
        toArr() {
            return [this.x, this.y];
        }
        /* toCoord Method
         *
         * Parameters: None
         *
         * Returns a new Coord with the same coordinate values as this Pair.
         */
        toCoord() {
            return new Coord(this.x, this.y);
        }
    }
    $P.Pair = Pair;
})($P || ($P = {}));
/*==========*\
|  STAGE.TS  |
\*==========*/
/* SEE ALSO:
 *
 * prop.ts for its definition of the Prop class
 */
var $P;
(function ($P) {
    /* STAGE CLASS
     *
     * The Stage class holds props in a props array, effectively collecting all props for easy execution of the update and draw cycles.
     * It also exposes multiple methods for adding, removing, and moving props to, from, and in the props array. The Stage class manages
     * execution of the update cycle.
     */
    class Stage extends $P.Base {
        /* CONSTRUCTOR
         *
         * Parameters: array of Props to place in the Stage from the getgo
         *
         * This constructor simply sets the props array at the outset, and calls the Base constructor to generate a UID.
         */
        constructor(_props = []) {
            super();
            this._props = _props;
            // PROPERTIES
            this._type = "stage"; //The type of this class
        }
        // GETTERS
        get props() {
            return this._props;
        }
        // METHODS
        /* GETINDEX METHOD
         *
         * Parameters: Prop to get index of
         *
         * The getIndex method takes in one Prop and returns the index of that Prop in the _props array.
         */
        getIndex(prop) {
            return this._props.indexOf(prop);
        }
        /* ADDPROP METHOD
         *
         * Parameters: Prop to add, index to insert prop at, whether to insert prop "quietly"
         *
         * The addProp method adds the specified Prop to the _props array at the specified index (or at the end if no index is provided).
         * It then calls the init() hook for the specified Prop, passing in the provided quiet value.
         */
        addProp(prop, index = -1, quiet = false) {
            if (index >= 0) { //If the index is provided:
                this._props.splice(index, 0, prop); //Insert the prop at the index.
            }
            else {
                this._props.push(prop); //Push the prop to the end of the _props array.
            }
            prop.stage = this; //Set the prop's stage to this stage.
            prop.init(quiet); //Call the prop's initialize method.
            return this._props.length; //Return the new length of the _props array.
        }
        /* ADDPROPS
         *
         * Parameters: array of Props to add, index to insert Props at, whether to add Props "quietly"
         *
         * The addProps method inserts the provided array of Props into the _props array at the provided index. It then
         * passes the provided quiet value into the init() hook for each Prop added.
         */
        addProps(arr, index = -1, quiet = false) {
            if (index >= 0) { //If the index is provided:
                arr.forEach(prop => this._props.splice(index, 0, prop)); //Iterate through the given props and add each one to the _props array, starting at the given index.
            }
            else {
                arr.forEach(prop => this._props.push(prop)); //Iterate through the given props and push each one to the end of the _props array.
            }
            arr.forEach(prop => {
                prop.stage = this; //Set their stage to this stage
                prop.init(quiet); //Call their initialize method
            });
            return this._props.length; //Return the new length of the _props array.
        }
        /* REMOVEPROP METHOD
         *
         * Parameters: Prop to remove, whether to remove Prop "quietly"
         *
         * The removeProp method removes the specified Prop from the _props array, but not before calling the Prop's remove()
         * hook with the provided quiet value.
         */
        removeProp(prop, quiet = false) {
            let index = prop.index; //Get the index of the prop.
            if (index !== -1) { //If the index does not equal -1 (prop is in _props array)
                prop.cleanup(quiet); //Call the prop's cleanup method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.
                return index; //Return the index that the prop was at.
            }
            return -1; //Return -1 if the prop is not in the _props array.
        }
        /* REMOVEPROPBYUID METHOD
         *
         * Parameters: uid of Prop to remove, whether to remove Prop "quietly"
         *
         * The removePropByUID method removes the first instance of a Prop in the _props array with a UID matching that
         * specified. Before doing so, it calls the Prop's remove() hook with the specified quiet value.
         */
        removePropByUID(uid, quiet = false) {
            let prop = this._props.find(prop => prop.uid === uid); //Find the prop by UID.
            if (prop) { //If the prop could be found:
                let index = prop.index; //Store the prop's index.
                prop.cleanup(quiet); //Call the prop's cleanup method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.
                return { prop: prop, index: index }; //Return an object containing the prop that was removed and the index it was at.
            }
            return { prop: null, index: -1 }; //Return an object with null and -1 values to indicate that a prop with the given UID could not be found.
        }
        /* REMOVEPROPBYINDEX METHOD
         *
         * Parameters: index of Prop to remove, whether to remove Prop "quietly"
         *
         * The removePropByIndex method removes the Prop at the specified index in the _props array, but not before calling the Prop's
         * remove() hook with the specified quiet value.
         */
        removePropByIndex(index, quiet = false) {
            if (this._props[index]) { //If a prop exists at the given index:
                let prop = this._props[index]; //Store the prop.
                prop.cleanup(quiet); //Call the prop's cleanup method.
                prop.stage = null; //Remove this stage from the prop's stage property.
                this._props.splice(index, 1); //Remove the prop from the _props array.
                return prop; //Return the prop that was removed.
            }
            return null; //Return null to indicate that a prop did not exist at the given index.
        }
        /* MOVEPROP METHOD
         *
         * Parameters: current index of Prop to move, desired index for Prop
         *
         * The moveProp method moves the Prop at the provided index to the desired index.
         */
        moveProp(curIndex, newIndex) {
            let prop = this._props.splice(curIndex, 1)[0]; //Store the prop we are moving, and remove it from its place in the _props array.
            let index; //Declare index variable.
            if (newIndex < 0 || newIndex >= this._props.length) { //If the new index is less than 0 or more than the _props array length:
                index = this._props.push(prop) - 1; //Add the prop to the end of the array.
                return index; //Return the index the prop was added at.
            }
            this._props.splice(newIndex, 0, prop); //Add the prop at the provided index.
            return newIndex; //Return the provided index.
        }
        /* CLEAR METHOD
         *
         * Parameters: None
         *
         * The clear method empties the _props array of all Props.
         */
        clear() {
            let arr = this._props;
            this._props = [];
            return arr;
        }
        /* UPDATE METHOD
         *
         * Parameters: milliseconds since last update cycle
         *
         * The update method executes the update cycle by calling beforeUpdate for every Prop, then
         * update for every Prop, then afterUpdate for every Prop, all while passing the time passed
         * since the last cycle into each hook.
         */
        update(dt) {
            this._props.forEach(prop => prop.beforeUpdate(dt));
            this._props.forEach(prop => prop.update(dt));
            this._props.forEach(prop => prop.afterUpdate(dt));
        }
        /* STARTUPDATECYCLE METHOD
         *
         * Parameters: minimum number of milliseconds to wait between cycles
         *
         * The startUpdateCycle performs all the operations needed to set a constant update cycle in motion
         * on this Stage. By default it executes the cycle every millisecond, but a different interval can be
         * specified.
         */
        startUpdateCycle(interval = 1) {
            let lastUpdate = Date.now(); //Set the "initial" last update time.
            window.setInterval(() => {
                let now = Date.now(); //Get current time
                let dt = now - lastUpdate; //Calculate time passed since last cycle from difference of current time and time at last cycle
                lastUpdate = now; //Set the last cycle time to now.
                this.update(dt); //Execute the update cycle.
            }, interval);
        }
    }
    $P.Stage = Stage;
})($P || ($P = {}));
/*=========*\
|  PROP.TS  |
\*=========*/
var $P;
(function ($P) {
    /* PROP CLASS
     *
     * The Prop class forms the base class for all game objects to inherit from. It exposes methods to manage movement and rotation,
     * and communicates with the framework's WebAssembly core via the Coord manipulations it performs. It also provides the structure
     * that all game object-like classes should follow, through the hook methods such as draw() and update() that are called during
     * important game cycles.
     */
    class Prop extends $P.Base {
        /* CONSTRUCTOR
         *
         * Parameters: starting position of the Prop, starting rotation of the Prop, bounds or "hitbox" of the Prop
         *
         * The Prop constructor sets all of the important position information, and fills in the screen position property of its rendering info with a default (0,0).
         */
        constructor(pos = new $P.Coord(0, 0), radians = 0, bounds = [new $P.Coord(-10, -10), new $P.Coord(10, -10), new $P.Coord(10, 10), new $P.Coord(-10, 10)]) {
            super();
            this.pos = pos;
            this.radians = radians;
            this.bounds = bounds;
            // PROPERTIES
            this._renderInfo = {}; //The rendering information for this Prop, such as its mesh and texture coordinates.
            this._type = "baseProp"; //The type of this class.
            this._renderInfo.screenPos = new $P.Pair(0, 0);
        }
        // STATIC METHODS
        /* TODEGREES METHOD
         *
         * Parameters: number to convert in radians
         *
         * The toDegrees method returns a conversion of the provided rotation, as described in radians, to degrees.
         */
        static toDegrees(radians) {
            return (radians / Math.PI) * 180;
        }
        /* TORADIANS METHOD
         *
         * Parameters: number to convert in degrees
         *
         * The toRadians method returns a conversion of the provided rotation, as described in degrees, to radians.
         */
        static toRadians(degrees) {
            return (degrees / 180) * Math.PI;
        }
        /* PERSECOND METHOD
         *
         * Parameters: value to convert to a per-second form
         *
         * The perSecond method takes in any number value as input, with the intention of using that value as a rate of change per second.
         * It then divides that value by 1000 and returns the result, making the returned number effectively a "per-millisecond" rate of change
         * that, when used inside of an update() method, provides the same rate of change as the original value.
         */
        static perSecond(val) {
            return val / 1000;
        }
        // GETTERS
        get x() {
            return this.pos.x;
        }
        get y() {
            return this.pos.y;
        }
        get degrees() {
            return $P.Prop.toDegrees(this.radians);
        }
        get renderInfo() {
            return this._renderInfo;
        }
        get index() {
            if (this.stage) {
                return this.stage.props.indexOf(this);
            }
            else {
                return -1;
            }
        }
        // SETTERS
        set x(x) {
            this.pos.x = x;
        }
        set y(y) {
            this.pos.y = y;
        }
        set degrees(degrees) {
            this.radians = Prop.toRadians(degrees);
        }
        // METHODS 
        /* SETPOS METHOD
         *
         * Parameters: x coordinate, y coordinate
         *
         * The setPos method sets both of the Prop's coordinate values at once.
         */
        setPos(x, y) {
            this.pos.x = x;
            this.pos.y = y;
        }
        /* MOVE METHOD
         *
         * Parameters: Coord describing how much to move in x and y direction.
         *
         * The move method performs a Coord add operation on the Prop's position Coord, using the provided Coord
         * as the values to add.
         */
        move(vect) {
            return this.pos = $P.Coord.add(this.pos, vect);
        }
        /* MOVEPR METHOD
         *
         * Parameters: Pair describing how much to move in x and y direction.
         *
         * The movePr method adds the provided Pair to the Prop's position Coord.
         */
        movePr(vect) {
            this.x += vect.x;
            this.y += vect.y;
            return this.pos;
        }
        /* MOVEEX METHOD
         *
         * Parameters: what to add to x coordinate, what to add to y coordinate
         *
         * The moveEx method adds the provided x coordinate to the Prop's x position, and adds the provided y coordinate to the
         * Prop's y position.
         */
        moveEx(x, y) {
            this.setPos(this.x + x, this.y + y);
            return this.pos;
        }
        /* ROTATE METHOD
         *
         * Parameters: how much to rotate Prop by in radians
         *
         * The rotate method rotates the Prop by the given amount in radians, ensuring that the resulting rotation does not
         * surpass 2PI radians or fall below 0 radians. The method then returns the resulting rotation.
         */
        rotate(radians) {
            this.radians += radians % 2 * Math.PI; //Rotate the prop by the amount, use modulo operator to ignore all multiples of 2PI (a complete rotation).
            if (this.radians <= 0) { //If resultant rotation is less than zero
                this.radians += 2 * Math.PI; //Add 2PI
            }
            else if (this.radians >= Math.PI) { //Otherwise, if resultant rotation is more than 2PI
                this.radians -= 2 * Math.PI; //Subtract 2PI.
            }
            return this.radians; //Return the new rotation.
        }
        /* ROTATEDEGREES METHOD
         *
         * Parameters: how much to rotate Prop by in degrees
         *
         * The rotateDegrees method converts the provided number to radians and then rotates the Prop by the resulting value. Afterward
         * it returns the resulting rotation, in degrees.
         */
        rotateDegrees(degrees) {
            return Prop.toDegrees(this.rotate(Prop.toRadians(degrees)));
        }
        /* REMOVE METHOD
         *
         * Parameters: whether to remove this Prop "quietly"
         *
         * The remove method removes this Prop from the stage it is currently in by calling removeProp on the Stage. It passes the specified
         * quiet value into the Stage's removeProp method.
         */
        remove(quiet) {
            return this.stage.removeProp(this, quiet);
        }
        // HOOK METHODS
        /* CLEANUP HOOK
         *
         * Parameters: whether or not to remove Prop "quietly"
         *
         * The cleanup hook is meant to be called when a Prop is removed from the Stage, but it could be called at any point if so desired.
         * The cleanup hook is a way of signaling to the Prop that it should perform any cleanup operations, or somehow convey its destruction, etc.
         */
        cleanup(quiet) { }
        /* INIT HOOK
         *
         * Parameters: whether or not to init prop "quietly"
         *
         * The init hook is meant to be called when a Prop is added to the Stage, but it could be called at any point if so desired.
         * The init hook is a way of signaling to the Prop that it should perform any initialization operations, or somehow convey its creation, etc.
         */
        init(quiet) { }
        /* BEFOREUPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         *
         * The beforeUpdate hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. beforeUpdate is called before update in the update cycle.
         */
        beforeUpdate(dt) { }
        /* UPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         *
         * The update hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. update is called after beforeUpdate and before afterUpdate in the
         * update cycle.
         */
        update(dt) {
            this.rotateDegrees(0.18 * dt);
        }
        /* AFTERUPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         *
         * The afterUpdate hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. afterUpdate is called after update in the update cycle.
         */
        afterUpdate(dt) { }
        /* DRAW HOOK
         *
         * Parameters: position relative to bottom-left of canvas, canvas the Prop is being drawn on, type of Camera that called the hook method
         *
         * The draw hook is meant to be called by Cameras that are drawing the Prop onto a Canvas. The Camera first calculates the Prop's position from
         * the bottom-left of the Canvas, then passes that information to the draw hook alongside the Canvas to draw on and the Camera's type. The Prop is
         * then meant to use this hook to set any important drawing properties (including its renderInfo, if so desired) before returning true to signify to the Camera that
         * the drawing process should continue as is default.
         *
         * If the draw hook returns false, the Camera leaves all the drawing up to the Prop and skips over it entirely.
         */
        draw(rel, camera) {
            this._renderInfo.vao = camera.canvas.getVertexArray(Prop.defaultMeshes.name); //Set the vao this prop renders with to the default "prop" VAO
            this._renderInfo.meshLength = Prop.defaultMeshes.triangles.length; //Set the meshLength to the length of the default "prop" mesh
            this._renderInfo.screenPos.set(rel.x, rel.y); //Set the desired screenPos to the position the Camera found for us
            this._renderInfo.rotation = [Math.sin(this.radians), Math.cos(this.radians)]; //Set the rotation coordinates based on the Prop's current rotation.
            return true; //Return true to tell Camera to draw this prop.
        }
    }
    // STATIC PROPERTIES
    Prop.defaultMeshes = {
        name: "prop",
        triangles: new Float32Array([-10, 10,
            -10, -10,
            10, -10,
            10, -10,
            10, 10,
            -10, 10]),
        texTriangles: new Float32Array([0, 0,
            0, 1,
            1, 1,
            1, 1,
            1, 0,
            0, 0])
    };
    $P.Prop = Prop;
})($P || ($P = {}));
/*===========*\
|  CAMERA.TS  |
\*===========*/
var $P;
(function ($P) {
    /* CANVAS CLASS
     *
     * Canvas class interfaces with the actual HTML <canvas> element and manages the WebGL context that will be used
     * to draw on that element.
     */
    class Canvas {
        /* CONSTRUCTOR
         *
         * Parameters: _id of HTML <canvas> element to manage, desired width of the canvas, desired height of the canvas.
         *
         * Gets and stores the <canvas> element to manage using _id, and then generates a WebGL2 context from that. This
         * constructor also creates a default (green) texture and compiles the default shader program. This constructor then
         * stores all of the information needed to pass the default meshes and data into WebGL (attribute and uniform locations, buffers).
         */
        constructor(_id, width = 200, height = 100) {
            this._id = _id;
            // PROPERTIES
            this._type = "canvas"; //The type of this class.
            this._loadedTextures = new Map(); //A Map storing associations between a loaded WebGLTexture and its number within WebGL.
            this._slotPtr = 0; //Pointer of slot for next loaded texture, provided there are no free slots.
            this._freeSlots = []; //Array of numbers representing freed texture slots.
            this._defaultAttribLocation = { position: undefined, texCoord: undefined }; //Stores the attribute locations for the Prop.js default WebGL inputs.
            this._defaultUniformLocation = { resolution: undefined, offset: undefined, scale: undefined, rotation: undefined, texture: undefined }; //Stores the uniform locations for the Prop.js default WebGL uniforms.
            this._defaultBuffer = { position: undefined, texCoord: undefined }; //Stores the Prop.js default WebGL buffers.
            this._el = document.getElementById(_id); //Store the DOM-represented <canvas> element by fetching it with _id.
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
        get id() {
            return this._id;
        }
        get width() {
            return this._el.width;
        }
        get height() {
            return this._el.height;
        }
        get type() {
            return "canvas";
        }
        get el() {
            return this._el;
        }
        get gl() {
            return this._gl;
        }
        get defaultProgram() {
            return this._defaultProgram;
        }
        get defaultTexture() {
            return this._defaultTexture;
        }
        get defaultAttribLocation() {
            return this._defaultAttribLocation;
        }
        get defaultBuffer() {
            return this._defaultBuffer;
        }
        get defaultUniformLocation() {
            return this._defaultUniformLocation;
        }
        get loadedTextures() {
            return this._loadedTextures;
        }
        // SETTERS
        set id(id) {
            this._id = id;
            this._el = document.getElementById(id);
            this._gl = this._el.getContext("webgl2");
        }
        set width(width) {
            this._el.width = width;
        }
        set height(height) {
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
        compileProgram(vertexSource, fragmentSource) {
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
        /* ASSIGNVERTEXARRAY METHOD
         *
         * Parameters: name of vertex array
         *
         * The assignVertexArray method will assign the provided vertexArrayObject to the provided name in the
         * vertexArrays map. If no vertexArrayObject is provided, the method will create a new one and assign it
         * to the provided name.
         */
        assignVertexArray(str, vertexArray = undefined) {
            this.vertexArrays.set(str, (vertexArray) ? vertexArray : this._gl.createVertexArray());
        }
        /* GETVERTEXARRAY METHOD
         *
         * Parameters: name of vertex array
         *
         * The getVertexArray method returns the vertexArrayObject under the provided name in the vertexArrays
         * map.
         */
        getVertexArray(name) {
            return this.vertexArrays[name];
        }
        /* VERTEXARRAYWRITE METHOD
         *
         * Parameters: vertexArrayObject to save reference, buffer to store data in, location to write to, data to write, writing mode, pointer info
         *
         * The vertexArrayWrite method will send the provided data to WebGL via the provided buffer and to the provided location,
         * while storing the Javascript-side reference in the provided vertexArrayObject. It will also set the drawing mode and pointer values if
         * specified.
         */
        vertexArrayWrite(vao, buffer, location, data, mode = this._gl.STATIC_DRAW, ptr = { size: 2, type: this._gl.FLOAT, normalize: false, stride: 0, offset: 0 }) {
            this._gl.bindVertexArray(vao); //Bind the specified vertexArrayObject
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer); //Bind the specified buffer
            this._gl.bufferData(this._gl.ARRAY_BUFFER, data, mode); //Write the provided data to the buffer.
            this._gl.enableVertexAttribArray(location); //Enable the vertex array.
            this._gl.vertexAttribPointer(location, ptr.size, ptr.type, ptr.normalize, ptr.stride, ptr.offset); //Set all the pointer info.
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
        loadDefaultMeshes(input) {
            if (Array.isArray(input)) { //If input is array
                input.forEach(meshes => {
                    this.assignVertexArray(meshes.name); //Create and assign a new vertexArrayObject with the name of this object
                    this.vertexArrayWrite(this.getVertexArray(meshes.name), //Write the position data using the defaults for position
                    this.defaultBuffer.position, this.defaultAttribLocation.position, meshes.triangles);
                    this.vertexArrayWrite(this.getVertexArray(meshes.name), //Write the texture coordinate data using the defaults for texture coordinates
                    this.defaultBuffer.texCoord, this.defaultAttribLocation.texCoord, meshes.texTriangles);
                });
            }
            else { //If input is single object
                this.assignVertexArray(input.name); //Do same as above, but only once.
                this.vertexArrayWrite(this.getVertexArray(input.name), this.defaultBuffer.position, this.defaultAttribLocation.position, input.triangles);
                this.vertexArrayWrite(this.getVertexArray(input.name), this.defaultBuffer.texCoord, this.defaultAttribLocation.texCoord, input.texTriangles);
            }
        }
        /* CREATESOLIDTEX METHOD
         *
         * Parameters: array of length 3 containing red, green, and blue values.
         *
         * The createSolidTex method creates a WebGL texture and writes one pixel of the provided color to the texture.
         * It then returns the texture.
         */
        createSolidTex(color) {
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
        createImageTex(src, texParam = { mag: undefined, min: undefined, s: undefined, t: undefined }, imageProps = { level: undefined, internalFormat: undefined, width: undefined, height: undefined, border: undefined, srcFormat: undefined, srcType: undefined }) {
            let texture = this._gl.createTexture(); //Create the texture
            let image = new Image(); //Create the image
            let gl = this._gl; //MESSY!!! Create a local-scope reference to this._gl so that it can be accessed from inside image.onload
            let imageProp = imageProps; //ALSO MESSY!! Another local-scope reassignment so that imageProps can be accessed inside image.onload
            gl.bindTexture(gl.TEXTURE_2D, texture); //Bind the texture as the current working texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, //Write a default solid color to the texture so it can render before the image loads.
            gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 0, 128, 255]));
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texParam.mag ? texParam.mag : gl.LINEAR); //Set the texture parameters if provided, otherwise use defaults.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texParam.min ? texParam.min : gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParam.s ? texParam.s : gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParam.t ? texParam.t : gl.REPEAT);
            image.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, texture); //Bind the texture again (in case current working texture has changed).
                gl.texImage2D(gl.TEXTURE_2D, //Write the image data to the texture, using image properties where provided and defaults otherwise.
                imageProp.level ? imageProp.level : 0, imageProp.internalFormat ? imageProp.internalFormat : gl.RGBA, imageProp.width ? imageProp.width : image.width, imageProp.height ? imageProp.height : image.height, imageProp.border ? imageProp.border : 0, imageProp.srcFormat ? imageProp.srcFormat : gl.RGBA, imageProp.srcType ? imageProp.srcType : gl.UNSIGNED_BYTE, image);
                gl.generateMipmap(gl.TEXTURE_2D); //Generate the mipmaps for the image.
            };
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
        loadTexture(texture) {
            if (this._loadedTextures.has(texture)) { //If the texture is already loaded
                return this.getSlot(texture); //Return the slot
            }
            let slot; //Declare slot variable
            if (this._freeSlots[0] !== undefined) { //If freed slots exist
                slot = this._freeSlots.pop(); //Use most recent freed slot
            }
            else { //Otherwise use next slot in line
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
        getSlot(texture) {
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
        freeTexture(texture) {
            let slot = this.getSlot(texture); //Get slot of specified texture.
            this._freeSlots.push(slot); //Add the slot to array of free slots.
            return slot; //Return the freed slot.
        }
    }
    // STATIC PROPERTIES
    Canvas.defaultShaderSource = {
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
    };
    $P.Canvas = Canvas;
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
    class Camera extends $P.Base {
        /* CONSTRUCTOR
         *
         * Parameters: the stage to draw from, the canvas to draw on, the position on the stage that the bottom left of the camera sits, the bottom left of the camera's
         *     drawing bounds on the canvas, the dimensions of the camera on the canvas, how much the camera scales the image before drawing, whether or not to clip the output
         */
        constructor(stage, canvas, stagePos = new $P.Coord(0, 0), canvasPos = new $P.Coord(0, 0), dimensions = new $P.Coord(200, 100), scale = new $P.Coord(1, 1), clip = true) {
            super(); //Call Base constructor
            this.stage = stage;
            this.canvas = canvas;
            this.stagePos = stagePos;
            this.canvasPos = canvasPos;
            this.dimensions = dimensions;
            this.scale = scale;
            this.clip = clip;
            // PROPERTIES
            this._type = "baseCamera"; //The type of this class.
            this._back = [0, 0, 0, 0]; //The background color this camera will draw with.
            this.gl.clearColor(this._back[0], this._back[1], this._back[2], this._back[3]); //Set clearColor to default background color.
        }
        // GETTERS
        get gl() {
            return this.canvas.gl;
        }
        get width() {
            return this.dimensions[0];
        }
        get height() {
            return this.dimensions[1];
        }
        get back() {
            return this._back;
        }
        // SETTERS
        set width(width) {
            this.dimensions[0] = width;
        }
        set height(height) {
            this.dimensions[1] = height;
        }
        set back(arr) {
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
        center(pos) {
            this.stagePos.x = pos[0] - this.dimensions.x / 2;
            this.stagePos.y = pos[1] - this.dimensions.y / 2;
        }
        /* CENTEREX METHOD
         *
         * Parameters: x coordinate of point to center on, y coordinate of point to center on
         *
         * Same as center method, but x and y coordinates are split up. Unnecessary?
         */
        centerEx(x, y) {
            this.center([x, y]);
        }
        /* RESIZE METHOD
         *
         * Parameters: Pair or array of length 2 describing desired width and height of the camera.
         *
         * The resize method sets the width and height of the Camera on the Canvas to the provided values at once.
         */
        resize(dimensions) {
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
            this.stage.props.forEach(prop => {
                let rel = $P.Coord.subtract($P.Coord.multiply(prop.pos.copy(), this.scale), this.stagePos); //Calculate Prop's position on the canvas
                if (prop.draw(rel, this)) { //Call Prop's draw method, continue if returns true
                    let program = (prop.renderInfo.program) ? prop.renderInfo.program : this.canvas.defaultProgram;
                    let vao = (prop.renderInfo.vao) ? prop.renderInfo.vao : this.canvas.getVertexArray(prop.type);
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
    $P.Camera = Camera;
})($P || ($P = {}));
