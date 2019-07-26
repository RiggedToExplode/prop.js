if (!$P.keys) {
  throw new Error("Player module requires keyCodes module!");
}

if (!$P.PhysicsProp) {
  throw new Error("Player module requires physicsProp module!");
}

$P.playerPilotTypes = [
  function () {
    if ($P.keys[this._controls.up]) {
      this.push(new $P.Coord(0, -this._force));
    }
    if ($P.keys[this._controls.right]) {
      this.push(new $P.Coord(this._force, 0));
    }
    if ($P.keys[this._controls.down]) {
      this.push(new $P.Coord(0, this._force));
    }
    if ($P.keys[this._controls.left]) {
      this.push(new $P.Coord(-this._force, 0));
    }
  },
  function () {
    if ($P.keys[this._controls.left]) {
      this.angularPush(-this._angularForce);
    }
    if ($P.keys[this._controls.right]) {
      this.angularPush(this._angularForce);
    }
    if ($P.keys[this._controls.up]) {
      this.push(new $P.Coord(this._force * Math.sin(this._radians), -this._force * Math.cos(this._radians)));
    }
    if ($P.keys[this._controls.down]) {
      this.push(new $P.Coord(-this._force * Math.sin(this._radians), this._force * Math.cos(this._radians)));
    }
  }
]

$P.Player = class extends $P.PhysicsProp {
  constructor(pos = new $P.Coord(0, 0), mass = 100) {
    super(pos, mass);

    this._force = 0.005;
    this._angularForce = 0.0005;
    this._controls = {
      up: '38',
      down: '40',
      left: '37',
      right: '39'
    }
    this.pilotType = "directional";
  }


  set force(force) {
    this._force = force;
  }

  set angularForce(force) {
    this._angularForce = force;
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

  get force() {
    return this._force;
  }

  get angularForce() {
    return this._angularForce;
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
