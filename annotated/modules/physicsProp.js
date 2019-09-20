$P.PhysicsProp = class extends $P.Prop {
    constructor (pos = new $P.Coord(0, 0), mass = 10) {
        super(pos);

        this._mass = mass;
        this._velocity = new $P.Coord(0, 0);
        this._angularVelocity = 0;
        this._resistance = 0.99;
        this._angularResistance = 0.99;
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

    set resistance(resistance) {
        this._resistance = resistance;
    }

    set angularResistance(angularResistance) {
        this._angularResistance = angularResistance;
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

    get resistance() {
        return this._resistance;
    }

    get angularResistance() {
        return this._angularResistance;
    }


    accelerate(vect) {
        this._velocity = $P.Coord.addCoords(this._velocity, vect);
    }

    angularAccelerate(val) {
        this._angularVelocity += val;
    }

    push(vect) {
        this.accelerate($P.Coord.multCoord(vect, 1 / this._mass));
    }

    angularPush(val) {
        this.angularAccelerate(val / this._mass);
    }


    update(dt) {
        this.move($P.Coord.multCoord(this._velocity, dt));

        this.rotate(this._angularVelocity * dt);

        this.push($P.Coord.multCoord(this._velocity, -1 * this._resistance));
        this.angularPush(this._angularVelocity * (-1 * this._angularResistance));
    }
}
