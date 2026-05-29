// server/database.js
const admin = require('firebase-admin');
const path = require('path');

// Intentar cargar las credenciales de Firebase
try {
    // Buscamos el archivo en la misma carpeta que database.js
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
    console.error('⚠️ Error: No se pudo cargar serviceAccountKey.json');
    console.error('Buscado en:', path.join(__dirname, 'serviceAccountKey.json'));
    console.error('Detalle:', error.message);
}

const db = admin.firestore();

module.exports = db;
