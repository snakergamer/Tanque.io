// public/js/network/network.js

// Forzar la conexión al servidor de Render si no es localhost
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SERVER_URL = isLocal ? 'http://localhost:3000' : 'https://tanque-backend.onrender.com';

console.log("🌐 Conectando a servidor en:", SERVER_URL);

// Aquí se usa el "io" que viene desde el CDN de arriba
const socket = io(SERVER_URL, { transports: ['websocket'] });

const network = {
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

        // Sincronización real de estado
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

// CRÍTICO: Exportarlo en minúsculas para que interface.js lo encuentre
window.network = network;
network.init();
