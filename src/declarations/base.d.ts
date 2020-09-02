declare namespace $P {
    class Base {
        static genUID(): string;
        private _uid;
        protected _type: string;
        constructor();
        get uid(): string;
        get type(): string;
    }
    class Coord {
        static add(coord1: Coord, coord2: Coord): Coord;
        static subtract(coord1: Coord, coord2: Coord): Coord;
        static factor(coord: Coord, factor: number): Coord;
        static multiply(coord1: Coord, coord2: Coord): Coord;
        static divisor(coord: Coord, factor: number): Coord;
        static divide(coord1: Coord, coord2: Coord): Coord;
        static dist(coord1: Coord, coord2: Coord): any;
        private _ptr;
        private _loc;
        private _yLoc;
        private _type;
        constructor(x: number, y: number);
        get x(): number;
        get y(): number;
        get ptr(): number;
        get type(): string;
        set x(val: number);
        set y(val: number);
        set(x: number | number[], y?: number): void;
        copy(): Coord;
        toArr(): number[];
        toPair(): Pair;
        remove(): void;
    }
    class Pair {
        x: number;
        y: number;
        static add(pair1: Pair | number[], pair2: Pair | number[]): Pair;
        static subtract(pair1: Pair | number[], pair2: Pair | number[]): Pair;
        static factor(pair: Pair | number[], factor: number): Pair;
        static multiply(pair1: Pair | number[], pair2: Pair | number[]): Pair;
        static divisor(pair: Pair | number[], divisor: number): Pair;
        static divide(pair1: Pair | number[], pair2: Pair | number[]): Pair;
        static dist(pair1: Pair | number[], pair2: Pair | number[]): number;
        private _type;
        constructor(x: number, y: number);
        set 0(x: number);
        set 1(y: number);
        get 0(): number;
        get 1(): number;
        get type(): string;
        set(x: number | number[], y?: number): void;
        copy(): Pair;
        toArr(): number[];
        toCoord(): Coord;
    }
}
