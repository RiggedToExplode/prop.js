$P.NewtonianProp = class extends $P.PhysicsProp {
    constructor(pos = new $P.Coord(0, 0), mass = 100) {
        super(pos, mass);
        this.resistance = 0;
    }

    beforeUpdate(dt) {
        let cum = new $P.Coord(0, 0); //nice xD
        
        for (var i in this._stage.props) {
            let prop = this._stage.props[i];

            if (prop !== this) {
                let r = $P.Coord.dist(this.pos, prop.pos);
                let f = new $P.Coord(0, 0);

                f.x = prop.mass / (Math.pow(r, 2));
                
                f.y = prop.mass / (Math.pow(r, 2));
                
                if (f.x === Infinity) {
                    f.x = 0;
                }

                if (f.y === Infinity) {
                    f.y = 0;
                }

                cum = $P.Coord.addCoords(cum, f);
            }
        }
        
        this.push(cum);
    }

    draw(ctx, rel) {
        ctx.save()

        ctx.translate(rel.x, rel.y);

        ctx.beginPath();
        
        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.closePath();

        ctx.fill();
        ctx.restore();
    }
}