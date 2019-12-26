$P.Sprite  = class extends $P.Base {
    constructor(src, scale = new $P.Coord(1, 1)) {
        super();

        this._img = new Image();
        this._img.src = src;
        this._scale = scale;
    }

    set _src(src) {
        this._img.src = src;
    }
    
    set src(src) {
        this._img.src = src;
    }

    set scale(scale) {
        this._scale = scale;
    }

    get _src() {
        return this._img.src;
    }

    get src() {
        return this._img.src;
    }

    get img() {
        return this._img;
    }

    get scale() {
        return this._scale;
    }

    applyTo(prop, center = true) {
        prop._sprite = this;
        if (center) {
            prop.draw = function(ctx, rel) {
                ctx.save();
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
                ctx.save();
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

    copy(scale = new $P.Coord(1, 1)) {
        return new $P.Sprite(this._img.src, scale);
    }

    draw(ctx, rel, center = true) {
        ctx.beginPath();

        ctx.save();

        ctx.scale(this._scale.x, this._scale.y);

        if (center) {
            ctx.drawImage(this._img, rel.x - this._img.width/2, rel.y - this._img.height/2);
        } else {
            ctx.drawImage(this._img, rel.x, rel.y);
        }

        ctx.restore();

        ctx.closePath();
    }
}