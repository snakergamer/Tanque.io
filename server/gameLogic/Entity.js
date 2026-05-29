// server/gameLogic/Entity.js
const Vector = require('./Vector');

class Entity {
    constructor(x, y, r, c, hp) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.radius = r;
        this.color = c;
        this.hp = hp;
        this.maxHp = hp;
        this.angle = 0;
        this.isDead = false;
        this.invulnerable = 0;
        this.damageCooldowns = new Map();
    }

    takeDamage(amt, src, game) {
        if (this.invulnerable > 0 || this.isDead) return;
        
        // Lógica de cooldown de daño (para evitar hits instantáneos múltiples)
        if (src && src.owner) {
            let lastHit = this.damageCooldowns.get(src.owner) || 0;
            if (Date.now() - lastHit < 100) return; // 100ms cooldown entre hits del mismo dueño
            this.damageCooldowns.set(src.owner, Date.now());
        }

        this.hp -= amt;
        if (this.hp <= 0 && !this.isDead) {
            this.hp = 0;
            this.isDead = true;
            // Notificar al juego que esta entidad murió
            if (game) game.onEntityDeath(this, src);
        }
    }

    keepInBounds(mapSize) {
        let m = this.radius + 10;
        if (this.pos.x < m) { this.pos.x = m; this.vel.x = 0; }
        if (this.pos.x > mapSize - m) { this.pos.x = mapSize - m; this.vel.x = 0; }
        if (this.pos.y < m) { this.pos.y = m; this.vel.y = 0; }
        if (this.pos.y > mapSize - m) { this.pos.y = mapSize - m; this.vel.y = 0; }
    }
}

module.exports = Entity;
