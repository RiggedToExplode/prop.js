/*=========*\
|  BASE.TS  |
\*=========*/

/* SEE ALSO:
 *
 * assembly.ts for definition of coreModule (used by Coord) and its respective
 *      class 'AssemblyModule,' as well as coreMemory and its respective class
 *      'BlockMemoryManager'.
 */

namespace $P {
    /* BASE CLASS
     * 
     * Base class for most other Prop.js classes to inherit from. Automatically
     * assigns unique IDs based on time and random string.
     */
    export class Base {

        /* genUID Static Method
         * 
         * Parameters: None
         * 
         * Generates unique ID based on epoch time and a random number, used to
         * automatically assign UIDs to objects.
         */
        static genUID(): string {
            return Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
        }


        // PROPERTIES
        private _uid: string; //Private _uid property to store UID string.

        protected _type: string = "base"; //Protected _type string to store the type of this class.


        /* CONSTRUCTOR
         * 
         * Parameters: None
         */
        constructor() { this._uid = Base.genUID(); } //Generate new UID and assign to _uid property.


        // GETTERS
        get uid(): string { //Get _uid as public string. Unsettable.
            return this._uid;
        }

        get type(): string { //Get _type as public string. Unsettable.
            return this._type;
        }
    }

    /* COORD CLASS
     * 
     * Class to store two-dimensional coordinate pairs in WebAssembly and manipulate
     * them using functions written in C or other compiled languages.
     */
    export class Coord {

        /* add Static Method
         * 
         * Parameters: First Coord, Second Coord
         * 
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'add'.
         * WebAssembly 'add' adds the two Coords together, storing the result in the first Coord.
         */
        static add(coord1: Coord, coord2: Coord) {
            coreModule.exports.add(coord1.ptr, coord2.ptr);
            return coord1;
        }

        /* subtract Static Method
         * 
         * Parameters: First Coord to add, Second Coord
         * 
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'subtract'.
         * WebAssembly 'subtract' subtracts second Coord from first Coord, storing the result in the first Coord.
         */
        static subtract(coord1: Coord, coord2: Coord) {
            coreModule.exports.subtract(coord1.ptr, coord2.ptr);
            return coord1;
        }

        /* factor Static Method
         * 
         * Parameters: Coord to multiply, Factor of multiplication
         * 
         * Passes provided Coord pointer and factor value into Prop.js standard WebAssembly function 'factor'.
         * WebAssembly 'factor' multiplies both Coord values by 'val', storing the result in the Coord.
         */
        static factor(coord: Coord, val: number) {
            coreModule.exports.factor(coord.ptr, val);
            return coord;
        }

        /* multiply Static Method
         * 
         * Parameters: First Coord, Second Coord
         * 
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'multiply'.
         * WebAssembly 'multiply' multiplies first and second Coords together, storing the result in the first Coord.
         */
        static multiply(coord1: Coord, coord2: Coord) {
            coreModule.exports.multiply(coord1.ptr, coord2.ptr);
            return coord1;
        }

        /* divisor Static Method
         * 
         * Parameters: Coord to divide, Divisor
         * 
         * Passes provided Coord pointer and divisor value into Prop.js standard WebAssembly function 'divisor'.
         * WebAssembly 'divisor' divides both Coord values by 'val', storing the result in the first Coord.
         */
        static divisor(coord: Coord, val: number) {
            coreModule.exports.divisor(coord.ptr, val);
            return coord;
        }
        
        /* divide Static Method
         *  
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'divide'.
         * WebAssembly 'divide' divides first Coord by second Coord, storing the result in the first Coord.
         */
        static divide(coord1: Coord, coord2: Coord) {
            coreModule.exports.divide(coord1.ptr, coord2.ptr);
            return coord1;
        }

        /* dist Static Method
         *   
         * Parameters: First Coord, Second Coord
         *
         * Passes provided Coord pointers into Prop.js standard WebAssembly function 'dist'.
         * WebAssembly 'dist' finds distance between the two points described by the two Coords, and returns the value.
         */
        static dist(coord1: Coord, coord2: Coord) {
            return coreModule.exports.dist(coord1.ptr, coord2.ptr);
        }


        // PROPERTIES
        private _loc: number; //Index of the first value (x value) of this Coord in the MemoryManager.arr TypedArray.
        private _yLoc: number; //Index of the first value (y value) of this Coord in MemoryManager.arr TypedArray.
        private _ptr: number; //Address of the first value (x value) of this Coord in memory for WebAssembly.

        private _type: string = "coord"; //Private _type string to store the type of this class.


        /* CONSTRUCTOR
         * 
         * Parameters: X Coordinate, Y Coordinate
         * 
         * This constructor takes in two numbers to represent the X and Y coordinates of the point meant to be
         * described by the Coord, and then puts those points into WebAssembly memory by writing them with 
         * coreMemoryManager. The constructor then stores the indices of the X and Y points in the
         * TypedArray as _loc and _yLoc, and uses those indices to calculate a pointer to the Coord.
         */
        constructor (x: number, y: number) {
            this._loc = coreMemoryManager.writeBlock([x, y]); //Write coordinates into block memory and get the index of X back.

            this._yLoc = this._loc + 1; //Find the index of the y value simply by adding 1.

            this._ptr = this._loc * coreMemoryManager.arr.BYTES_PER_ELEMENT; //Find and store the address of this Coord (by first value) in memory.
        }


        // GETTERS
        get x(): number { //Get the x value of this Coord by querying memory. Settable.
            return coreMemoryManager.query(this._loc);
        }
        get y(): number { //Get the y value of this Coord by querying memory. Settable.
            return coreMemoryManager.query(this._yLoc);
        }

        get ptr(): number { //Get the address of this Coord in memory. Unsettable.
            return this._ptr;
        }

        get type(): string { //Get the type of this class. Unsettable.
            return this._type;
        }


        // SETTERS
        set x(val: number) { //Set the x value of this Coord by writing to its location in memory. Gettable.
            coreMemoryManager.write(val, this._loc);
        }
        set y(val: number) { //Set the y value of this Coord by writing to its location in memory. Gettable.
            coreMemoryManager.write(val, this._yLoc);
        }


        /* set Method
         * 
         * Parameters: X Coordinate or Array representing X and Y Coordinates, Y Coordinate
         * 
         * Simultaneously sets the X and Y coordinates of this Coord in one function call.
         */
        set(x: number | number[], y: number = undefined) {
            if (Array.isArray(x)) { //If first parameter is array.
                this.x = x[0]; //Assign X from first element in array.
                this.y = x[1]; //Assign Y from second element in array.
            } else {
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
        copy(): Coord {
            return new Coord(this.x, this.y);
        }

        /* toArr Method
         * 
         * Parameters: None
         * 
         * Returns a new Array of two elements, where the first element is the X coordinate
         * of this Coord, and the second element is the Y element of this Coord.
         */
        toArr(): number[] { //Return this Coord in the form of an array with two numbers.
            return [this.x, this.y];
        }

        /* toPair Method
         * 
         * Parameters: None
         * 
         * Returns a new Pair with the same coordinate data as this Coord.
         */
        toPair(): Pair {
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
            coreMemoryManager.removeBlock(this._loc);
        }
    }

    /* PAIR CLASS
     * 
     * Class to store coordinate pairs, accesible via x and y getters and setters or 'virtual' array
     * indices.
     */
    export class Pair {

        /* add Static Method
         * 
         * Parameters: First Pair, Second Pair
         * 
         * Adds coordinate pairs of first and second Pairs together, returning a new Pair with the results.
         */
        static add(pair1: Pair | number[], pair2: Pair | number[]) { //Add two two Pair together and return the result.
            return new Pair(pair1[0] + pair2[0], pair1[1] + pair2[1]);
        }

        /* subtract Static Method
         * 
         * Parameters: First Pair, Second Pair
         * 
         * Subtracts coordinate pair of second Pair from coordinate pair of first Pair, returning a new Pair
         * with the results.
         */
        static subtract(pair1: Pair | number[], pair2: Pair | number[]) { //Subtract second Pair from first Pair and return the result.
            return new Pair(pair1[0] - pair2[0], pair1[1] - pair2[1]);
        }

        /* factor Static Method
         * 
         * Parameters: Pair to multiply, Multiplication factor
         * 
         * Multiply both coordinate values of provided Pair by provided factor, returning a new Pair with the results.
         */
        static factor(pair: Pair | number[], factor: number) { //Multiply the Pair by a factor and return the result.
            return new Pair(pair[0] * factor, pair[1] * factor)
        }

        /* multiply Static Method
         *
         * Parameters: First Pair, Second Pair
         * 
         * Multiply the coordinate pairs of first Pair and second Pair together, returning a new Pair with the results.
         */
        static multiply(pair1: Pair | number[], pair2: Pair | number[]) { //Multiply two Pairs by each other and return the result.
            return new Pair(pair1[0] * pair2[0], pair1[1] * pair2[1]);
        }

        /* divisor Static Method
         * 
         * Parameters: Pair to divide, Divisor
         * 
         * Divide both values of the provided Pair by provided divisor value, returning a new Pair with the results.
         */
        static divisor(pair: Pair | number[], divisor: number) { //Divide a Pair by a factor and return the result.
            return new Pair(pair[0] / divisor, pair[1] / divisor);
        }
        
        /* divide Static Method
         *
         * Parameters: First Pair, Second Pair
         * 
         * Divide the coordinate pair of first Pair by coordinate pair of second Pair, returning a new Pair with the results.
         */
        static divide(pair1: Pair | number[], pair2: Pair | number[]) { //Divide two Pairs by each other and return the result.
            return new Pair(pair1[0] / pair2[0], pair1[1] / pair2[1]);
        }

        /* dist Static Method
         * 
         * Parameters: First Pair, Second Pair
         * 
         * Return distance between point described by first Pair to point described by second Pair.
         */
        static dist(pair1: Pair | number[], pair2: Pair | number[]) { //Find the distance between two Pairs.
            return Math.sqrt(Math.pow(pair2[0] - pair1[0], 2) + Math.pow(pair2[1] - pair1[1], 2));
        }


        // PROPERTIES
        private _type: string = "pair"; //Private _type string to store the type of this class.


        /* CONSTRUCTOR
         *
         * Parameters: X Coordinate, Y Coordinate
         * 
         * Assigns provided X and Y values to the x and y properties of this pair.
         */
        constructor (public x: number, public y: number) {
        }


        // GETTERS
        get 0(): number { //Get X coordinate from virtual array index. Settable.
            return this.x;
        }

        get 1(): number { //Get Y coordinate from virtual array index. Settable.
            return this.y
        }

        get type(): string { //Get the type of this class. Unsettable.
            return this._type;
        }


        // SETTERS
        set 0(x: number) { //Set the X coordinate via a virtual array index. Gettable.
            this.x = x;
        }

        set 1(y: number) { //Set the Y coordinate via a virtual array index. Gettable.
            this.y = y;
        }


        /* set Method
         * 
         * Parameters: X Coordinate or Array representing X and Y Coordinates, Y Coordinate
         * 
         * Simultaneously sets the X and Y coordinates of this Pair in one function call.
         */
        set(x: number | number[], y: number = undefined) { //Set both x and y properties with either an Array or seperate values.
            if (Array.isArray(x)) {
                this.x = x[0];
                this.y = x[1];
            } else {
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
        copy(): Pair {
            return new Pair(this.x, this.y);
        }

        /* toArr Method
         * 
         * Parameters: None
         * 
         * Returns a new Array where the first element is the X coordinate of this pair, and the
         * second index is the Y coordinate of this pair.
         */
        toArr(): number[] {
            return [this.x, this.y];
        }

        /* toCoord Method
         * 
         * Parameters: None
         * 
         * Returns a new Coord with the same coordinate values as this Pair.
         */
        toCoord(): Coord {
            return new Coord(this.x, this.y);
        }
    }
}