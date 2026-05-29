// public/js/core/game.js

// 1. Constantes de Clases (Sincronizadas con el Servidor)
const CLASSES = {
    'Tanque': { fov: 1, speedMult: 1, barrels: [{ length: 35, width: 24, offsetX: 0, offsetY: 0, angle: 0, recoil: 8, delay: 0 }] },
    'Doble': { fov: 1, speedMult: 1, barrels: [{ length: 35, width: 20, offsetX: 0, offsetY: -11, angle: 0, recoil: 6, delay: 0 }, { length: 35, width: 20, offsetX: 0, offsetY: 11, angle: 0, recoil: 6, delay: 0.5 }] },
    'Francotirador': { fov: 1.45, speedMult: 0.9, bulletSpdMult: 1.4, bulletDmgMult: 1.3, reloadMult: 1.6, barrels: [{ length: 55, width: 20, offsetX: 0, offsetY: 0, angle: 0, recoil: 12, delay: 0 }] },
    'Ametralladora': { fov: 1, speedMult: 1, reloadMult: 0.55, spread: 0.3, barrels: [{ length: 35, width: 28, offsetX: 0, offsetY: 0, angle: 0, recoil: 5, delay: 0 }] },
    'Asesino': { fov: 1.9, speedMult: 0.8, bulletSpdMult: 1.8, bulletDmgMult: 1.7, reloadMult: 2.2, barrels: [{ length: 70, width: 20, offsetX: 0, offsetY: 0, angle: 0, recoil: 18, delay: 0 }] },
    'Cazador': { fov: 1.6, speedMult: 0.9, bulletSpdMult: 1.6, bulletDmgMult: 1.5, reloadMult: 1.8, barrels: [{ length: 65, width: 20, offsetX: 0, offsetY: 0, angle: 0, recoil: 14, delay: 0 }, { length: 55, width: 25, offsetX: 0, offsetY: 0, angle: 0, recoil: 8, delay: 0.15 }] },
    'Stalker': { fov: 2.2, speedMult: 0.85, bulletSpdMult: 2.7, bulletDmgMult: 1.8, reloadMult: 2.0, barrels: [{ length: 80, width: 20, offsetX: 0, offsetY: 0, angle: 0, recoil: 20, delay: 0 }] },
    'Cañón de Riel': { fov: 2.5, speedMult: 0.8, bulletSpdMult: 6.0, bulletDmgMult: 4.0, bulletPenMult: 5.0, reloadMult: 4.0, barrels: [{ length: 100, width: 15, offsetX: 0, offsetY: 0, angle: 0, recoil: 30, delay: 0, railgun: true }] },
    'Capataz': { fov: 1.3, speedMult: 0.9, isSpawner: true, maxDrones: 8, barrels: [{ length: 25, width: 30, offsetX: 0, offsetY: -16, angle: -Math.PI/4, recoil: 0, delay: 0, drone: true }, { length: 25, width: 30, offsetX: 0, offsetY: 16, angle: Math.PI/4, recoil: 0, delay: 0.5, drone: true }] },
    'Portaaviones': { fov: 1.45, speedMult: 0.85, isSpawner: true, autoDrones: true, maxDrones: 20, barrels: [{ length: 25, width: 45, offsetX: 0, offsetY: -20, angle: Math.PI, recoil: 0, delay: 0, drone: true }, { length: 25, width: 45, offsetX: 0, offsetY: 0, angle: Math.PI, recoil: 0, delay: 0.3, drone: true }, { length: 25, width: 45, offsetX: 0, offsetY: 20, angle: Math.PI, recoil: 0, delay: 0.6, drone: true }] },
    'Señor de la Guerra': { fov: 1.4, speedMult: 0.85, isSpawner: true, autoDrones: true, maxDrones: 25, barrels: [{ length: 25, width: 30, offsetX: 25, offsetY: -25, angle: -Math.PI/4, recoil: 0, delay: 0, drone: true }, { length: 25, width: 30, offsetX: 25, offsetY: 25, angle: Math.PI/4, recoil: 0, delay: 0.2, drone: true }, { length: 25, width: 30, offsetX: -25, offsetY: -25, angle: -Math.PI*3/4, recoil: 0, delay: 0.4, drone: true }, { length: 25, width: 30, offsetX: -25, offsetY: 25, angle: Math.PI*3/4, recoil: 0, delay: 0.6, drone: true }] },
    'Invocador Alfa': { fov: 1.55, speedMult: 0.8, isSpawner: true, autoDrones: true, maxDrones: 40, barrels: [{ length: 30, width: 60, offsetX: 0, offsetY: -25, angle: Math.PI, recoil: 0, delay: 0, drone: true }, { length: 30, width: 60, offsetX: 0, offsetY: 25, angle: Math.PI, recoil: 0, delay: 0.5, drone: true }] },
    'Destructor': { fov: 1.15, speedMult: 0.85, bulletSpdMult: 0.75, bulletDmgMult: 3.5, bulletPenMult: 4, reloadMult: 3, barrels: [{ length: 45, width: 42, offsetX: 0, offsetY: 0, angle: 0, recoil: 25, delay: 0 }] },
    'Aniquilador': { fov: 1.15, speedMult: 0.85, bulletSpdMult: 0.8, bulletDmgMult: 3.0, bulletPenMult: 3.5, reloadMult: 0.65, spread: 0.15, barrels: [{ length: 45, width: 48, offsetX: 0, offsetY: 0, angle: 0, recoil: 22, delay: 0 }] },
    'Titán de Asalto': { fov: 1.1, speedMult: 0.8, bulletSpdMult: 0.85, bulletDmgMult: 3.2, bulletPenMult: 3.8, reloadMult: 0.6, spread: 0.15, barrels: [{ length: 48, width: 55, offsetX: 0, offsetY: 0, angle: 0, recoil: 28, delay: 0 }, { length: 35, width: 18, offsetX: 0, offsetY: -35, angle: 0, recoil: 5, delay: 0.2 }, { length: 35, width: 18, offsetX: 0, offsetY: 35, angle: 0, recoil: 5, delay: 0.2 }] },
    'Dreadnought': { fov: 1.0, speedMult: 0.7, bulletSpdMult: 0.9, bulletDmgMult: 6.0, bulletPenMult: 7.0, reloadMult: 0.8, spread: 0.2, barrels: [{ length: 55, width: 85, offsetX: 0, offsetY: 0, angle: 0, recoil: 45, delay: 0 }] },
    'Quad Tanque': { fov: 1.2, speedMult: 1, barrels: [{ length: 35, width: 20, offsetX: 0, offsetY: 0, angle: 0, recoil: 6, delay: 0 }, { length: 35, width: 20, offsetX: 0, offsetY: 0, angle: Math.PI/2, recoil: 6, delay: 0 }, { length: 35, width: 20, offsetX: 0, offsetY: 0, angle: Math.PI, recoil: 6, delay: 0 }, { length: 35, width: 20, offsetX: 0, offsetY: 0, angle: Math.PI*1.5, recoil: 6, delay: 0 }] },
    'Octo Tanque': { fov: 1.35, speedMult: 0.9, barrels: Array.from({length:8}, (_, i) => ({ length: 35, width: 20, offsetX: 0, offsetY: 0, angle: i * Math.PI/4, recoil: 4, delay: i%2===0 ? 0 : 0.5 })) },
    'Ciclón': { fov: 1.4, speedMult: 0.85, reloadMult: 0.6, barrels: Array.from({length:12}, (_, i) => ({ length: 40, width: 18, offsetX: 0, offsetY: 0, angle: i * Math.PI/6, recoil: 3, delay: i * 0.05 })) },
    'Nova Estelar': { fov: 1.5, speedMult: 0.8, reloadMult: 0.5, barrels: Array.from({length:16}, (_, i) => ({ length: 45, width: 18, offsetX: 0, offsetY: 0, angle: i * Math.PI/8, recoil: 2, delay: i * 0.03 })) }
};

const STAT_NAMES = ['Regeneración', 'Vida Máxima', 'Daño Corporal', 'Velocidad Bala', 'Penetración', 'Daño Bala', 'Recarga', 'Velocidad'];

const game = {
    state: 'MENU',
    players: {},
    entities: [],
    bullets: [],
    camera: { x: 4000, y: 4000, targetX: 4000, targetY: 4000 },
    zoom: 1,
    lastServerTime: 0,
    fps: 0,
    lastFrameTime: Date.now(),

    initMenuAction() {
        console.log('🎮 Game Client Ready');
        this.initUI();
        this.loop();
    },

    initUI() {
        const panel = document.getElementById('upgrade-panel');
        if (panel) {
            panel.innerHTML = '<div id="points-text">Puntos: <span id="ui-points">0</span></div>';
            STAT_NAMES.forEach((name, i) => {
                const row = document.createElement('div');
                row.className = 'upgrade-row';
                row.innerHTML = `
                    <button class="upgrade-btn" onclick="game.upgradeStat(${i})">+</button>
                    <div class="upgrade-info">
                        <span class="stat-name">${name}</span>
                        <div class="stat-bar"><div class="stat-fill" id="stat-fill-${i}"></div></div>
                    </div>
                `;
                panel.appendChild(row);
            });
        }

        const toggle = document.getElementById('toggle-upgrades');
        if (toggle) {
            toggle.onclick = () => {
                panel.classList.toggle('collapsed');
            };
        }
    },

    startMatch(username) {
        console.log('🚀 Starting Match:', username);
        const menu = document.getElementById('screen-menu');
        const ui = document.getElementById('ui-layer');
        if (menu) menu.style.display = 'none';
        if (ui) ui.classList.remove('hidden');
        this.state = 'PLAYING';
        network.joinGame(username, typeof getSkinColor === 'function' ? getSkinColor() : '#00f2ff');
    },

    receiveServerState(data) {
        Object.keys(data.players).forEach(id => {
            const serverPlayer = data.players[id];
            if (this.players[id]) {
                this.players[id].targetX = serverPlayer.x;
                this.players[id].targetY = serverPlayer.y;
                this.players[id].angle = serverPlayer.angle;
                this.players[id].hp = serverPlayer.hp;
                this.players[id].maxHp = serverPlayer.maxHp;
                this.players[id].score = serverPlayer.score;
                this.players[id].lvl = serverPlayer.lvl;
                this.players[id].tankClass = serverPlayer.tankClass;
                this.players[id].upgrades = serverPlayer.upgrades;
                this.players[id].stats = serverPlayer.stats;
                this.players[id].evoOptions = serverPlayer.evoOptions;
                this.players[id].radius = serverPlayer.radius;
            } else {
                this.players[id] = { ...serverPlayer, targetX: serverPlayer.x, targetY: serverPlayer.y };
            }
        });

        Object.keys(this.players).forEach(id => {
            if (!data.players[id]) delete this.players[id];
        });

        this.entities = data.entities || [];
        this.bullets = data.bullets || [];
        this.lastServerTime = data.time;

        const localPlayer = this.players[network.socket.id];
        if (localPlayer) {
            this.updateUI(localPlayer);
            this.camera.targetX = localPlayer.x;
            this.camera.targetY = localPlayer.y;
        }
    },

    updateUI(p) {
        const lvlEl = document.getElementById('ui-lvl');
        const pointsEl = document.getElementById('ui-points');
        const classEl = document.getElementById('class-text');
        const xpBar = document.getElementById('xp-bar');
        
        if (lvlEl) lvlEl.innerText = p.lvl;
        if (pointsEl) pointsEl.innerText = p.upgrades;
        if (classEl) classEl.innerText = p.tankClass;
        
        if (xpBar) {
            const xpPercent = (p.score % 100); 
            xpBar.style.width = xpPercent + '%';
        }

        if (p.stats) {
            p.stats.forEach((val, i) => {
                const fill = document.getElementById(`stat-fill-${i}`);
                if (fill) fill.style.width = (val * 10) + '%';
            });
        }

        const evoPanel = document.getElementById('evolution-panel');
        if (evoPanel) {
            if (p.evoOptions && p.evoOptions.length > 0) {
                if (evoPanel.childElementCount !== p.evoOptions.length) {
                    evoPanel.innerHTML = '';
                    p.evoOptions.forEach(opt => {
                        const btn = document.createElement('button');
                        btn.className = 'evo-btn';
                        btn.innerText = opt;
                        btn.onclick = () => this.evolveTo(opt);
                        evoPanel.appendChild(btn);
                    });
                }
            } else {
                evoPanel.innerHTML = '';
            }
        }
    },

    upgradeStat(index) {
        network.sendInput({ type: 'upgrade', index: index });
    },

    evolveTo(className) {
        network.sendInput({ type: 'evolve', class: className });
        const evoPanel = document.getElementById('evolution-panel');
        if (evoPanel) evoPanel.innerHTML = '';
    },

    update() {
        if (this.state !== 'PLAYING') return;

        this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;

        Object.values(this.players).forEach(p => {
            p.x += (p.targetX - p.x) * 0.35;
            p.y += (p.targetY - p.y) * 0.35;
        });

        if (typeof keys !== 'undefined' && typeof mouse !== 'undefined') {
            network.sendInput({
                up: keys['KeyW'] || keys['ArrowUp'],
                down: keys['KeyS'] || keys['ArrowDown'],
                left: keys['KeyA'] || keys['ArrowLeft'],
                right: keys['KeyD'] || keys['ArrowRight'],
                mouseX: mouse.x - window.innerWidth/2 + this.camera.x,
                mouseY: mouse.y - window.innerHeight/2 + this.camera.y,
                isShooting: mouse.isDown || keys['Space']
            });
        }

        const now = Date.now();
        this.fps = Math.round(1000 / (now - this.lastFrameTime));
        this.lastFrameTime = now;
        const fpsEl = document.getElementById('ui-fps');
        if (fpsEl) fpsEl.innerText = this.fps + ' FPS';
    },

    draw() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isLightMode ? '#e4e4e9' : '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.state !== 'PLAYING') return;

        ctx.save();
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);

        this.drawGrid(ctx);
        this.entities.forEach(e => this.drawEntity(ctx, e));
        Object.values(this.players).forEach(p => this.drawTank(ctx, p));

        this.bullets.forEach(b => {
            ctx.fillStyle = b.color || '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius || 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    },

    drawGrid(ctx) {
        ctx.strokeStyle = isLightMode ? '#d0d0d8' : '#15151a';
        ctx.lineWidth = 2;
        const spacing = 100;
        const startX = Math.floor((this.camera.x - window.innerWidth) / spacing) * spacing;
        const endX = Math.ceil((this.camera.x + window.innerWidth) / spacing) * spacing;
        const startY = Math.floor((this.camera.y - window.innerHeight) / spacing) * spacing;
        const endY = Math.ceil((this.camera.y + window.innerHeight) / spacing) * spacing;

        for (let x = startX; x <= endX; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
        }
        for (let y = startY; y <= endY; y += spacing) {
            ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
        }
    },

    drawEntity(ctx, e) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(Date.now() * 0.001); 
        
        ctx.fillStyle = e.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        if (e.type === 'square') {
            ctx.fillRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
            ctx.strokeRect(-e.radius, -e.radius, e.radius * 2, e.radius * 2);
        } else if (e.type === 'triangle') {
            this.drawPoly(ctx, 0, 0, e.radius, 3);
        } else if (e.type === 'pentagon') {
            this.drawPoly(ctx, 0, 0, e.radius, 5);
        }

        ctx.restore();
        
        if (e.hp < e.maxHp) {
            ctx.fillStyle = '#000'; ctx.fillRect(e.x - 20, e.y + e.radius + 10, 40, 5);
            ctx.fillStyle = '#00ff00'; ctx.fillRect(e.x - 20, e.y + e.radius + 10, 40 * (e.hp / e.maxHp), 5);
        }
    },

    drawPoly(ctx, x, y, r, sides) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            ctx.lineTo(x + r * Math.cos(i * 2 * Math.PI / sides), y + r * Math.sin(i * 2 * Math.PI / sides));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    drawTank(ctx, p) {
        const c = CLASSES[p.tankClass] || CLASSES['Tanque'];
        ctx.save();
        ctx.translate(p.x, p.y);
        
        ctx.save();
        ctx.rotate(p.angle);
        ctx.fillStyle = '#999';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        c.barrels.forEach(b => {
            ctx.save();
            ctx.translate(b.offsetX, b.offsetY);
            ctx.rotate(b.angle);
            ctx.fillRect(0, -b.width / 2, b.length, b.width);
            ctx.strokeRect(0, -b.width / 2, b.length, b.width);
            ctx.restore();
        });
        ctx.restore();

        ctx.fillStyle = p.color || '#00f2ff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        
        if (p.tankClass === 'Portaaviones') {
            ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
            ctx.strokeRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.radius || 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
        ctx.fillStyle = '#000'; ctx.fillRect(p.x - 30, p.y + (p.radius || 26) + 15, 60, 6);
        ctx.fillStyle = '#00ff00'; ctx.fillRect(p.x - 30, p.y + (p.radius || 26) + 15, 60 * (p.hp / (p.maxHp || 100)), 6);
        
        ctx.fillStyle = isLightMode ? '#000' : '#fff';
        ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - (p.radius || 26) - 20);
    },

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    onServerGameOver(data) {
        this.state = 'GAMEOVER';
        const ui = document.getElementById('ui-layer');
        const go = document.getElementById('screen-gameover');
        if (ui) ui.classList.add('hidden');
        if (go) go.classList.remove('hidden');
        const ds = document.getElementById('death-stats');
        if (ds) ds.innerText = `Puntuación: ${data.score} | Nivel: ${data.lvl}`;
    },

    togglePause() {
        const menu = document.getElementById('pause-menu');
        if (menu) menu.classList.toggle('show-modal');
    }
};

window.game = game;
