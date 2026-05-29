// server/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Intentar cargar las credenciales de Firebase
try {
    // Render guarda los archivos en la raíz del repo o donde se suban.
    // Usamos path.join(__dirname, 'serviceAccountKey.json') para asegurar la ruta absoluta en Linux.
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
