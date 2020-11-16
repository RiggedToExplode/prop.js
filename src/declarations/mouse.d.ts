/// <reference path="../declarations/glob.d.ts" />
declare namespace $P {
    var Mouse: {
        left: boolean;
        middle: boolean;
        right: boolean;
        pos: Coord;
        relPos(cam: Camera): Coord;
        relX(cam: Camera): number;
        relY(cam: Camera): number;
        init: Function;
    };
}
