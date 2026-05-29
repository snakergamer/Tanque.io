// public/js/core/game.js

const game = {
    state: 'MENU',
    players: {},
    entities: [],
    bullets: [],
    camera: { x: 4000, y: 4000 },
    zoom: 1,
    _loopActive: false,

    initMenuAction() {
        console.log('🎮 Game Client Ready');
        if (!this._loopActive) {
            this._loopActive = true;
            this.loop();
        }
    },

    startMatch(username) {
        console.log('🚀 Starting Match:', username);
        const menu = document.getElementById('screen-menu');
        const ui = document.getElementById('ui-layer');
        if (menu) menu.style.display = 'none';
        if (ui) ui.classList.remove('hidden');

        this.state = 'PLAYING';
        Network.joinGame(username, typeof getSkinColor === 'function' ? getSkinColor() : '#00f2ff');
    },

    receiveServerState(data) {
        // REPARACIÓN: Actualización real de objetos
        this.players = data.players || {};
        this.entities = data.entities || [];
        this.bullets = data.bullets || [];

        // Seguimiento de cámara al jugador local
        if (this.players[socket.id]) {
            const p = this.players[socket.id];
            this.camera.x = p.x;
            this.camera.y = p.y;
        }
    },

    update() {
        if (this.state !== 'PLAYING') return;

        // Captura de inputs
        if (typeof keys !== 'undefined' && typeof mouse !== 'undefined') {
            Network.sendInput({
                up: keys['KeyW'] || keys['ArrowUp'],
                down: keys['KeyS'] || keys['ArrowDown'],
                left: keys['KeyA'] || keys['ArrowLeft'],
                right: keys['KeyD'] || keys['ArrowRight'],
                mouseX: mouse.x - window.innerWidth/2 + this.camera.x,
                mouseY: mouse.y - window.innerHeight/2 + this.camera.y,
                isShooting: mouse.isDown || keys['Space']
            });
        }
    },

    draw() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Limpieza absoluta del Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.state !== 'PLAYING') return;

        ctx.save();
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);

        // 2. Dibujar Escenario
        this.drawArena(ctx);

        // 3. Dibujar Jugadores
        Object.values(this.players).forEach(p => {
            this.drawTank(ctx, p);
        });

        // 4. Dibujar Proyectiles
        this.bullets.forEach(b => {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2); ctx.fill();
        });

        ctx.restore();
    },

    drawArena(ctx) {
        ctx.strokeStyle = '#15151a';
        ctx.lineWidth = 2;
        const spacing = 100;
        for (let x = this.camera.x - 1200; x < this.camera.x + 1200; x += spacing) {
            let sx = Math.floor(x / spacing) * spacing;
            ctx.beginPath(); ctx.moveTo(sx, this.camera.y - 1000); ctx.lineTo(sx, this.camera.y + 1000); ctx.stroke();
        }
        for (let y = this.camera.y - 1200; y < this.camera.y + 1200; y += spacing) {
            let sy = Math.floor(y / spacing) * spacing;
            ctx.beginPath(); ctx.moveTo(this.camera.x - 1000, sy); ctx.lineTo(this.camera.x + 1000, sy); ctx.stroke();
        }
    },

    drawTank(ctx, p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        // Cuerpo
        ctx.fillStyle = p.color || '#00f2ff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Barra de Vida
        ctx.restore();
        ctx.fillStyle = '#000'; ctx.fillRect(p.x - 30, p.y + 40, 60, 6);
        ctx.fillStyle = '#00ff00'; ctx.fillRect(p.x - 30, p.y + 40, 60 * (p.hp / p.maxHp), 6);
        
        // Nombre
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - 45);
    },

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    onServerGameOver(data) {
        this.state = 'GAMEOVER';
        document.getElementById('screen-gameover').classList.remove('hidden');
    }
};
