// js/core/pool.js
class Pool { 
    constructor(fn) { this.inactive = []; this.fn = fn; } 
    get(...args) { 
        let o = this.inactive.length ? this.inactive.pop() : this.fn(); 
        o.init(...args); 
        o.active = true; 
        return o; 
    } 
    release(o) { 
        o.active = false; 
        if (o.owner) o.owner = null; 
        if (o.target) o.target = null; 
        this.inactive.push(o); 
    } 
}

class Particle {
    init(x, y, color, size, ptype = 'circle', angle = 0) {
        this.pos = new Vector(x, y);
        this.vel = new Vector((Math.random() - 0.5) * (ptype === 'spark' ? 20 : 12), (Math.random() - 0.5) * (ptype === 'spark' ? 20 : 12));
        this.life = 1.0; 
        this.decay = Math.random() * 0.02 + (ptype === 'gib' ? 0.03 : 0.05);
        this.color = color; 
        this.size = size; 
        this.type = ptype; 
        this.angle = angle; 
        this.rot = Math.random() * 0.2;
        this.active = true;
    }
    update() {
        this.pos.add(this.vel); 
        this.vel.mult(0.94); 
        this.angle += this.rot;
        this.life -= this.decay; 
        if (this.life <= 0) this.active = false;
    }
    draw(ctx) {
        if (!game.isInView(this.pos, this.size * 2)) return;
        ctx.save(); 
        ctx.translate(this.pos.x, this.pos.y); 
        ctx.rotate(this.angle);
        ctx.globalAlpha = Math.max(0, this.life); 
        ctx.fillStyle = this.color;
        if (this.type === 'spark') { 
            ctx.fillRect(-this.size, -1, this.size * 2, 2); 
        } else if (this.type === 'gib') { 
            ctx.beginPath(); 
            ctx.moveTo(this.size, 0); 
            ctx.lineTo(-this.size / 2, this.size); 
            ctx.lineTo(-this.size / 2, -this.size); 
            ctx.closePath(); 
            ctx.fill(); 
        } else { 
            ctx.beginPath(); 
            ctx.arc(0, 0, this.size, 0, Math.PI * 2); 
            ctx.fill(); 
        }
        ctx.restore(); 
        ctx.globalAlpha = 1.0;
    }
}
const particlePool = new Pool(() => new Particle());

class FloatText { 
    init(x, y, t, c) {
        this.pos = new Vector(x, y);
        this.text = t;
        this.color = c;
        this.life = 1.0;
    } 
    update() {
        this.pos.y -= 2;
        this.life -= 0.02;
        if (this.life <= 0) this.active = false;
    } 
    draw(ctx) {
        if (!game.isInView(this.pos, 50)) return;
        ctx.save(); 
        ctx.shadowBlur = 0; 
        ctx.shadowColor = 'transparent'; 
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.strokeText(this.text, this.pos.x, this.pos.y);
        ctx.fillText(this.text, this.pos.x, this.pos.y); 
        ctx.restore(); 
    } 
}
const textPool = new Pool(() => new FloatText());
