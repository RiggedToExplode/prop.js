declare namespace $P {
    class Prop extends Base {
        pos: Coord;
        radians: number;
        bounds: Coord[];
        static toDegrees(radians: number): number;
        static toRadians(degrees: number): number;
        static perSecond(val: number): number;
        stage: Stage;
        view: {
            screenPos: Pair;
            rotation: number[];
            triangles: Float32Array;
            texTriangles: Float32Array;
            texture: WebGLTexture;
        };
        constructor(pos?: Coord, radians?: number, bounds?: Coord[]);
        set x(x: number);
        set y(y: number);
        set degrees(degrees: number);
        get x(): number;
        get y(): number;
        get degrees(): number;
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
        draw(rel: Coord): boolean;
    }
}
