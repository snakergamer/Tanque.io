// server/gameLogic/gameLoop.js
const { QTNode, Rect } = require('./QuadTree');
const Tank = require('./Tank');
const Bullet = require('./Bullet');

class GameLoop {
    constructor(io) {
        this.io = io;
        this.players = {};
        this.entities = []; 
        this.bullets = [];
        this.mapSize = 8000;
        this.tickRate = 60;
        this.lastTick = Date.now();
    }

    start() {
        console.log("🚀 Motor de juego autoritativo iniciado a 60 FPS");
        setInterval(() => this.tick(), 1000 / this.tickRate);
    }

    tick() {
        const now = Date.now();
        this.lastTick = now;

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

        // 2. Actualizar Balas
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(this);
            if (!b.active) {
                this.bullets.splice(i, 1);
                continue;
            }

            // 3. Colisiones Bala vs Tanque
            const nearby = qt.query(new Rect(b.pos.x - 20, b.pos.y - 20, 40, 40));
            for (let target of nearby) {
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
                maxHp: p.maxHp,
                score: Math.floor(p.score),
                lvl: p.lvl,
                color: p.color,
                name: p.name
            };
        }

        // Enviar balas (solo lo básico para ahorrar ancho de banda)
        snapshot.bullets = this.bullets.map(b => ({
            x: Math.round(b.pos.x),
            y: Math.round(b.pos.y),
            color: b.color
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
        if (player) player.applyInputs(inputData);
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
            // killer.owner.gainXp(entity.xpValue || 100);
        }
    }
}

module.exports = GameLoop;
