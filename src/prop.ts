/*=========*\
|  PROP.TS  |
\*=========*/

/* SEE ALSO:
 * 
 * base.ts for its definition of the Coord and Pair classes
 * 
 * stage.ts for its definition of the Stage class
 * 
 * camera.ts for its definition of the Camera class
 */

interface RenderInfo {
    program?: WebGLProgram,
    vao?: string,
    meshLength?: number,
    texture?: WebGLTexture,
    screenPos?: $P.Pair,
    rotation?: number[]
}

namespace $P {
    /* PROP CLASS
     *
     * The Prop class forms the base class for all game objects to inherit from. It exposes methods to manage movement and rotation,
     * and communicates with the framework's WebAssembly core via the Coord manipulations it performs. It also provides the structure
     * that all game object-like classes should follow, through the hook methods such as draw() and update() that are called during
     * important game cycles.
     */
    export class Prop extends Base {
        // STATIC PROPERTIES
        static defaultMeshes: MeshInfo = { //The default MeshInfo object for the Prop object (a triangle).
            name: "prop",
            triangles: new Float32Array([-10, 10,
                                          -10, -10,
                                          10, -10,
                                          10, -10,
                                          10, 10,
                                          -10, 10]),
            texTriangles: new Float32Array([0, 0,
                                            0, 1,
                                            1, 1,
                                            1, 1,
                                            1, 0,
                                            0, 0])
        }


        // STATIC METHODS
        /* TODEGREES METHOD
         * 
         * Parameters: number to convert in radians
         * 
         * The toDegrees method returns a conversion of the provided rotation, as described in radians, to degrees.
         */
        static toDegrees(radians: number): number {
            return (radians / Math.PI) * 180;
        }

        /* TORADIANS METHOD
         *
         * Parameters: number to convert in degrees
         * 
         * The toRadians method returns a conversion of the provided rotation, as described in degrees, to radians.
         */
        static toRadians(degrees: number): number {
            return (degrees / 180) * Math.PI;
        }

        /* PERSECOND METHOD
         *
         * Parameters: value to convert to a per-second form
         * 
         * The perSecond method takes in any number value as input, with the intention of using that value as a rate of change per second.
         * It then divides that value by 1000 and returns the result, making the returned number effectively a "per-millisecond" rate of change
         * that, when used inside of an update() method, provides the same rate of change as the original value.
         */
        static perSecond(val: number): number {
            return val / 1000;
        }


        // PROPERTIES
        protected _renderInfo: RenderInfo = {}; //The rendering information for this Prop, such as its mesh and texture coordinates.

        protected _type: string = "baseProp"; //The type of this class.

        public stage: Stage; //The stage this Prop is on.

        /* CONSTRUCTOR
         *
         * Parameters: starting position of the Prop, starting rotation of the Prop, bounds or "hitbox" of the Prop
         * 
         * The Prop constructor sets all of the important position information, and fills in the screen position property of its rendering info with a default (0,0).
         */
        constructor(public pos: Coord = new Coord(0, 0), public radians: number = 0, public bounds: Coord[] = [new Coord(-10, -10), new Coord(10, -10), new Coord(10, 10), new Coord(-10, 10)]) {
            super();

            this._renderInfo.screenPos = new Pair(0, 0);
        }
        
        // GETTERS
        get x(): number { //Get x coordinate. Settable.
            return this.pos.x;
        }
        
        get y(): number { //Get y coordinate. Settable.
            return this.pos.y;
        }
        
        get degrees(): number { //Get rotation in degrees. Settable.
            return $P.Prop.toDegrees(this.radians);
        }

        get renderInfo(): RenderInfo { //Get this Prop's renderInfo. Unsettable.
            return this._renderInfo;
        }
        
        get index(): number { //Get index of this prop in the parent stage's props array. Unsettable.
            if (this.stage) {
                return this.stage.props.indexOf(this);
            } else {
                return -1;
            }
        }


        // SETTERS
        set x(x: number) { //Set x coordinate. Gettable.
            this.pos.x = x;
        }
        
        set y(y: number) { //Set y coordinate. Gettable.
            this.pos.y = y;
        }
        
        set degrees(degrees: number) { //Set rotation of this Prop using degrees. Gettable.
            this.radians = Prop.toRadians(degrees);
        }


        // METHODS 
        /* SETPOS METHOD
         *
         * Parameters: x coordinate, y coordinate
         * 
         * The setPos method sets both of the Prop's coordinate values at once.
         */
        setPos(x: number, y: number) {
            this.pos.x = x;
            this.pos.y = y;
        }
        
        /* MOVE METHOD
         *
         * Parameters: Coord describing how much to move in x and y direction.
         * 
         * The move method performs a Coord add operation on the Prop's position Coord, using the provided Coord
         * as the values to add.
         */
        move(vect: Coord): Coord {
            return this.pos = Coord.add(this.pos, vect);
        }
        
        /* MOVEPR METHOD
         *
         * Parameters: Pair describing how much to move in x and y direction.
         * 
         * The movePr method adds the provided Pair to the Prop's position Coord.
         */
        movePr(vect: Pair): Coord {
            this.x += vect.x;
            this.y += vect.y;
            return this.pos;
        }

        /* MOVEEX METHOD
         *
         * Parameters: what to add to x coordinate, what to add to y coordinate
         * 
         * The moveEx method adds the provided x coordinate to the Prop's x position, and adds the provided y coordinate to the
         * Prop's y position.
         */
        moveEx(x: number, y: number): Coord {
            this.setPos(this.x + x, this.y + y);
            return this.pos;
        }

        /* ROTATE METHOD
         * 
         * Parameters: how much to rotate Prop by in radians
         * 
         * The rotate method rotates the Prop by the given amount in radians, ensuring that the resulting rotation does not
         * surpass 2PI radians or fall below 0 radians. The method then returns the resulting rotation.
         */
        rotate(radians: number): number {
            this.radians += radians % 2 * Math.PI; //Rotate the prop by the amount, use modulo operator to ignore all multiples of 2PI (a complete rotation).

            if (this.radians <= 0) { //If resultant rotation is less than zero
                this.radians += 2 * Math.PI; //Add 2PI
            } else if (this.radians >= Math.PI) { //Otherwise, if resultant rotation is more than 2PI
                this.radians -= 2 * Math.PI; //Subtract 2PI.
            }

            return this.radians; //Return the new rotation.
        }

        /* ROTATEDEGREES METHOD
         *
         * Parameters: how much to rotate Prop by in degrees
         * 
         * The rotateDegrees method converts the provided number to radians and then rotates the Prop by the resulting value. Afterward
         * it returns the resulting rotation, in degrees.
         */
        rotateDegrees(degrees: number): number {
            return Prop.toDegrees(this.rotate(Prop.toRadians(degrees)));
        }
        
        /* REMOVE METHOD
         *
         * Parameters: whether to remove this Prop "quietly"
         * 
         * The remove method removes this Prop from the stage it is currently in by calling removeProp on the Stage. It passes the specified
         * quiet value into the Stage's removeProp method.
         */
        remove(quiet: boolean) {
            return this.stage.removeProp(this, quiet);
        }

        // HOOK METHODS

        /* CLEANUP HOOK
         *
         * Parameters: whether or not to remove Prop "quietly"
         * 
         * The cleanup hook is meant to be called when a Prop is removed from the Stage, but it could be called at any point if so desired.
         * The cleanup hook is a way of signaling to the Prop that it should perform any cleanup operations, or somehow convey its destruction, etc.
         */
        cleanup(quiet: boolean) {}

        /* INIT HOOK
         *
         * Parameters: whether or not to init prop "quietly"
         * 
         * The init hook is meant to be called when a Prop is added to the Stage, but it could be called at any point if so desired.
         * The init hook is a way of signaling to the Prop that it should perform any initialization operations, or somehow convey its creation, etc.
         */
        init(quiet: boolean) {}

        /* BEFOREUPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         * 
         * The beforeUpdate hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. beforeUpdate is called before update in the update cycle.
         */
        beforeUpdate(dt: number) {}

        /* UPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         * 
         * The update hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. update is called after beforeUpdate and before afterUpdate in the 
         * update cycle.
         */
        update(dt: number) {
            this.rotateDegrees(0.18 * dt);
        }

        /* AFTERUPDATE HOOK
         *
         * Parameters: milliseconds since last update cycle
         * 
         * The afterUpdate hook is meant to be called for every Prop as much as possible (in what is called the update cycle), in order for the Props to move,
         * observe their surroundings, perform physics calculations, or anything else. afterUpdate is called after update in the update cycle.
         */
        afterUpdate(dt: number) {}

        /* DRAW HOOK
         *
         * Parameters: position relative to bottom-left of canvas, canvas the Prop is being drawn on, type of Camera that called the hook method
         * 
         * The draw hook is meant to be called by Cameras that are drawing the Prop onto a Canvas. The Camera first calculates the Prop's position from
         * the bottom-left of the Canvas, then passes that information to the draw hook alongside the Canvas to draw on and the Camera's type. The Prop is
         * then meant to use this hook to set any important drawing properties (including its renderInfo, if so desired) before returning true to signify to the Camera that
         * the drawing process should continue as is default.
         * 
         * If the draw hook returns false, the Camera leaves all the drawing up to the Prop and skips over it entirely.
         */
        draw(rel: Coord, camera: Camera) {
            this._renderInfo.vao = camera.canvas.getDataStore(Prop.defaultMeshes.name).vao; //Set the vao this prop renders with to the default "prop" VAO
            this._renderInfo.meshLength = Prop.defaultMeshes.triangles.length; //Set the meshLength to the length of the default "prop" mesh
            this._renderInfo.screenPos.set(rel.x, rel.y); //Set the desired screenPos to the position the Camera found for us
            this._renderInfo.rotation = [Math.sin(this.radians), Math.cos(this.radians)]; //Set the rotation coordinates based on the Prop's current rotation.

            return true; //Return true to tell Camera to draw this prop.
        }
    }
}