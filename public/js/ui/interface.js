// public/js/ui/interface.js

let isLightMode = false;

// --- SISTEMA DE SKINS ---
const SKINS = [
    { id: 'default', name: 'Original', color: '#00f2ff', cost: 0, desc: 'Cian clásico' },
    { id: 'gold', name: 'Dorado', color: '#ffd700', cost: 5000, desc: 'Brillo dorado de campeón' },
    { id: 'chrome', name: 'Cromado', color: '#e0e0e0', cost: 3000, desc: 'Acero reflectante' },
    { id: 'military', name: 'Camuflaje', color: '#6b8e23', cost: 2000, desc: 'Verde militar opaco' },
    { id: 'magma', name: 'Magma', color: '#ff4500', cost: 8000, desc: 'Furia volcánica' },
    { id: 'neon', name: 'Neón', color: '#ff00ff', cost: 12000, desc: 'Ultravioleta radiante' },
    { id: 'shadow', name: 'Sombra', color: '#2d2d2d', cost: 15000, desc: 'Oscuridad absoluta' },
    { id: 'coral', name: 'Coral', color: '#ff6b81', cost: 4000, desc: 'Rosado intenso' },
    { id: 'ocean', name: 'Océano', color: '#006994', cost: 10000, desc: 'Azul profundo' },
];

function initSkinStorage() {
    if (!localStorage.getItem('tank_ownedSkins')) localStorage.setItem('tank_ownedSkins', JSON.stringify(['default']));
    if (!localStorage.getItem('tank_equippedSkin')) localStorage.setItem('tank_equippedSkin', 'default');
}

function getOwnedSkins() {
    return JSON.parse(localStorage.getItem('tank_ownedSkins') || '["default"]');
}

function getEquippedSkin() {
    return localStorage.getItem('tank_equippedSkin') || 'default';
}

function getSkinColor() {
    let id = getEquippedSkin();
    let skin = SKINS.find(s => s.id === id);
    return skin ? skin.color : '#00f2ff';
}

function buySkin(id) {
    let owned = getOwnedSkins();
    if (owned.includes(id)) return false;
    let skin = SKINS.find(s => s.id === id);
    if (!skin || skin.cost === 0) return false;
    let highScore = parseInt(localStorage.getItem('tank_highScore') || '0');
    if (highScore < skin.cost) return false;
    owned.push(id);
    localStorage.setItem('tank_ownedSkins', JSON.stringify(owned));
    return true;
}

function equipSkin(id) {
    let owned = getOwnedSkins();
    if (!owned.includes(id)) return false;
    localStorage.setItem('tank_equippedSkin', id);
    if (typeof C !== 'undefined') C.player = getSkinColor();
    return true;
}

function renderShop() {
    let grid = document.getElementById('shop-grid');
    let hsEl = document.getElementById('shop-highscore');
    if (!grid) return;
    let highScore = parseInt(localStorage.getItem('tank_highScore') || '0');
    let owned = getOwnedSkins();
    let equipped = getEquippedSkin();
    if (hsEl) hsEl.innerText = highScore.toLocaleString();
    grid.innerHTML = '';
    SKINS.forEach(skin => {
        let isOwned = owned.includes(skin.id);
        let isEquipped = equipped === skin.id;
        let canBuy = highScore >= skin.cost;
        let item = document.createElement('div');
        item.className = `shop-item ${isEquipped ? 'equipped' : (isOwned ? 'owned' : 'locked')}`;

        let swatch = document.createElement('div');
        swatch.className = 'shop-swatch';
        swatch.style.background = skin.color;

        let info = document.createElement('div');
        info.className = 'shop-info';
        info.innerHTML = `<span class="shop-name">${skin.name}</span><span class="shop-desc">${skin.desc}${skin.cost > 0 ? ` — ${skin.cost.toLocaleString()} pts` : ' — Gratis'}</span>`;

        let btn = document.createElement('button');
        btn.className = 'shop-btn';
        if (isEquipped) {
            btn.className += ' equipped-label';
            btn.innerText = '✓';
        } else if (isOwned) {
            btn.className += ' equip';
            btn.innerText = 'Usar';
            btn.onclick = () => { equipSkin(skin.id); renderShop(); };
        } else if (canBuy) {
            btn.className += ' buy';
            btn.innerText = 'Comprar';
            btn.onclick = () => { if (buySkin(skin.id)) { renderShop(); } };
        } else {
            btn.className += ' owned-label';
            btn.innerText = '🔒';
            btn.style.borderColor = '#ff2b56';
            btn.style.color = '#ff2b56';
        }

        item.appendChild(swatch);
        item.appendChild(info);
        item.appendChild(btn);
        grid.appendChild(item);
    });
}

// --- PERSISTENCIA LOCAL (Fallback) ---
function initStorage() {
    if (!localStorage.getItem('tank_highScore')) localStorage.setItem('tank_highScore', '0');
    if (!localStorage.getItem('tank_maxLevel')) localStorage.setItem('tank_maxLevel', '1');
    if (!localStorage.getItem('tank_trophies')) localStorage.setItem('tank_trophies', JSON.stringify([]));
}

// --- INTERFAZ Y RENDERIZADO ---

function toggleMode() {
    isLightMode = !isLightMode;
    document.documentElement.classList.toggle('light-mode', isLightMode);
    if (typeof C !== 'undefined') { C.bg = isLightMode ? '#e4e4e9' : '#08080a'; C.grid = isLightMode ? '#d0d0d8' : '#15151a'; }
}

const minimapCanvas = document.getElementById('minimap'), minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
const canvas = document.getElementById('gameCanvas'), ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
if (ctx) window.ctx = ctx;

let settings = { retina: true };

function resize() {
    if (!canvas) return;
    let dpr = settings.retina ? (window.devicePixelRatio || 1) : 1; 
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) dpr = Math.min(dpr, 1.5); 
    canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; 
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px'; 
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0); 
    if (minimapCanvas) minimapCanvas.width = minimapCanvas.height = (window.innerWidth < 1024 ? 120 : 180);
}
window.addEventListener('resize', resize);

// Inicialización de Listeners al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    initSkinStorage();
    resize();
    
    // 1. Punto de Entrada Reparado
    if (typeof game !== 'undefined' && typeof game.initMenuAction === 'function') {
        game.initMenuAction();
    }

    // Gestión de Modales
    const toggleModal = (id) => { 
        const m = document.getElementById(id);
        if (m) m.classList.toggle('show-modal');
    };

    // Botones Inicio
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.onclick = () => game.start();

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if (user && pass) network.login(user, pass);
            else alert('Ingresa usuario y contraseña');
        };
    }

    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.onclick = () => {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if (user && pass) network.register(user, pass);
            else alert('Ingresa usuario y contraseña');
        };
    }

    const retryBtn = document.querySelector('#screen-gameover .start-btn');
    if (retryBtn) retryBtn.onclick = () => game.start();

    // Ajustes y extras
    document.getElementById('menu-settings-btn').onclick = () => toggleModal('settings-menu');
    document.getElementById('close-settings').onclick = () => toggleModal('settings-menu');

    document.getElementById('menu-shop-btn').onclick = () => { renderShop(); toggleModal('shop-menu'); };
    document.getElementById('close-shop').onclick = () => toggleModal('shop-menu');
    
    document.getElementById('menu-trophies-btn').onclick = () => { toggleModal('trophies-menu'); };
    document.getElementById('close-trophies').onclick = () => toggleModal('trophies-menu');

    // In-Game
    document.getElementById('pause-btn').onclick = () => game.togglePause();
    document.getElementById('resume-btn').onclick = () => game.togglePause();
    document.getElementById('exit-btn').onclick = () => location.reload();

    window.addEventListener('contextmenu', e => e.preventDefault());
});
