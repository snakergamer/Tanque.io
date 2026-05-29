// server/gameLogic/gameLoop.js
const { QTNode, Rect } = require('./QuadTree');
const Tank = require('./Tank');
const Bullet = require('./Bullet');
const Entity = require('./Entity');
const Vector = require('./Vector');

class Shape extends Entity {
    constructor(x, y, type) {
        let r, hp, xp, color;
        switch(type) {
            case 'square': r = 20; hp = 30; xp = 15; color = '#ffe869'; break;
            case 'triangle': r = 22; hp = 100; xp = 50; color = '#fc7677'; break;
            case 'pentagon': r = 30; hp = 400; xp = 250; color = '#768dfc'; break;
            default: r = 20; hp = 30; xp = 15; color = '#ffe869';
        }
        super(x, y, r, color, hp);
        this.type = type;
        this.xpValue = xp;
        this.vel = new Vector((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
    }

    update(mapSize) {
        this.pos.add(this.vel);
        if (this.pos.x < 0 || this.pos.x > mapSize) this.vel.x *= -1;
        if (this.pos.y < 0 || this.pos.y > mapSize) this.vel.y *= -1;
    }
}

class GameLoop {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.entities = []; 
        this.bullets = [];
        this.mapSize = 8000;
        this.tickRate = 60;
        this.lastTick = Date.now();
        this.maxEntities = 400;
    }

    start() {
        console.log("🚀 Motor de juego autoritativo iniciado a 60 FPS");
        setInterval(() => this.tick(), 1000 / this.tickRate);
    }

    spawnShapes() {
        while (this.entities.length < this.maxEntities) {
            const x = Math.random() * this.mapSize;
            const y = Math.random() * this.mapSize;
            const rand = Math.random();
            let type = 'square';
            if (rand > 0.95) type = 'pentagon';
            else if (rand > 0.8) type = 'triangle';
            this.entities.push(new Shape(x, y, type));
        }
    }

    tick() {
        const now = Date.now();
        this.lastTick = now;

        this.spawnShapes();

        const qt = new QTNode(new Rect(0, 0, this.mapSize, this.mapSize), 10);
        
        // 1. Actualizar Jugadores
        for (let id in this.players) {
            const player = this.players[id];
            if (player.isDead) continue;
            player.update(this);
            qt.insert({ 
                obj: player, 
                bounds: new Rect(player.pos.x - player.radius, player.pos.y - player.radius, player.radius * 2, player.radius * 2) 
            });
        }

        // 2. Actualizar Entidades (Figuras)
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            ent.update(this.mapSize);
            if (ent.isDead) {
                this.entities.splice(i, 1);
                continue;
            }
            qt.insert({ 
                obj: ent, 
                bounds: new Rect(ent.pos.x - ent.radius, ent.pos.y - ent.radius, ent.radius * 2, ent.radius * 2) 
            });
        }

        // 3. Actualizar Balas y Colisiones
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(this);
            if (!b.active) {
                this.bullets.splice(i, 1);
                continue;
            }

            const nearby = qt.query(new Rect(b.pos.x - 50, b.pos.y - 50, 100, 100));
            for (let targetObj of nearby) {
                const target = targetObj.obj;
                if (target === b.owner || target.isDead) continue;
                
                const distSq = b.pos.distSq(target.pos);
                const minDist = b.radius + target.radius;
                
                if (distSq < minDist * minDist) {
                    target.takeDamage(b.damage, b, this);
                    b.active = false;
                    break;
                }
            }
        }

        this.broadcastState();
    }

    broadcastState() {
        const snapshot = {
            players: {},
            entities: [],
            bullets: [],
            time: Date.now()
        };

        for (let id in this.players) {
            const p = this.players[id];
            snapshot.players[id] = {
                id: p.id,
                x: Math.round(p.pos.x),
                y: Math.round(p.pos.y),
                angle: p.angle,
                hp: Math.round(p.hp),
                maxHp: Math.round(p.maxHp),
                score: Math.floor(p.score),
                lvl: p.lvl,
                color: p.color,
                name: p.name,
                tankClass: p.tankClass,
                upgrades: p.upgradesAvailable,
                stats: p.stats,
                evoOptions: p.evoOptions,
                radius: p.radius
            };
        }

        snapshot.entities = this.entities.map(e => ({
            x: Math.round(e.pos.x),
            y: Math.round(e.pos.y),
            type: e.type,
            color: e.color,
            radius: e.radius,
            hp: e.hp,
            maxHp: e.maxHp
        }));

        snapshot.bullets = this.bullets.map(b => ({
            x: Math.round(b.pos.x),
            y: Math.round(b.pos.y),
            color: b.color,
            radius: b.radius
        }));

        this.io.emit('gameState', snapshot);
    }

    addPlayer(socketId, data) {
        const player = new Tank(
            this.mapSize / 2 + (Math.random() - 0.5) * 500,
            this.mapSize / 2 + (Math.random() - 0.5) * 500, 
            data.color || '#00f2ff', 
            socketId, 
            data.name || 'Invitado'
        );
        this.players[socketId] = player;
        return player;
    }

    removePlayer(socketId) {
        delete this.players[socketId];
    }

    handleInput(socketId, inputData) {
        const player = this.players[socketId];
        if (!player) return;

        if (inputData.type === 'upgrade') {
            player.upgradeStat(inputData.index);
        } else if (inputData.type === 'evolve') {
            player.evolve(inputData.class);
        } else {
            player.applyInputs(inputData);
        }
    }

    onEntityDeath(entity, killer) {
        if (entity instanceof Tank && entity.id) {
            this.io.to(entity.id).emit('gameOver', {
                score: Math.floor(entity.score),
                lvl: entity.lvl
            });
            if (this.onPlayerDeath) this.onPlayerDeath(entity);
        }
        
        // Dar XP al asesino
        if (killer && killer.owner && killer.owner instanceof Tank) {
            killer.owner.gainXp(entity.xpValue || 100);
        }
    }
}

module.exports = GameLoop;

