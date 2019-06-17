if (!$P.keys) {
  throw new Error("Player module requires keyCodes module!");
}

if (!$P.PhysicsProp) {
  throw new Error("Player module requires physicsProp module!");
}

$P.Player = class extends $P.PhysicsProp {
  constructor(pos = new $P.Coord(0, 0), mass = 100) {
    super(pos, mass);

    this._acceleration = 0.005;
    this._controls = {
      up: '38',
      down: '40',
      left: '37',
      right: '39'
    }
  }


  set acceleration(acc) {
    this._acceleration = acc;
  }

  set controls(controls) {
    this._controls = controls;
  }

  get acceleration() {
    return this._acceleration;
  }

  get controls() {
    return this._controls;
  }


  beforeUpdate() {
    if ($P.keys[this._controls.up]) {
      this.accelerate(new $P.Coord(0, -this._acceleration));
    }
    if ($P.keys[this._controls.right]) {
      this.accelerate(new $P.Coord(this._acceleration, 0));
    }
    if ($P.keys[this._controls.down]) {
      this.accelerate(new $P.Coord(0, this._acceleration));
    }
    if ($P.keys[this._controls.left]) {
      this.accelerate(new $P.Coord(-this._acceleration, 0));
    }
  }
}
