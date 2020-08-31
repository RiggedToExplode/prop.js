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
}