# 🐳 Guía de Docker para HALIA

## Requisitos Previos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)

## 🚀 Opción 1: Docker Compose (Recomendado)

La forma más fácil de ejecutar HALIA con PostgreSQL incluido.

### Configuración Rápida

1. **Editar variables de entorno** (opcional)
   
   Abre `docker-compose.yml` y actualiza:
   ```yaml
   environment:
     TRACCAR_URL: https://tu-servidor-traccar.com
     TRACCAR_USER: tu_email@example.com
     TRACCAR_PASS: tu_contraseña
     JWT_SECRET: genera_uno_aleatorio_aqui
   ```

2. **Construir y ejecutar**
   ```bash
   docker-compose up -d
   ```

3. **Ver logs**
   ```bash
   docker-compose logs -f app
   ```

4. **Acceder a la aplicación**
   
   Abre tu navegador en: http://localhost:3000

### Comandos Útiles

```bash
# Ver servicios corriendo
docker-compose ps

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (borra la base de datos)
docker-compose down -v

# Reconstruir después de cambios en código
docker-compose up -d --build

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Acceder a la base de datos
docker-compose exec postgres psql -U halia -d halia
```

---

## 🏗️ Opción 2: Dockerfile Solo (Sin DB)

Si ya tienes PostgreSQL externo (Neon, Supabase, etc.)

### 1. Configurar Next.js para standalone

Abre `next.config.ts` y asegúrate de tener:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... resto de configuración
};
```

### 2. Construir imagen

```bash
docker build -t halia:latest .
```

### 3. Ejecutar contenedor

```bash
docker run -d \
  --name halia \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/halia" \
  -e TRACCAR_URL="https://tu-servidor-traccar.com" \
  -e TRACCAR_USER="tu_email@example.com" \
  -e TRACCAR_PASS="tu_contraseña" \
  -e JWT_SECRET="tu_secret_aleatorio" \
  halia:latest
```

---

## 🌐 Desplegar en Producción

### Docker Hub

1. **Login en Docker Hub**
   ```bash
   docker login
   ```

2. **Tag de la imagen**
   ```bash
   docker tag halia:latest TU_USUARIO/halia:latest
   docker tag halia:latest TU_USUARIO/halia:v1.0.0
   ```

3. **Push a Docker Hub**
   ```bash
   docker push TU_USUARIO/halia:latest
   docker push TU_USUARIO/halia:v1.0.0
   ```

### Digital Ocean, AWS, Railway, etc.

Usa `docker-compose.yml` o la imagen de Docker Hub:

```bash
docker pull TU_USUARIO/halia:latest
docker run -d -p 3000:3000 --env-file .env TU_USUARIO/halia:latest
```

---

## 📦 Variables de Entorno

Crea un archivo `.env.docker` para sobrescribir valores en producción:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/halia

# Traccar
TRACCAR_URL=https://your-traccar-server.com
TRACCAR_USER=email@example.com
TRACCAR_PASS=password

# JWT
JWT_SECRET=your_random_secret_here
JWT_EXPIRES_IN=8h

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

Luego ejecuta:
```bash
docker-compose --env-file .env.docker up -d
```

---

## 🔧 Troubleshooting

### Error: "Could not connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica logs de PostgreSQL:
   ```bash
   docker-compose logs postgres
   ```

3. Prueba conexión manual:
   ```bash
   docker-compose exec postgres psql -U halia -d halia
   ```

### Error: "Prisma Client not generated"

```bash
docker-compose exec app npx prisma generate
docker-compose restart app
```

### Error: "Port 3000 already in use"

Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Usa puerto 8080 en tu host
```

### Reconstruir después de cambios

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo la app
docker-compose logs -f app

# Últimas 100 líneas
docker-compose logs --tail=100 app
```

---

## 🔄 Backups de Base de Datos

### Crear backup

```bash
docker-compose exec postgres pg_dump -U halia halia > backup_$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
docker-compose exec -T postgres psql -U halia halia < backup_20260321.sql
```

---

## 🚀 Multi-Stage Build Optimizado

El Dockerfile usa multi-stage build para:
- ✅ Reducir tamaño de imagen final (de ~1GB a ~200MB)
- ✅ Separar dependencias de desarrollo y producción
- ✅ Mejorar seguridad (ejecuta como non-root user)
- ✅ Cachear dependencias para builds más rápidos

---

## 📝 Estructura de Archivos Docker

```
HALIA/
├── Dockerfile              # Imagen de la aplicación
├── docker-compose.yml      # Orquestación de servicios
├── .dockerignore          # Archivos a excluir del build
└── DOCKER.md              # Esta guía
```

---

## 🎯 Próximos Pasos

1. Ejecuta `docker-compose up -d`
2. Espera 30 segundos para que migre la DB
3. Abre http://localhost:3000
4. Login con tus credenciales de Traccar
5. ¡Disfruta HALIA! 🎉

---

**¿Necesitas ayuda?** Revisa los logs con `docker-compose logs -f`
