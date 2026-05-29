// server/gameLogic/Constants.js
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

const EVOLUTIONS = {
    15: ['Doble', 'Francotirador', 'Ametralladora'],
    30: { 'Doble': ['Quad Tanque'], 'Francotirador': ['Asesino', 'Capataz'], 'Ametralladora': ['Destructor'] },
    45: { 'Quad Tanque': ['Octo Tanque'], 'Asesino': ['Cazador'], 'Capataz': ['Portaaviones'], 'Destructor': ['Aniquilador'] },
    60: { 'Octo Tanque': ['Ciclón'], 'Cazador': ['Stalker'], 'Portaaviones': ['Señor de la Guerra'], 'Aniquilador': ['Titán de Asalto'] },
    80: { 'Ciclón': ['Nova Estelar'], 'Stalker': ['Cañón de Riel'], 'Señor de la Guerra': ['Invocador Alfa'], 'Titán de Asalto': ['Dreadnought'] }
};

module.exports = { CLASSES, EVOLUTIONS };
