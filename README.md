# Tanque Evolución .io - Arena Suprema

Este proyecto es un juego web 2D de disparos multijugador (estilo Diep.io), renderizado en **HTML5 Canvas** y escrito completamente en **Vanilla JavaScript** (sin dependencias ni motores externos).

El juego está diseñado para soportar físicas complejas, cientos de entidades en pantalla y controles híbridos (PC y Móvil) manteniendo **60 FPS constantes**.

---

## 🎮 Características Principales

*   **Arena Masiva:** Mapa de `8000x8000` unidades con generación procedural de figuras (cuadrados, triángulos, pentágonos y Alpha pentágonos).
*   **Controles Híbridos Multiplataforma:**
    *   **PC:** Movimiento con `WASD` / Flechas, apuntado con ratón y disparo con clic izquierdo.
    *   **Móvil:** Joysticks virtuales duales transparentes (Multi-touch). Izquierdo para mover, derecho para apuntar y disparar ráfagas automáticas.
*   **Progresión a Nivel 100:** Curva de experiencia suavizada y balanceada `XP = 20 + (lvl * 8) + (lvl^1.5) * 2`. El farmeo premia el combate directo contra otros Bots sobre la recolección pasiva en niveles altos.
*   **Minimapa Calibrado:** Radar en tiempo real con recuadro de visión (*Viewport Box*) que muestra exactamente qué parte de la arena gigantesca estás viendo.

---

## 🌳 Árbol de Evolución (Level Cap: 100)

El juego cuenta con un panel de evolución secuencial que desbloquea nuevas clases en los niveles **15, 30, 45, 60 y 80**.

1.  **Rama de Ráfaga / Multidireccional:**
    *   `Tanque` -> `Doble` -> `Quad Tanque` -> `Octo Tanque` -> `Ciclón` (12 cañones) -> `Nova Estelar` (16 cañones omnidireccionales).
2.  **Rama de Francotirador / Precisión:**
    *   `Tanque` -> `Francotirador` -> `Asesino` -> `Cazador` -> `Stalker` -> `Cañón de Riel` (Proyectiles instantáneos con estelas de neón cian).
3.  **Rama de Destrucción Masiva:**
    *   `Tanque` -> `Ametralladora` -> `Destructor` -> `Aniquilador` -> `Titán de Asalto` -> `Dreadnought` (Cañón masivo con daño colosal y retroceso extremo).
4.  **Rama de Invocación / Control:**
    *   `Tanque` -> `Francotirador` -> `Capataz` -> `Nigromante` -> `Señor de la Guerra` -> `Invocador Alfa` (Controla hasta 40 figuras zombie, convirtiendo cuadrados y triángulos infectados).

---

## ⚙️ Arquitectura Técnica y Optimizaciones (AI Context)

Para que el asistente de IA comprenda la arquitectura actual y no introduzca cuellos de botella, estas son las reglas internas de rendimiento del proyecto:

### 1. Visual Culling (Renderizado Selectivo)
Las clases `Entity`, `Bullet`, `Particle` y `Shape` solo se dibujan en el Canvas si pasan la validación de `game.isInView(pos, radius)`. Todo lo que esté fuera del viewport activo del jugador se calcula matemáticamente pero **no se renderiza en la GPU**.

### 2. QuadTree Dinámico
Las colisiones físicas (O(n²)) están optimizadas usando un algoritmo **QuadTree**. Las entidades solo comprueban colisiones con objetos en su cuadrante cercano (`range = radius * 6`), lo que previene congelamientos del navegador cuando hay cientos de figuras amontonadas.

### 3. Object Pooling Estricto
Para evitar saturación del *Garbage Collector* de JavaScript, el juego recicla objetos en lugar de usar `new` y `delete` durante el bucle de juego:
*   `bulletPool`, `particlePool`, `textPool` están declarados en el contexto global antes que las clases que los consumen.
*   Existe un **Bullet Cap de 300 balas** y un **Shape Cap de 250 figuras**. Si se exceden, se fuerza el `release()` de los elementos más antiguos.

### 4. AudioContext Seguro
Para evitar el crasheo por límite de hardware en disparos simultáneos rápidos (ej. *Nova Estelar* o múltiples *Ametralladoras*), el sonido usa un patrón Singleton con un único `AudioContext` global que se inicializa envuelto en un bloque `try/catch`.

### 5. UI y Seguridad Local
*   Fuentes nativas de sistema (`Arial Black`, `Impact`) sin llamadas a APIs externas para que el archivo `juego.html` abra perfectamente de forma local (`file:///`).
*   Los escuchadores de eventos (`addEventListener`) controlan los bloqueos de clicks: si la interacción ocurre sobre un elemento UI (como mejorar stats), se anula el disparo (`isUI(e)`).

---

**Nota para IA:** Al modificar este proyecto, mantén todas las funciones dentro del único archivo `juego.html`, respeta el sistema de Pools y asegúrate de que cualquier nueva entidad respete el método `keepInBounds` del `mapSize = 8000`.