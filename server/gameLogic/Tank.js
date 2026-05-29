// server/gameLogic/Tank.js
const Entity = require('./Entity');
const Vector = require('./Vector');
const Bullet = require('./Bullet');
const { CLASSES, EVOLUTIONS } = require('./Constants');

class Tank extends Entity {
    constructor(x, y, c, id, n = "Bot") {
        super(x, y, 26, c, 100);
        this.id = id;
        this.name = n;
        this.tankClass = 'Tanque';
        this.stats = [0, 0, 0, 0, 0, 0, 0, 0]; // [Regen, MaxHP, BodyDmg, BSpeed, BPen, BDmg, Reload, Movement]
        this.upgradesAvailable = 0;
        this.lvl = 1;
        this.xp = 0;
        this.nextXp = 15;
        this.score = 0;
        this.evolutionTier = 0;
        this.calcStats();
        this.hp = this.maxHp;
        this.cooldown = 0;
        this.friction = 0.86;
        this.accel = 0.5;
        this.inputs = { up: false, down: false, left: false, right: false, mouseX: 0, mouseY: 0, isShooting: false };
        this.evoOptions = [];
    }

    calcStats() {
        let c = CLASSES[this.tankClass];
        this.regen = 0.5 + this.stats[0] * 0.6;
        let om = this.maxHp;
        this.maxHp = 100 + this.stats[1] * 25 + this.lvl * 4;
        if (this.hp > 0) this.hp += (this.maxHp - om);
        this.bodyDmg = 35 + this.stats[2] * 8;
        this.bulletSpd = (3.0 + this.stats[3] * 1.0) * (c.bulletSpdMult || 1);
        this.bulletPen = (18 + this.stats[4] * 8) * (c.bulletPenMult || 1);
        this.bulletDmg = (18 + this.stats[5] * 8) * (c.bulletDmgMult || 1);
        this.reloadTime = (55 - this.stats[6] * 5) * (c.reloadMult || 1);
        this.maxSpeed = (2.4 + this.stats[7] * 0.55) * (c.speedMult || 1);
        this.radius = 26 + (this.lvl * 0.2);
    }

    gainXp(amt) {
        if (this.lvl >= 100) return;
        this.xp += amt;
        this.score += amt;
        
        while (this.xp >= this.nextXp && this.lvl < 100) {
            this.xp -= this.nextXp;
            this.lvl++;
            this.upgradesAvailable++;
            this.nextXp = Math.floor(this.nextXp * 1.1) + 10;
            this.calcStats();
            this.checkEvolutions();
        }
    }

    checkEvolutions() {
        this.evoOptions = [];
        const levels = Object.keys(EVOLUTIONS).map(Number).sort((a, b) => a - b);
        
        for (let l of levels) {
            if (this.lvl >= l) {
                const evos = EVOLUTIONS[l];
                if (Array.isArray(evos)) {
                    // Nivel 15 - Primera rama
                    if (this.tankClass === 'Tanque') this.evoOptions = evos;
                } else {
                    // Niveles superiores - Basados en la clase actual
                    if (evos[this.tankClass]) {
                        this.evoOptions = evos[this.tankClass];
                    }
                }
            }
        }
    }

    evolve(newClass) {
        if (this.evoOptions.includes(newClass)) {
            this.tankClass = newClass;
            this.calcStats();
            this.evoOptions = [];
            this.checkEvolutions(); // Ver si hay más evoluciones disponibles de inmediato
            return true;
        }
        return false;
    }

    upgradeStat(index) {
        if (this.upgradesAvailable > 0 && this.stats[index] < 10) {
            this.stats[index]++;
            this.upgradesAvailable--;
            this.calcStats();
            return true;
        }
        return false;
    }

    update(game) {
        if (this.isDead) return;

        // Procesar movimiento basado en inputs
        let mv = new Vector(0, 0);
        if (this.inputs.up) mv.y -= 1;
        if (this.inputs.down) mv.y += 1;
        if (this.inputs.left) mv.x -= 1;
        if (this.inputs.right) mv.x += 1;

        if (mv.mag() > 0) {
            this.vel.add(mv.normalize().mult(this.accel));
        }

        this.vel.mult(this.friction);
        if (this.vel.mag() > this.maxSpeed) this.vel.normalize().mult(this.maxSpeed);
        this.pos.add(this.vel);
        this.keepInBounds(game.mapSize);

        // Actualizar ángulo
        this.angle = Math.atan2(this.inputs.mouseY - this.pos.y, this.inputs.mouseX - this.pos.x);

        // Regen
        if (this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.regen / 60);
        }

        // Lógica de disparo (Autoritativa)
        if (this.cooldown > 0) this.cooldown--;
        if (this.inputs.isShooting && this.cooldown <= 0) {
            this.shoot(game);
            this.cooldown = this.reloadTime;
        }
    }

    shoot(game) {
        const c = CLASSES[this.tankClass];
        c.barrels.forEach(b => {
            const ba = this.angle + b.angle;
            // Cálculo de posición de bala ajustado por offset
            const bx = this.pos.x + Math.cos(this.angle) * b.offsetX - Math.sin(this.angle) * b.offsetY + Math.cos(ba) * b.length;
            const by = this.pos.y + Math.sin(this.angle) * b.offsetX + Math.cos(this.angle) * b.offsetY + Math.sin(ba) * b.length;
            
            const bullet = new Bullet(bx, by, ba, this.bulletSpd, this.bulletDmg, this.bulletPen, this.color, this);
            game.bullets.push(bullet);
        });
    }

    applyInputs(data) {
        this.inputs = { ...this.inputs, ...data };
    }
}

module.exports = Tank;

