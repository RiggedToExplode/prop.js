namespace $P {
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
        static add(coord1: Coord, coord2: Coord) { //Add two two Coords together and store the result in the first Coord.
            coreModule.exports.add(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static subtract(coord1: Coord, coord2: Coord) { //Subtract second Coord from first Coord and store the result in the first Coord.
            coreModule.exports.subtract(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static factor(coord: Coord, factor: number) { //Multiply the Coord by factor, storing the result in the Coord.
            coreModule.exports.factor(coord.ptr, factor);
            return coord;
        }

        static multiply(coord1: Coord, coord2: Coord) { //Multiply two Coords by each other, storing the result in the first Coord.
            coreModule.exports.multiply(coord1.ptr, coord2.ptr);
            return coord1;
        }

        static divisor(coord: Coord, factor: number) { //Divide a Coord by a factor, storing the result in the Coord.
            coreModule.exports.divisor(coord.ptr, factor);
            return coord;
        }
        
        static divide(coord1: Coord, coord2: Coord) { //Divide two Coords by each other, storing the result in the first Coord.
            coreModule.exports.divide(coord1.ptr, coord2.ptr);
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

        toPair(): Pair { //Turn this Coord into a new Pair and return the Pair
            return new Pair(this.x, this.y);
        }

        remove() { //Remove this Coord, thus freeing up its memory.
            coreMemoryManager.removeBlock(this.loc);
        }
    }

    class Pair {
        static add(pair1: Pair | number[], pair2: Pair | number[]) { //Add two two Pair together and return the result.
            return new Pair(pair1[0] + pair2[0], pair1[1] + pair2[1]);
        }

        static subtract(pair1: Pair | number[], pair2: Pair | number[]) { //Subtract second Pair from first Pair and return the result.
            return new Pair(pair1[0] - pair2[0], pair1[1] - pair2[1]);
        }

        static factor(pair: Pair | number[], factor: number) { //Multiply the Pair by a factor and return the result.
            return new Pair(pair[0] * factor, pair[1] * factor)
        }

        static multiply(pair1: Pair | number[], pair2: Pair | number[]) { //Multiply two Pairs by each other and return the result.
            return new Pair(pair1[0] * pair2[0], pair1[1] * pair2[1]);
        }

        static divisor(pair: Pair | number[], divisor: number) { //Divide a Pair by a factor and return the result.
            return new Pair(pair[0] / divisor, pair[1] / divisor);
        }
        
        static divide(pair1: Pair | number[], pair2: Pair | number[]) { //Divide two Pairs by each other and return the result.
            return new Pair(pair1[0] / pair2[0], pair1[1] / pair2[1]);
        }

        static dist(pair1: Pair | number[], pair2: Pair | number[]) { //Find the distance between two Pairs.
            return Math.sqrt(Math.pow(pair2[0] - pair1[0], 2) + Math.pow(pair2[1] - pair1[1], 2));
        }


        constructor (public x: number, public y: number) {
        }


        set 0(x: number) {
            this.x = x;
        }

        set 1(y: number) {
            this.y = y;
        }

        get 0(): number {
            return this.x;
        }

        get 1(): number {
            return this.y
        }


        copy(): Pair {
            return new Pair(this.x, this.y);
        }

        toArr(): number[] {
            return [this.x, this.y];
        }

        toCoord(): Coord {
            return new Coord(this.x, this.y);
        }
    }
}