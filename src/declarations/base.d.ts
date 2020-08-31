declare namespace $P {
    class Base {
        static genUID(): string;
        private _uid;
        constructor();
        get uid(): string;
    }
    class Coord {
        static addCoords(coord1: Coord, coord2: Coord): Coord;
        static subCoords(coord1: Coord, coord2: Coord): Coord;
        static multCoord(coord: Coord, factor: number): Coord;
        static multCoords(coord1: Coord, coord2: Coord): Coord;
        static divCoord(coord: Coord, factor: number): Coord;
        static divCoords(coord1: Coord, coord2: Coord): Coord;
        static dist(coord1: Coord, coord2: Coord): any;
        private ptr;
        private loc;
        private yLoc;
        constructor(x: number, y: number);
        get x(): number;
        get y(): number;
        set x(val: number);
        set y(val: number);
        copy(): Coord;
        toArr(): number[];
        remove(): void;
    }
}
