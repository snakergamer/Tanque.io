// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const GameLoop = require('./gameLogic/gameLoop');
const AuthController = require('./auth/authController');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://tanque-io.web.app", "https://tanque-io.firebaseapp.com"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar Motor de Juego autoritativo
const game = new GameLoop(io);
game.start();

// Hook de muerte para persistencia
game.onPlayerDeath = async (player) => {
    const socket = io.sockets.sockets.get(player.id);
    if (socket && socket.userData) {
        const username = socket.userData.username;
        const result = await AuthController.updateRecords(username, player.score, player.lvl);
        if (result.success) {
            socket.emit('recordUpdated', result.updates);
            socket.userData = { ...socket.userData, ...result.updates };
        }
    }
};

io.on('connection', (socket) => {
    console.log(`🔌 Socket conectado: ${socket.id}`);

    // REPARACIÓN: Soporte para F5 y reconexión
    socket.on('checkSession', async (username) => {
        console.log(`🔄 Verificando sesión: ${username}`);
        const result = await AuthController.login(username, null, true);
        if (result.success) {
            socket.userData = result.userData;
            socket.emit('authSuccess', username); // Gatilla entrada directa
            console.log(`✅ Sesión validada para ${username}`);
        }
    });

    socket.on('register', async (data) => {
        const result = await AuthController.register(data.username, data.password);
        socket.emit('authResponse', result);
    });

    socket.on('login', async (data) => {
        const result = await AuthController.login(data.username, data.password);
        if (result.success) {
            socket.userData = result.userData;
            socket.emit('authSuccess', data.username);
        } else {
            socket.emit('authResponse', result);
        }
    });

    socket.on('join', (data) => {
        game.addPlayer(socket.id, data);
        console.log(`🎮 ${data.name} entró a la arena`);
    });

    socket.on('input', (data) => {
        game.handleInput(socket.id, data);
    });

    socket.on('disconnect', () => {
        game.removePlayer(socket.id);
        console.log(`❌ Jugador desconectado`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO ${PORT}`);
});
