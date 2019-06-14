var canvas = new $P.Canvas("canvas");

var world = new $P.Stage();

var Box = new $P.Prop();
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

world.addProp(Box);
var cam = new $P.Camera(world, canvas);

window.setInterval(function() {
  cam.draw()
}, 16);