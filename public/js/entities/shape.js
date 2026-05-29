// js/entities/shape.js
class Shape extends Entity {
    constructor(x, y, t) {
        let s = {
            'square': { r: 20, h: 20, c: C.square, x: 2, si: 4 },
            'triangle': { r: 28, h: 55, c: C.triangle, x: 25, si: 3 },
            'pentagon': { r: 45, h: 200, c: C.pentagon, x: 100, si: 5 },
            'alpha': { r: 110, h: 6000, c: C.alpha, x: 15000, si: 5 }
        }[t];
        super(x, y, s.r, s.c, s.h); 
        this.type = t; 
        this.sides = s.si; 
        this.xpValue = Number(s.x); 
        this.rotSpeed = (Math.random() - 0.5) * 0.01; 
        this.vel = new Vector((Math.random() - 0.5) * 0.01, (Math.random() - 0.5) * 0.01); 
        this.bodyDmg = t === 'alpha' ? 100 : (this.sides === 5 ? 45 : 25);
    }
    update() {
        this.angle += this.rotSpeed;
        this.pos.add(this.vel);
        this.keepInBounds();
        if (this.flash > 0) this.flash--;
    }
    draw(ctx) {
        if (this.isDead || !game.isInView(this.pos, this.radius * 2)) return;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        if (!game.performanceMode) {
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 6;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
        }
        
        let lightMode = typeof isLightMode !== 'undefined' && isLightMode;
        
        ctx.fillStyle = this.flash > 0 ? '#fff' : this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = game.performanceMode ? 3 : (lightMode ? (this.type === 'alpha' ? 15 : 10) : (this.type === 'alpha' ? 10 : 6));
        
        if (this.type === 'square') {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            for (let i = 0; i < this.sides; i++) {
                ctx.lineTo(this.radius * Math.cos(i * 2 * Math.PI / this.sides), this.radius * Math.sin(i * 2 * Math.PI / this.sides));
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}
