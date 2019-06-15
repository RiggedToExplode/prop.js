$P.NewtonianProp = class extends $P.Prop {
  constructor(pos = new $P.Coord(0, 0), mass, radius = 50) {
    super(pos, 0);

    this.newtonian = true;
    this._mass = mass;
    this._radius = radius;
  }

  update(dt) {
    let vect = new $P.Coord(0, 0); //Create a 2D vector that we are going to add to

    for (var i in this._stage.props) { //Iterate through all props on stage
      if (this._stage.props[i].mass) { //Check if prop has mass and can be used for gravity calculations
        let f = new $P.Coord(0, 0);
      }
    }
  }

  draw(ctx, rel) { //Draw a circle
    ctx.beginPath();

    ctx.fillStyle = "green";

    ctx.arc(rel.x, rel.y, this._radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.closePath();
  }
}