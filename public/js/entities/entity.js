// js/entities/entity.js
class Entity {
    constructor(x, y, r, c, hp){
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.radius = r;
        this.color = c;
        this.hp = hp;
        this.maxHp = hp;
        this.angle = 0;
        this.isDead = false;
        this.flash = 0;
        this.invulnerable = 0;
        this.damageCooldowns = new Map();
    }
    takeDamage(amt, src){
        if(this.invulnerable > 0 || this.isDead) return;
        if(!(src instanceof Bullet)){
            if(src && src.owner && (src.owner instanceof Shape || src.owner instanceof Tank)){
                let l = this.damageCooldowns.get(src.owner) || 0;
                if(Date.now() - l < 500) return;
                this.damageCooldowns.set(src.owner, Date.now());
            }
        }
        this.hp -= amt;
        this.flash = 5;
        if(game.isInView(this.pos, this.radius * 2)){
            let tx = this.pos.x + (Math.random() - 0.5) * 50;
            let ty = this.pos.y - this.radius + (Math.random() - 0.5) * 30;
            game.texts.push(textPool.get(tx, ty, Math.round(amt), this.color));
        }
        if(this.hp <= 0 && !this.isDead){
            this.hp = 0; 
            this.isDead = true;
            if(this instanceof Tank || this instanceof Turret) playSound('explode', this.pos.x, this.pos.y);
            game.spawnExplosion(this.pos.x, this.pos.y, this.color, this.radius);
            if(this.type === 'alpha' || (this instanceof Tank && !this.isPlayer)) game.hitFreeze = 3;
            
            let xpToGive = Number(this.xpValue || 0);
            if(this instanceof Tank && !this.isPlayer) {
                xpToGive = Math.floor(200 + this.lvl * 35 + (this.score || 0) * 0.1);
            }

            if (src && src.owner && typeof src.owner.gainXp === 'function') {
                src.owner.gainXp(xpToGive);
                if(src.owner.isPlayer && game.isInView(this.pos, 100) && xpToGive > 0){
                    game.texts.push(textPool.get(this.pos.x, this.pos.y - 40, `+${Math.floor(xpToGive)} XP`, "#ccff00"));
                    playSound('collect', this.pos.x, this.pos.y);
                }
            }
        } else if(this instanceof Tank) {
            playSound('hit', this.pos.x, this.pos.y);
        }
    }
    drawHealthBar(ctx){
        if(this.hp >= this.maxHp || this.isDead) return;
        let w = this.radius * 3 + 10;
        ctx.fillStyle = '#000';
        ctx.fillRect(this.pos.x - w/2, this.pos.y + this.radius + 15, w, 10);
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.pos.x - w/2 + 1, this.pos.y + this.radius + 16, (w - 2) * (Math.max(0, this.hp) / this.maxHp), 8);
    }
    keepInBounds(){
        let m = this.radius + 10;
        if(this.pos.x < m){ this.pos.x = m; this.vel.x = 0; }
        if(this.pos.x > game.mapSize - m){ this.pos.x = game.mapSize - m; this.vel.x = 0; }
        if(this.pos.y < m){ this.pos.y = m; this.vel.y = 0; }
        if(this.pos.y > game.mapSize - m){ this.pos.y = game.mapSize - m; this.vel.y = 0; }
    }
}

class Turret extends Entity {
    constructor(x, y){
        super(x, y, 50, C.turret, 3500);
        this.xpValue = 7000;
        this.cooldown = 0;
    }
    update(){
        this.angle += 0.007;
        let n = null, md = 800000;
        game.entities.forEach(e => {
            if(e instanceof Tank && !e.isDead){
                let d = distSq(this.pos, e.pos);
                if(d < md){ md = d; n = e; }
            }
        });
        if(n){
            let ta = Math.atan2(n.pos.y - this.pos.y, n.pos.x - this.pos.x);
            let df = ta - this.angle;
            while(df < -Math.PI) df += Math.PI * 2;
            while(df > Math.PI) df -= Math.PI * 2;
            this.angle += df * 0.07;
            if(this.cooldown <= 0){
                let bx = this.pos.x + Math.cos(this.angle) * 65;
                let by = this.pos.y + Math.sin(this.angle) * 65;
                game.addBulletInternal(bulletPool.get(bx, by, this.angle, 9, 60, 80, '#ffbb00', this));
                this.cooldown = 45;
            }
        }
        if(this.cooldown > 0) this.cooldown--;
        if(this.flash > 0) this.flash--;
    }
    draw(ctx){
        if(!game.isInView(this.pos, this.radius)) return;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        
        if (!game.performanceMode) {
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 5;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
        }
        
        ctx.fillStyle = '#777';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = game.performanceMode ? 3 : ((typeof isLightMode !== 'undefined' && isLightMode) ? 10 : 6);
        ctx.fillRect(0, -25, 75, 50);
        ctx.strokeRect(0, -25, 75, 50);
        ctx.fillStyle = this.flash > 0 ? '#fff' : '#999';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        this.drawHealthBar(ctx);
    }
}
