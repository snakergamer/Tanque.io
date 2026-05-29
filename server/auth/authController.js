// server/auth/authController.js
const db = require('../firebase');
const bcrypt = require('bcryptjs');

const AuthController = {
    async register(username, password) {
        try {
            const userRef = db.collection('users').doc(username);
            const doc = await userRef.get();

            if (doc.exists) {
                return { success: false, message: 'El usuario ya existe' };
            }

            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            await userRef.set({
                username,
                password_hash,
                highScore: 0,
                maxLevel: 1,
                createdAt: new Date().toISOString()
            });

            return { success: true, message: 'Usuario registrado con éxito' };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    },

    async login(username, password, isSessionCheck = false) {
        try {
            const userRef = db.collection('users').doc(username);
            const doc = await userRef.get();

            if (!doc.exists) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            const userData = doc.data();
            
            // Si es un check de sesión, saltamos la validación de bcrypt
            if (!isSessionCheck) {
                const isMatch = await bcrypt.compare(password, userData.password_hash);
                if (!isMatch) {
                    return { success: false, message: 'Contraseña incorrecta' };
                }
            }

            return { 
                success: true, 
                message: 'Login exitoso', 
                userData: {
                    username: userData.username,
                    highScore: userData.highScore,
                    maxLevel: userData.maxLevel
                }
            };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error interno del servidor' };
        }
    },

    async updateRecords(username, newScore, newLevel) {
        try {
            const userRef = db.collection('users').doc(username);
            const doc = await userRef.get();

            if (!doc.exists) return { success: false, message: 'Usuario no encontrado' };

            const userData = doc.data();
            const updates = {};

            if (newScore > (userData.highScore || 0)) {
                updates.highScore = Math.floor(newScore);
            }

            if (newLevel > (userData.maxLevel || 1)) {
                updates.maxLevel = newLevel;
            }

            if (Object.keys(updates).length > 0) {
                await userRef.update(updates);
                return { success: true, updates };
            }

            return { success: false, message: 'No hay records que superar' };
        } catch (error) {
            console.error('Error actualizando records:', error);
            return { success: false, message: 'Error de servidor' };
        }
    }
};

module.exports = AuthController;
