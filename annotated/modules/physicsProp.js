$P.PhysicsProp = class extends $P.Prop {
    constructor (pos = new $P.Coord(0, 0), mass = 10) {
        super(pos);

        this._mass = mass;
        this._velocity = new $P.Coord(0, 0);
        this._angularVelocity = 0;
    }


    set mass(mass) {
        this._mass = mass;
    }

    set velocity(velocity) {
        this._velocity = velocity;
    }

    set angularVelocity(angularVelocity) {
        this._angularVelocity = angularVelocity;
    }

    get mass() {
        return this._mass;
    }

    get velocity() {
        return this._velocity;
    }

    get angularVelocity() {
        return this._angularVelocity;
    }


    accelerate(vect) {
        this._velocity.x += vect.x;
        this._velocity.y += vect.y;
    }

    angularAccelerate(val) {
        this._angularVelocity += val;
    }

    update(dt) {
        this._pos.x += this._velocity.x * dt;
        this._pos.y += this._velocity.y * dt;

        this._radians += this._angularVelocity * dt;
    }
}