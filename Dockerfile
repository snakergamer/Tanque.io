# Usar la imagen de Node.js ligera para producción
FROM node:20-slim

# Definir directorio de trabajo
WORKDIR /usr/src/app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar solo dependencias necesarias
RUN npm install --omit=dev

# Copiar el código fuente
COPY . .

# El puerto es dinámico en Render, pero exponemos el 3000 por defecto
EXPOSE 3000

# Comando de arranque
CMD ["node", "server/server.js"]
