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
  }


  set acceleration(acc) {
    this._acceleration = acc;
  }

  get acceleration() {
    return this._acceleration;
  }


  beforeUpdate() {
    if ($P.keys['38']) {
      this.accelerate(new $P.Coord(0, -this._acceleration));
    }
    if ($P.keys['39']) {
      this.accelerate(new $P.Coord(this._acceleration, 0));
    }
    if ($P.keys['40']) {
      this.accelerate(new $P.Coord(0, this._acceleration));
    }
    if ($P.keys['37']) {
      this.accelerate(new $P.Coord(-this._acceleration, 0));
    }
  }
}