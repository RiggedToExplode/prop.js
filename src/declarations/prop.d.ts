interface RenderInfo {
    program?: WebGLProgram;
    vao?: string;
    meshLength?: number;
    texture?: WebGLTexture;
    screenPos?: $P.Pair;
    rotation?: number[];
}
declare namespace $P {
    class Prop extends Base {
        pos: Coord;
        radians: number;
        bounds: Coord[];
        static defaultMeshes: MeshInfo;
        static toDegrees(radians: number): number;
        static toRadians(degrees: number): number;
        static perSecond(val: number): number;
        protected _renderInfo: RenderInfo;
        protected _type: string;
        stage: Stage;
        constructor(pos?: Coord, radians?: number, bounds?: Coord[]);
        get x(): number;
        get y(): number;
        get degrees(): number;
        get renderInfo(): RenderInfo;
        get index(): number;
        set x(x: number);
        set y(y: number);
        set degrees(degrees: number);
        setPos(x: number, y: number): void;
        move(vect: Coord): Coord;
        movePr(vect: Pair): Coord;
        moveEx(x: number, y: number): Coord;
        rotate(radians: number): number;
        rotateDegrees(degrees: number): number;
        remove(quiet: boolean): number;
        cleanup(quiet: boolean): void;
        init(quiet: boolean): void;
        beforeUpdate(dt: number): void;
        update(dt: number): void;
        afterUpdate(dt: number): void;
        draw(rel: Coord, canvas: Canvas, type: string): boolean;
    }
}
