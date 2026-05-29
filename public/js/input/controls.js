// js/input/controls.js

const joystickL = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, moveX: 0, moveY: 0, id: null };
const joystickR = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, angle: 0, id: null };
const keys = {}; 
const mouse = { x: 0, y: 0, isDown: false, rightDown: false };

// Validar estrictamente si la interacción es con la UI
function isUI(e) { 
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.slider')) return true;
    if (e.target.id !== 'gameCanvas') return true;

    return e.target.closest('#upgrade-panel') || 
           e.target.closest('#evolution-panel') || 
           e.target.closest('#toggle-upgrades') || 
           e.target.closest('#settings-menu') || 
           e.target.closest('#shop-menu') || 
           e.target.closest('#trophies-menu') || 
           e.target.closest('#pause-menu') || 
           e.target.closest('#minimap-container') || 
           e.target.closest('#leaderboard') ||
           e.target.closest('.menu-overlay'); 
}

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    
    // Toggle Pausa con P o Escape
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (typeof game !== 'undefined' && (game.state === 'PLAYING' || game.state === 'PAUSED')) {
            game.togglePause();
        }
    }

    // Soporte para habilidad especial
    if ((e.code === 'ShiftLeft' || e.code === 'KeyQ') && typeof game !== 'undefined' && game.player && game.state === 'PLAYING') {
        if (typeof game.player.activateAbility === 'function') game.player.activateAbility();
    }
}); 

window.addEventListener('keyup', e => keys[e.code] = false);

window.addEventListener('mousemove', e => { 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
});

window.addEventListener('mousedown', e => { 
    if (isUI(e) || (typeof game !== 'undefined' && game.state === 'PAUSED')) {
        mouse.isDown = false;
        mouse.rightDown = false;
        return;
    } 
    if (e.button === 0) mouse.isDown = true; 
    if (e.button === 2) mouse.rightDown = true; 
});

window.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.isDown = false;
    if (e.button === 2) mouse.rightDown = false;
});

window.addEventListener('touchstart', e => { 
    if (isUI(e)) return; 
    if (typeof game !== 'undefined' && game.state === 'PAUSED') return;

    for (let i = 0; i < e.changedTouches.length; i++) { 
        let t = e.changedTouches[i]; 
        if (t.clientX < window.innerWidth / 2 && !joystickL.active) {
            joystickL.active = true; 
            joystickL.id = t.identifier; 
            joystickL.startX = joystickL.curX = t.clientX; 
            joystickL.startY = joystickL.curY = t.clientY;
        } else if (t.clientX >= window.innerWidth / 2 && !joystickR.active) {
            joystickR.active = true; 
            joystickR.id = t.identifier; 
            joystickR.startX = joystickR.curX = t.clientX; 
            joystickR.startY = joystickR.curY = t.clientY; 
            mouse.isDown = true;
        } 
    } 
}, { passive: true });

window.addEventListener('touchmove', e => {
    if (isUI(e)) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        if (joystickL.active && t.identifier === joystickL.id) {
            joystickL.curX = t.clientX; 
            joystickL.curY = t.clientY; 
            let dx = t.clientX - joystickL.startX, dy = t.clientY - joystickL.startY, dist = Math.sqrt(dx * dx + dy * dy); 
            if (dist > 50) { dx = (dx / dist) * 50; dy = (dy / dist) * 50; joystickL.curX = joystickL.startX + dx; joystickL.curY = joystickL.startY + dy; } 
            joystickL.moveX = dx / 50; 
            joystickL.moveY = dy / 50;
        } else if (joystickR.active && t.identifier === joystickR.id) {
            joystickR.curX = t.clientX; 
            joystickR.curY = t.clientY; 
            let dx = t.clientX - joystickR.startX, dy = t.clientY - joystickR.startY, dist = Math.sqrt(dx * dx + dy * dy); 
            if (dist > 50) { dx = (dx / dist) * 50; dy = (dy / dist) * 50; joystickR.curX = joystickR.startX + dx; joystickR.curY = joystickR.startY + dy; } 
            joystickR.angle = Math.atan2(dy, dx);
        }
    }
    if (e.target.id === 'gameCanvas') e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', e => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        let t = e.changedTouches[i];
        if (joystickL.id === t.identifier) {
            joystickL.active = false; 
            joystickL.moveX = joystickL.moveY = 0; 
            joystickL.id = null;
        }
        if (joystickR.id === t.identifier) {
            joystickR.active = false; 
            mouse.isDown = false; 
            joystickR.id = null;
        }
    }
});

function drawJoysticks(ctx) {
    if (joystickL.active) { 
        ctx.save(); 
        ctx.globalAlpha = 0.2; 
        ctx.fillStyle = "#fff"; 
        ctx.beginPath(); 
        ctx.arc(joystickL.startX, joystickL.startY, 50, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.globalAlpha = 0.4; 
        ctx.beginPath(); 
        ctx.arc(joystickL.curX, joystickL.curY, 25, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.restore(); 
    }
    if (joystickR.active) { 
        ctx.save(); 
        ctx.globalAlpha = 0.2; 
        ctx.fillStyle = "#fff"; 
        ctx.beginPath(); 
        ctx.arc(joystickR.startX, joystickR.startY, 50, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.globalAlpha = 0.4; 
        ctx.beginPath(); 
        ctx.arc(joystickR.curX, joystickR.curY, 25, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.restore(); 
    }
}
