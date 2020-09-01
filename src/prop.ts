namespace $P {
    export class Prop extends Base { //Prop class to create, manage, and display 'objects' in the application.
        static toDegrees(radians: number): number { //Static method to convert radians to degrees.
            return (radians / Math.PI) * 180;
        }

        static toRadians(degrees: number): number { //Static method to convert degrees to radians.
            return (degrees / 180) * Math.PI;
        }

        static perSecond(val: number): number { //Static method to convert a value into a 'per-millisecond' version, for use with update() and dt.
            return val / 1000;
        }

        
        public stage: Stage; //Declare the stage property.

        public view: { screenPos: Pair, rotation: number[], triangles: Float32Array, texTriangles: Float32Array, texture: WebGLTexture } = {screenPos: undefined, rotation: undefined, triangles: undefined, texTriangles: undefined, texture: undefined};


        constructor(public pos: Coord = new Coord(0, 0), public radians: number = 0, public bounds: Coord[] = [new Coord(-10, -10), new Coord(10, -10), new Coord(10, 10), new Coord(-10, 10)]) {
            super();

            this.view.screenPos = new Pair(0, 0);

            this.view.triangles = new Float32Array([-10, -10,
                                                10, -10,
                                                -10, 10
                                                -10, 10,
                                                10, -10,
                                                10, 10]);
        }
        

        set x(x: number) { //Set x coord
            this.pos.x = x;
        }
        
        set y(y: number) { //Set y coord
            this.pos.y = y;
        }
        
        set degrees(degrees: number) { //Convert & set radians
            this.radians = Prop.toRadians(degrees);
        }


        get x(): number { //Get x coord
            return this.pos.x;
        }
        
        get y(): number { //Get y coord
            return this.pos.y;
        }
        
        get degrees(): number { //Convert & get degrees
            return $P.Prop.toDegrees(this.radians);
        }
        
        get index() { //Get index of this prop in the parent stage's props array.
            if (this.stage) {
                return this.stage.props.indexOf(this);
            } else {
                return -1;
            }
        }


        setPos(x: number, y: number) { //Set position of this prop using separate x and y coordinate arguments.
            this.pos.x = x;
            this.pos.y = y;
        }

        move(vect: Coord): Coord { //Move this prop by coordinates specified in provided Coord.
            return this.pos = Coord.add(this.pos, vect);
        }

        moveEx(x: number, y: number): Coord { //Move this prop by coordinates specified by specific x and y coordinate arguments.
            this.setPos(this.x + x, this.y + y);
            return this.pos;
        }

        rotate(radians: number): number { //Rotate this prop by provided radians amount.
            this.radians += radians % 2 * Math.PI; //Rotate the prop by the amount, modulo operator to wrap around after 2PI radians.

            if (this.radians <= 0) { //If resultant radians is less than zero
                this.radians = 2 * Math.PI + this.radians; //Loop back to 2PI
            } else if (this.radians >= Math.PI) { //Otherwise, if resultant radians is more than 2PI
                this.radians -= 2 * Math.PI; //Loop back to 0.
            }

            return this.radians; //Return the new radians value.
        }

        rotateDegrees(degrees: number) { //Rotate this prop by provided degrees amount.
            return Prop.toDegrees(this.rotate(Prop.toRadians(degrees)));
        }

        remove(quiet: boolean) {} //Empty remove method to be redefined by derivative objects and classes.

        init(quiet: boolean) {} //Empty init method to be redefined by derivative objects and classes.

        
        beforeUpdate(dt: number) {} //Empty beforeUpdate method to be redefined by derivative objects and classes.

        update(dt: number) { //Default update method to be redefined by derivative objects and classes.
            this.rotateDegrees(0.18 * dt);
        }

        afterUpdate(dt: number) {} //Empty afterUpdate method to be redefined by derivative objects and classes.

        draw(rel: Coord) { //Default draw method to be redefined by derivative objects and classes.
            this.view.screenPos.set(rel.x, rel.y);
            this.view.rotation = [Math.sin(this.radians), Math.cos(this.radians)];

            return true; //Return true to tell Camera to draw this prop.
        }
    }
}