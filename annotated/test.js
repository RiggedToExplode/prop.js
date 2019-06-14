var canvas = new $P.Canvas("canvas");

var world = new $P.Stage();

var Box = new $P.Prop();
Box.name = "Box";
Box.draw = function(ctx, rel) {
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
Box.update = function(dt) {
  this.rotateDegrees($P.Prop.perSecond(180) * dt);
}

var Box2 = new $P.Prop(new $P.Coord(-50, 0));
Box2.name = "Box2";

var Box3 = new $P.Prop(new $P.Coord(50, 0));
Box3.name = "Box3"

world.addProps([Box, Box2, Box3]);
var cam = new $P.Camera(world, canvas);

window.setInterval(function() {
  cam.draw()
}, 16);