$P.Sprite  = class extends $P.Base {
    constructor(src) {
        super();

        this._img = new Image();
        this._img.src = src;
    }

    apply(prop, center = true) {
        prop._sprite = this;
        if (center) {
            prop.draw = function(ctx, rel) {

                ctx.translate(rel.x, rel.y);
                ctx.rotate(this._radians);

                ctx.beginPath();
                
                this._sprite.draw(ctx, new $P.Coord(0, 0));

                ctx.closePath();

                ctx.stroke();
                ctx.fill();
                ctx.restore();
            }
        } else {
            prop.draw = function(ctx, rel) {

                ctx.translate(rel.x, rel.y);
                ctx.rotate(this._radians);

                ctx.beginPath();
                
                this._sprite.draw(ctx, new $P.Coord(0, 0), false);

                ctx.closePath();

                ctx.stroke();
                ctx.fill();
                ctx.restore();
            }
        }
    }

    draw(ctx, pos, center = true) {
        ctx.beginPath();

        if (center) {
            ctx.drawImage(this._img, pos.x - this._img.width/2, pos.y - this._img.height/2);
        } else {
            ctx.drawImage(this._img, pos.x, pos.y);
        }

        ctx.closePath();
    }
}