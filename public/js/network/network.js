// public/js/network/network.js

// 1. Detección dinámica del servidor
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SERVER_URL = isLocal ? 'http://localhost:3000' : 'https://tanque-backend.onrender.com';

console.log(`🌐 Conectando a servidor en: ${SERVER_URL}`);

// Configuración de socket con transporte forzado y CORS prep
const socket = io(SERVER_URL, {
    transports: ['websocket'],
    upgrade: false
});

const Network = {
    socket: socket,
    isConnected: false,

    init() {
        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('✅ Conexión establecida con el Backend');
            
            const savedUser = localStorage.getItem('tank_session');
            if (savedUser) {
                this.socket.emit('checkSession', savedUser);
            }
        });

        // REPARACIÓN: Sincronización real de estado
        this.socket.on('gameState', (data) => {
            if (typeof game !== 'undefined' && game.state === 'PLAYING') {
                game.receiveServerState(data);
            }
        });

        this.socket.on('authSuccess', (username) => {
            localStorage.setItem('tank_session', username);
            if (typeof game !== 'undefined') {
                game.startMatch(username);
            }
        });

        this.socket.on('authResponse', (res) => {
            if (res.success) {
                this.socket.emit('authSuccess', res.userData.username);
            } else {
                alert('Error: ' + res.message);
                localStorage.removeItem('tank_session');
            }
        });

        this.socket.on('gameOver', (data) => {
            if (typeof game !== 'undefined') game.onServerGameOver(data);
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.warn('❌ Desconectado del servidor');
        });
    },

    sendInput(input) {
        if (this.isConnected) this.socket.emit('input', input);
    },

    login(user, pass) { this.socket.emit('login', { username: user, password: pass }); },
    register(user, pass) { this.socket.emit('register', { username: user, password: pass }); },
    joinGame(name, color) { this.socket.emit('join', { name, color }); }
};

Network.init();
