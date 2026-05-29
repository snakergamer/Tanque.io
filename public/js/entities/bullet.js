// js/entities/bullet.js
class Bullet {
    init(x, y, a, s, d, p, c, o, id = false, im = false, ind = false, rg = false) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(Math.cos(a) * s, Math.sin(a) * s);
        this.damage = d;
        this.pen = p;
        this.color = c;
        this.owner = o;
        this.radius = im ? 18 : (id || ind ? 15 : Math.max(10, d / 2.5));
        this.life = im || id || ind ? 1500 : 350; 
        this.maxLife = this.life;
        this.isDrone = id;
        this.isMine = im;
        this.isNecroDrone = ind;
        this.railgun = rg;
        this.angle = a;
        this.target = null;
        this.speedSq = s * s;
        this.active = true;
        this.droneType = 'triangle'; 
    }

    update() {
        if (this.isDrone || this.isNecroDrone) {
            if (!this.owner || this.owner.isDead) { this.active = false; return; }
            let tx, ty;
            
            // Portaaviones Overdrive: drones agresivos hacia el cursor
            let isOverdrive = this.owner.abilityTimer > 0 && (this.owner.tankClass === 'Portaaviones' || this.owner.tankClass === 'Invocador Alfa');
            
            if (this.owner.isPlayer) {
                let mx = (typeof mouse !== 'undefined' ? mouse.x : 0) - window.innerWidth / 2 + game.camera.x;
                let my = (typeof mouse !== 'undefined' ? mouse.y : 0) - window.innerHeight / 2 + game.camera.y;
                
                if (isOverdrive) {
                    tx = mx; ty = my;
                } else if (typeof mouse !== 'undefined' && mouse.rightDown) { 
                    let dir = this.pos.sub(new Vector(mx, my)).normalize(); 
                    tx = this.pos.x + dir.x * 300; 
                    ty = this.pos.y + dir.y * 300; 
                } else if ((typeof mouse !== 'undefined' && mouse.isDown) || (typeof joystickR !== 'undefined' && joystickR.active)) { 
                    tx = mx; ty = my; 
                } else { 
                    tx = this.owner.pos.x + Math.cos(this.life * 0.05) * 150; 
                    ty = this.owner.pos.y + Math.sin(this.life * 0.05) * 150; 
                }
            } else {
                if (this.target && !this.target.isDead) { 
                    tx = this.target.pos.x; ty = this.target.pos.y; 
                } else { 
                    tx = this.owner.pos.x + Math.cos(this.life * 0.07) * 160; 
                    ty = this.owner.pos.y + Math.sin(this.life * 0.07) * 160; 
                }
            }
            
            let steerSpeed = isOverdrive ? 1.5 : 0.8;
            let maxSpd = isOverdrive ? 1.5 : 0.91;
            
            let dir = new Vector(tx - this.pos.x, ty - this.pos.y).normalize(); 
            this.vel.add(dir.mult(steerSpeed)).mult(maxSpd); 
            this.angle = Math.atan2(this.vel.y, this.vel.x);
        } else if (this.isMine) { 
            this.vel.mult(0.85); 
            this.angle += 0.03; 
        }
        
        this.pos.add(this.vel); 
        this.life--;
        if (this.life <= 0 || this.pen <= 0) this.active = false;
    }

    draw(ctx) {
        if (!game.isInView(this.pos, this.radius * 2)) return;
        ctx.save(); 
        ctx.translate(this.pos.x, this.pos.y); 
        ctx.rotate(this.angle);
        
        if (!game.performanceMode) {
            ctx.shadowColor = 'rgba(0,0,0,0.25)'; 
            ctx.shadowBlur = 8; 
            ctx.shadowOffsetY = 4;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
        }
        
        let lightMode = typeof isLightMode !== 'undefined' && isLightMode;
        
        if (!lightMode && !game.performanceMode) {
            let g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2.5);
            g.addColorStop(0, this.color); 
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g; 
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath(); 
            ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2); 
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.fillStyle = this.color; 
        ctx.strokeStyle = '#000'; 
        ctx.lineWidth = game.performanceMode ? 3 : (lightMode ? 6 : 4);
        
        if (this.isNecroDrone || this.isDrone) {
            ctx.beginPath(); 
            for (let i = 0; i < 3; i++) {
                ctx.lineTo(this.radius * 1.3 * Math.cos(i * 2 * Math.PI / 3), this.radius * 1.3 * Math.sin(i * 2 * Math.PI / 3)); 
            }
            ctx.closePath(); 
            ctx.fill(); 
            ctx.stroke();
        } else if (this.isMine) {
            ctx.beginPath(); 
            ctx.moveTo(this.radius, 0); 
            ctx.lineTo(-this.radius, this.radius); 
            ctx.lineTo(-this.radius, -this.radius); 
            ctx.closePath(); 
            ctx.fill(); 
            ctx.stroke();
        } else {
            ctx.beginPath(); 
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2); 
            ctx.fill(); 
            ctx.stroke();
        }
        ctx.restore();
    }
}
const bulletPool = new Pool(() => new Bullet());
