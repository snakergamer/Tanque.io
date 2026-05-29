# Tanque Evolución .io - Arena Suprema (Edición Multijugador)

¡Bienvenido a la evolución de Tanque.io! Este proyecto ha sido migrado de una versión local a una **Arquitectura Cliente-Servidor Autoritativa** completa, permitiendo partidas multijugador reales en tiempo real con persistencia en la nube.

## 🚀 Cambios Recientes (Resumen de Ingeniería)

He reestructurado y blindado el proyecto bajo los siguientes pilares:

### 1. Servidor Autoritativo (Backend)
- **Tecnología**: Node.js con WebSockets (Socket.io).
- **Lógica Centralizada**: Todas las físicas, colisiones (vía QuadTree) y cálculos de daño ocurren en el servidor a **60 ticks por segundo**. El cliente ya no tiene "la verdad", lo que previene hacks de consola.
- **Entidades Headless**: He portado las clases `Tank`, `Bullet` y `Entity` a Node.js, eliminando dependencias del DOM/Canvas en el backend.

### 2. Autenticación y Persistencia (Cloud)
- **Firebase Admin SDK**: Conexión segura con Firebase para manejar cuentas de usuario.
- **Seguridad**: Cifrado de contraseñas con **bcryptjs**. Jamás se guardan datos en texto plano.
- **Records en Tiempo Real**: El servidor guarda automáticamente el `highScore` y `maxLevel` en Cloud Firestore al terminar cada partida, verificando siempre si se superó la marca anterior.

### 3. Cliente Tonto (Frontend)
- **Renderizado por Snapshot**: El cliente recibe un "paquete de estado" del servidor y se limita a dibujarlo.
- **Interpolación local**: Se implementó suavizado de movimiento para compensar la latencia de red.
- **Persistencia de Sesión (F5)**: Uso de `localStorage` y un handshake de `checkSession` para que no pierdas tu partida al refrescar el navegador.

## 📁 Estructura del Proyecto

```text
xd/
├── public/                 # Archivos estáticos (Hosting Firebase)
│   ├── js/
│   │   ├── core/game.js    # Cliente "Tonto" y Renderizado
│   │   ├── network/        # Capa de comunicación WebSocket
│   │   └── ui/interface.js # Lógica de menús y botones
│   └── index.html          # Punto de entrada del navegador
├── server/                 # Lógica privada (Hosting Render/Railway)
│   ├── auth/               # Controladores de Firebase y Bcrypt
│   ├── gameLogic/          # Motor físico, QuadTree y Balas
│   ├── firebase.js         # Inicialización del SDK de Firebase
│   └── server.js           # Servidor Express y Socket.io
├── Dockerfile              # Configuración para despliegue en contenedores
├── render.yaml             # Blueprint para despliegue automático en Render.com
└── firebase.json           # Configuración de Firebase Hosting
```

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5 Canvas, Vanilla JavaScript.
- **Backend**: Node.js, Express, Socket.io.
- **Base de Datos**: Firebase Cloud Firestore.
- **Infraestructura**: Firebase Hosting (Frontend) + Render.com (Backend).

## 🚀 Instrucciones para Desarrolladores

### Ejecución Local
1. Instalar dependencias: `npm install`
2. Configurar Firebase: Asegúrate de tener tu `serviceAccountKey.json` en la carpeta `server/`.
3. Arrancar servidor: `npm start`
4. Abrir en el navegador: `http://localhost:3000`

### Despliegue
- **Frontend**: `firebase deploy --only hosting`
- **Backend**: Subir el repositorio a Render.com (detectará automáticamente el `render.yaml`).

---
**Nota**: El juego está diseñado para ser escalable. La arena actual es de $8000 \times 8000$ unidades, capaz de soportar múltiples jugadores y bots simultáneos.
