// server/gameLogic/Bullet.js
const Entity = require('./Entity');
const Vector = require('./Vector');

class Bullet extends Entity {
    constructor(x, y, angle, speed, damage, pen, color, owner) {
        super(x, y, 6, color, damage); // radius 6 por defecto
        this.angle = angle;
        this.vel = new Vector(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.damage = damage;
        this.pen = pen;
        this.owner = owner; // Instancia del Tank que disparó
        this.active = true;
        this.maxLife = 180; // 3 segundos a 60fps
        this.life = this.maxLife;
    }

    update(game) {
        if (!this.active) return;

        this.pos.add(this.vel);
        this.life--;

        if (this.life <= 0 || 
            this.pos.x < 0 || this.pos.x > game.mapSize || 
            this.pos.y < 0 || this.pos.y > game.mapSize) {
            this.active = false;
        }
    }
}

module.exports = Bullet;
