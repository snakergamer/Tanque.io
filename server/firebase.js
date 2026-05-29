const admin = require("firebase-admin");
const path = require("path");

try {
    // Si estamos en Render, leerá la variable de entorno; si estamos en local, usará el archivo
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("🔑 Detectada variable de entorno FIREBASE_SERVICE_ACCOUNT");
        const serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson)
        });
    } else {
        console.log("💻 Ejecutando en entorno local, buscando archivo serviceAccountKey.json...");
        // Intentar varias rutas comunes para local
        let serviceAccount;
        try {
            serviceAccount = require("./serviceAccountKey.json");
        } catch (e) {
            serviceAccount = require("../serviceAccountKey.json");
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    console.log("✅ Firebase Admin conectado e inicializado correctamente.");
} catch (error) {
    console.error("❌ Error crítico en la inicialización de Firebase:", error);
}

const db = admin.firestore();
module.exports = db;
