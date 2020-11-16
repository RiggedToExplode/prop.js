/// <reference path="../declarations/glob.d.ts" />
declare namespace $P {
    var Mouse: {
        left: boolean;
        middle: boolean;
        right: boolean;
        pos: Coord;
        relPos: (cam: any) => $P.Coord;
        relX: (cam: any) => number;
        relY: (cam: any) => number;
    };
}
