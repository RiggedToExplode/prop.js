if (!$P.keys) {
  throw new Error("Player module requires keyCodes module!");
}

if (!$P.PhysicsProp) {
  throw new Error("Player module requires physicsProp module!");
}

$P.playerPilotTypes = [
  function () {
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
  },
  function () {
    if ($P.keys[this._controls.left]) {
      this.angularAccelerate(-this._angularAcceleration);
    }
    if ($P.keys[this._controls.right]) {
      this.angularAccelerate(this._angularAcceleration);
    }
    if ($P.keys[this._controls.up]) {
      this.accelerate(new $P.Coord(this._acceleration * Math.sin(this._radians), -this._acceleration * Math.cos(this._radians)));
    }
    if ($P.keys[this._controls.down]) {
      this.accelerate(new $P.Coord(-this._acceleration * Math.sin(this._radians), this._acceleration * Math.cos(this._radians)));
    }
  }
]

$P.Player = class extends $P.PhysicsProp {
  constructor(pos = new $P.Coord(0, 0), mass = 100) {
    super(pos, mass);

    this._acceleration = 0.005;
    this._angularAcceleration = 0.0005;
    this._controls = {
      up: '38',
      down: '40',
      left: '37',
      right: '39'
    }
    this.pilotType = "directional";
  }


  set acceleration(acc) {
    this._acceleration = acc;
  }

  set angularAcceleration(acc) {
    this._angularAcceleration = acc;
  }

  set controls(controls) {
    this._controls = controls;
  }

  set pilotType(type) {
    switch(type) {
      case "directional":
        this.beforeUpdate = $P.playerPilotTypes[0];
        break;
      case "rotational":
        this.beforeUpdate = $P.playerPilotTypes[1];
        break;
      default:
        console.log(type + " is not valid pilotType!");
        return false;
    }

    this._pilotType = type;
  }

  get acceleration() {
    return this._acceleration;
  }

  get angularAcceleration() {
    return this._angularAcceleration;
  }

  get controls() {
    return this._controls;
  }

  get pilotType() {
    return this._pilotType;
  }


  beforeUpdate() {

  }
}
