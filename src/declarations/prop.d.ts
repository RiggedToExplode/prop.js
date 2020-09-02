interface View {
    screenPos?: $P.Pair;
    rotation?: number[];
    vao?: string;
    meshLength?: number;
    program?: WebGLProgram;
    texture?: WebGLTexture;
}
interface Meshes {
    triangles: Float32Array;
    texTriangles: Float32Array;
}
declare namespace $P {
    class Prop extends Base {
        pos: Coord;
        radians: number;
        bounds: Coord[];
        static toDegrees(radians: number): number;
        static toRadians(degrees: number): number;
        static perSecond(val: number): number;
        static defaultMeshes: Meshes;
        private _view;
        protected _type: string;
        stage: Stage;
        constructor(pos?: Coord, radians?: number, bounds?: Coord[]);
        set x(x: number);
        set y(y: number);
        set degrees(degrees: number);
        get x(): number;
        get y(): number;
        get degrees(): number;
        get view(): View;
        get index(): number;
        setPos(x: number, y: number): void;
        move(vect: Coord): Coord;
        moveEx(x: number, y: number): Coord;
        rotate(radians: number): number;
        rotateDegrees(degrees: number): number;
        remove(quiet: boolean): void;
        init(quiet: boolean): void;
        beforeUpdate(dt: number): void;
        update(dt: number): void;
        afterUpdate(dt: number): void;
        draw(rel: Coord, type: string): boolean;
    }
}
