// js/entities/tank.js
class Tank extends Entity {
    constructor(x, y, c, ip = false, n = "Bot") {
        super(x, y, 26, c, 100);
        this.isPlayer = ip;
        this.name = n;
        this.tankClass = 'Tanque';
        this.drones = [];
        this.stats = [0, 0, 0, 0, 0, 0, 0, 0];
        this.upgradesAvailable = 0;
        this.lvl = 1;
        this.xp = 0;
        this.nextXp = 15;
        this.score = 0;
        this.evolutionTier = 0;
        this.calcStats();
        this.hp = this.maxHp;
        this.cooldown = 0;
        this.recoilVel = new Vector(0, 0);
        this.barrelVisuals = []; 
        this.leanX = 0; 
        this.leanY = 0;
        this.pendingShots = [];
        this.kills = 0;
        
        // Habilidades Activas
        this.abilityCooldown = 0;
        this.abilityTimer = 0; // Tiempo que dura activa
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
        this.accel = 0.5;
        this.friction = 0.86;
        this.barrelVisuals = c.barrels.map(() => ({ offset: 0, vel: 0 }));
    }

    upgrade(si) {
        if (this.upgradesAvailable > 0 && this.stats[si] < 7) {
            this.stats[si]++;
            this.upgradesAvailable--;
            this.calcStats();
            if (this.isPlayer) game.updateUI();
        }
    }

    getBotBuild() {
        const builds = {
            'Tanque': [5, 4, 6, 7, 3, 2, 1, 0],
            'Destructor': [5, 4, 6, 2, 1, 7, 3, 0],
            'Aniquilador': [5, 4, 6, 2, 1, 7, 3, 0],
            'Titán de Asalto': [5, 4, 6, 1, 2, 7, 3, 0],
            'Dreadnought': [5, 4, 6, 1, 2, 0, 7, 3],
            'Francotirador': [3, 5, 4, 6, 7, 1, 0, 2],
            'Asesino': [3, 5, 4, 6, 7, 1, 0, 2],
            'Stalker': [3, 5, 4, 6, 7, 1, 0, 2],
            'Cañón de Riel': [5, 4, 3, 6, 7, 1, 0, 2],
            'Ametralladora': [6, 5, 4, 3, 7, 1, 2, 0],
            'Doble': [6, 5, 4, 7, 3, 1, 2, 0],
            'Quad Tanque': [6, 5, 4, 7, 3, 1, 2, 0],
            'Octo Tanque': [6, 5, 4, 7, 2, 1, 3, 0],
            'Ciclón': [6, 5, 4, 7, 2, 1, 3, 0],
            'Nova Estelar': [6, 5, 4, 7, 2, 1, 3, 0]
        };
        return builds[this.tankClass] || builds['Tanque'];
    }

    getRank() {
        let allTanks = game.entities.filter(e => e instanceof Tank && !e.isDead).sort((a, b) => b.score - a.score);
        let idx = allTanks.indexOf(this);
        return idx >= 0 ? idx + 1 : Infinity;
    }

    evolve(nc) {
        this.tankClass = nc;
        this.evolutionTier++;
        this.calcStats();
        game.createParticles(this.pos.x, this.pos.y, 30, '#fff', 8);
        playSound('levelup', this.pos.x, this.pos.y);
        if (this.isPlayer) {
            let p = document.getElementById('evolution-panel');
            if (p) p.innerHTML = '';
            let ct = document.getElementById('class-text');
            if (ct) ct.innerText = nc;
            game.updateUI();
            this.checkEvolutions();
        }
    }

    activateAbility() {
        if (this.abilityCooldown > 0 || this.lvl < 45 || this.isDead) return;
        
        let c = this.tankClass;
        if (c === 'Portaaviones' || c === 'Invocador Alfa') {
            this.abilityTimer = 240; // 4 segundos
            this.abilityCooldown = 600; // 10 segundos
        } else if (c === 'Dreadnought' || c === 'Titán de Asalto') {
            this.abilityTimer = 180; // 3 segundos
            this.abilityCooldown = 900; // 15 segundos
        } else if (c === 'Nova Estelar' || c === 'Ciclón') {
            // Explosión de Supernova
            for (let i = 0; i < 32; i++) {
                let a = (i / 32) * Math.PI * 2;
                game.addBulletInternal(bulletPool.get(this.pos.x, this.pos.y, a, this.bulletSpd * 1.5, this.bulletDmg, this.bulletPen, this.color, this));
            }
            this.abilityCooldown = 600; // 10 segundos
        }
        
        if (this.isPlayer) playSound('levelup', this.pos.x, this.pos.y);
    }

    takeDamage(amt, src) {
        // Dreadnought Shield: Reduce damage by 80%
        if (this.abilityTimer > 0 && (this.tankClass === 'Dreadnought' || this.tankClass === 'Titán de Asalto')) {
            amt *= 0.2;
        }
        super.takeDamage(amt, src);
        
        // Registrar bajas para logros
        if (this.isPlayer && src && src.owner && src.owner.isDead && src.owner instanceof Tank && !src.owner.isPlayer) {
            this.kills++;
        }
    }

    update(tx, ty, sl) {
        if (this.isDead) return; 
        
        // Cooldowns de habilidad (solo visual/local)
        if (this.abilityTimer > 0) this.abilityTimer--;
        if (this.abilityCooldown > 0) this.abilityCooldown--;

        // Interpolación hacia la posición del servidor
        if (this.targetPos) {
            this.pos.x += (this.targetPos.x - this.pos.x) * 0.35;
            this.pos.y += (this.targetPos.y - this.pos.y) * 0.35;
        }

        // Efectos de inclinación y barriles
        this.leanX += (this.vel.x * 2.5 - this.leanX) * 0.1; 
        this.leanY += (this.vel.y * 2.5 - this.leanY) * 0.1;
        this.barrelVisuals.forEach(bv => { 
            let force = -bv.offset * 0.15; 
            bv.vel += force; bv.vel *= 0.85; bv.offset += bv.vel; 
        });
        
        // El disparo y la lógica de drones ahora son autoritativos en el servidor,
        // pero podemos mantener animaciones locales si es necesario.
        if (this.flash > 0) this.flash--;
    }

    draw(ctx) {
        if (this.isDead || !game.isInView(this.pos, this.radius * 4)) return;

        let speed = this.vel.mag();
        if (speed > 1.5 && game.particles.length < 600) {
            let isTop3 = this.getRank() <= 3;
            let trailColor = isTop3 ? this.color : 'rgba(160,160,160,0.5)';
            let dir = this.vel.clone().normalize().mult(-1);
            for (let i = 0; i < (isTop3 ? 2 : 1); i++) {
                let px = this.pos.x + dir.x * this.radius + (Math.random() - 0.5) * 12;
                let py = this.pos.y + dir.y * this.radius + (Math.random() - 0.5) * 12;
                let p = particlePool.get(px, py, trailColor, isTop3 ? 5 : 3, 'circle', Math.random() * Math.PI * 2);
                p.vel = dir.clone().mult(isTop3 ? 4 : 2);
                p.life = 0.6;
                p.decay = 0.04;
                game.particles.push(p);
            }
        }

        ctx.save();
        ctx.translate(this.pos.x + this.leanX, this.pos.y + this.leanY);
        ctx.rotate(this.angle);
        
        if (this.invulnerable > 0 && Math.floor(Date.now() / 150) % 2 === 0) ctx.globalAlpha = 0.4;
        
        if (!game.performanceMode) {
            ctx.shadowColor = 'rgba(0,0,0,0.25)'; 
            ctx.shadowBlur = 10; 
            ctx.shadowOffsetY = 6;
        } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
        }
        
        let c = CLASSES[this.tankClass]; 
        let lightMode = typeof isLightMode !== 'undefined' && isLightMode;
        
        ctx.fillStyle = '#999'; 
        ctx.strokeStyle = '#000'; 
        ctx.lineWidth = game.performanceMode ? 3 : (lightMode ? 8 : 4.5);
        
        c.barrels.forEach((b, i) => { 
            ctx.save(); 
            ctx.translate(b.offsetX, b.offsetY); 
            ctx.rotate(b.angle); 
            let visualOffset = this.barrelVisuals[i] ? this.barrelVisuals[i].offset : 0; 
            ctx.fillRect(visualOffset, -b.width / 2, b.length, b.width); 
            ctx.strokeRect(visualOffset, -b.width / 2, b.length, b.width); 
            ctx.restore(); 
        });
        
        ctx.fillStyle = this.flash > 0 ? '#fff' : this.color; 
        if (!lightMode && !game.performanceMode) { 
            ctx.shadowBlur = 20; 
            ctx.shadowColor = this.color; 
        }
        
        if (this.tankClass === 'Portaaviones') {
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Dreadnought Shield Visual
        if (this.abilityTimer > 0 && (this.tankClass === 'Dreadnought' || this.tankClass === 'Titán de Asalto')) {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = game.performanceMode ? 3 : 5;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        
        ctx.rotate(-this.angle);
        
        ctx.shadowBlur = 0; 
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = lightMode ? '#111116' : '#ffffff';
        ctx.font = 'bold 18px Arial'; 
        ctx.textAlign = 'center';
        ctx.strokeStyle = lightMode ? '#fff' : '#000'; 
        ctx.lineWidth = game.performanceMode ? 3 : (lightMode ? 3 : 4);
        ctx.strokeText(this.name, 0, -this.radius - 22);
        ctx.fillText(this.name, 0, -this.radius - 22);
        
        ctx.restore();
        this.drawHealthBar(ctx);
    }

    gainXp(a) {
        if (isNaN(a) || a <= 0) return; 
        this.xp += a;
        this.score += a;
        
        while (this.xp >= this.nextXp && this.lvl < 100) {
            this.lvl++;
            this.xp -= this.nextXp; 
            this.nextXp = Math.floor(40 + (this.lvl * 15) + Math.pow(this.lvl, 1.85) * 5);
            
            // Lógica de puntos de mejora: 1 punto por nivel hasta el tope de 56 total (aplicados + disponibles)
            let totalApplied = this.stats.reduce((a, b) => a + b, 0);
            if (totalApplied + this.upgradesAvailable < 56) {
                this.upgradesAvailable++;
            } else {
                this.upgradesAvailable = 0; // Clavado en 0 si ya se llegó al límite
            }
            
            this.maxHp += 5;
            this.hp += 5; 
            game.createParticles(this.pos.x, this.pos.y, 20, '#ffeb3b', 8);
            
            if (this.isPlayer) { 
                playSound('levelup', this.pos.x, this.pos.y);
                this.checkEvolutions(); 
            } else {
                let build = this.getBotBuild();
                for (let statIndex of build) {
                    if (this.upgradesAvailable > 0 && this.stats[statIndex] < 7) {
                        this.upgrade(statIndex);
                    }
                }
                if ([15, 30, 45, 60, 80].includes(this.lvl)) {
                    let opts = []; 
                    if (this.lvl === 15) opts = EVOLUTIONS[15]; 
                    else if (EVOLUTIONS[this.lvl] && EVOLUTIONS[this.lvl][this.tankClass]) opts = EVOLUTIONS[this.lvl][this.tankClass];
                    if (opts.length) this.evolve(opts[Math.floor(Math.random() * opts.length)]);
                }
            }
        }
        
        // Verificación final del tope de puntos
        let totalAppliedFinal = this.stats.reduce((a, b) => a + b, 0);
        if (totalAppliedFinal >= 56) this.upgradesAvailable = 0;

        if (this.isPlayer) game.updateUI();
    }

    checkEvolutions() {
        if (!this.isPlayer) return;
        let p = document.getElementById('evolution-panel');
        if (!p) return;
        p.innerHTML = '';
        let o = [];
        if (this.lvl >= 15 && this.evolutionTier === 0) o = EVOLUTIONS[15];
        else if (this.lvl >= 30 && this.evolutionTier === 1 && EVOLUTIONS[30][this.tankClass]) o = EVOLUTIONS[30][this.tankClass];
        else if (this.lvl >= 45 && this.evolutionTier === 2 && EVOLUTIONS[45][this.tankClass]) o = EVOLUTIONS[45][this.tankClass];
        else if (this.lvl >= 60 && this.evolutionTier === 3 && EVOLUTIONS[60][this.tankClass]) o = EVOLUTIONS[60][this.tankClass];
        else if (this.lvl >= 80 && this.evolutionTier === 4 && EVOLUTIONS[80][this.tankClass]) o = EVOLUTIONS[80][this.tankClass];
        
        if (o.length) {
            o.forEach(opt => {
                let b = document.createElement('button');
                b.className = 'evo-btn';
                b.style.display = 'block';
                b.innerText = opt;
                b.onclick = () => this.evolve(opt);
                p.appendChild(b);
            });
        }
    }
}
