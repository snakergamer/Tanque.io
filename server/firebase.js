// server/firebase.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Intentar buscar la llave en la raíz (como lo organiza Render) o en la carpeta superior (como en local)
let secretPath = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(secretPath)) {
    // Si no está ahí, buscar en la carpeta superior (en caso de que server.js lo requiera desde otro lado)
    secretPath = path.join(__dirname, "../serviceAccountKey.json");
}

console.log("🔑 Cargando credenciales de Firebase desde:", secretPath);

try {
    admin.initializeApp({
        credential: admin.credential.cert(require(secretPath))
    });
    console.log("✅ Firebase Admin inicializado correctamente en el entorno activo");
} catch (error) {
    console.error("❌ Error crítico al inicializar Firebase Admin:", error);
}

const db = admin.firestore();
module.exports = db;
