$P.Prop = class extends $P.Base {
  static toDegrees(radians) { //Static conversion utility
    return (radians / Math.PI) * 180;
  }

  static toRadians(degrees) { //Static conversion utility.
    return (degrees / 180) * Math.PI;
  }

  static perSecond(val) { //Static conversion utility for readability
    return val / 1000;
  }


  constructor(pos = new $P.Coord(0, 0), radians = 0, bounds = [new $P.Coord(-10, -10), new $P.Coord(10, -10), new $P.Coord(10, 10), new $P.Coord(-10, 10)]) {
    super(); //Invoke inheritance constructor

    this._pos = pos; //xy coords pos
    this._radians = radians; //radians of rotation
    this._bounds = bounds; //hitbox/bounds/collision etc.
    this._stage; //Initialize stage variable.
  }


  set x(x) { //set x coord
    this._pos.x = x;
  }

  set y(y) { //set y coord
    this._pos.y = y;
  }

  set radians(radians) { //set radians
    this._radians = radians;
  }

  set degrees(degrees) { //convert & set radians
    this._radians = $P.Prop.toRadians(degrees);
  }

  set _degrees(degrees) { //convert & set radians
    this._radians = $P.Prop.toRadians(degrees);
  }

  set bounds(bounds) { //set bounds
    this._bounds = bounds;
  }

  set stage(stage) { //set stage
    this._stage = stage;
  }

  get x() { //get x coord
    return this._pos.x;
  }

  get y() { //get y coord
    return this._pos.y;
  }

  get radians() { //get radians
    return this._radians;
  }

  get degrees() { //convert & get degrees
    return $P.Prop.toDegrees(this._radians);
  }

  get _degrees() { //convert & get degrees
    return $P.Prop.toDegrees(this._radians);
  }

  get bounds() { //get bounds
    return this._bounds;
  }

  get stage() { //get stage
    return this._stage;
  }

  get index() {
    if (this.stage) {
      return this.stage.props.indexOf(this);
    } else {
      return -1;
    }
  }


  move(vect) {
    this._x += vect.x;
    this._y += vect.y;
  }

  rotate(radians) {
    this._radians += radians;
    if (this._radians >= 2 * Math.PI) {
      this._radians -= 2 * Math.PI;
      return;
    }

    if (this._radians < 0) {
      this._radians += 2 * Math.PI;
      return;
    }
  }

  rotateDegrees(degrees) {
    this._degrees += degrees;
    if (this._radians >= 2 * Math.PI) {
      this._radians -= 2 * Math.PI;
      return;
    }

    if (this._radians < 0) {
      this._radians += 2 * Math.PI;
      return;
    }
  }

  beforeUpdate(dt) {

  }

  update(dt) { //default update function
    this.rotateDegrees($P.Prop.perSecond(180) * dt);
  }

  afterUpdate(dt) {

  }

  draw(ctx, rel) { //default draw function
    ctx.strokeStyle = "black";
    ctx.fillStyle = "green";

    ctx.save()

    ctx.translate(rel.x, rel.y)
    ctx.rotate(this._radians);

    ctx.beginPath();
    ctx.moveTo(this._bounds[0].x, this._bounds[0].y);

    for (var i = 1; i < this._bounds.length; i++) {
      ctx.lineTo(this._bounds[i].x, this._bounds[i].y);
    }

    ctx.lineTo(this._bounds[0].x, this._bounds[0].y);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  init(quiet) {}

  destroy(quiet) {}
}