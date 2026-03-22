# 🐳 Guía de Docker para HALIA - Producción

## Requisitos Previos

- Docker y Docker Compose instalados en el servidor
- Acceso SSH al servidor de producción
- Dominio configurado (opcional pero recomendado)

---

## 🚀 Despliegue en Producción

### Paso 1: Preparar el Servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor.com

# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### Paso 2: Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/BRYAN-RODRIGUEZ-243/halia.git
cd halia
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.production.example .env.production

# Editar con nano o vim
nano .env.production
```

**Configuración de ejemplo:**

```env
# PostgreSQL Database
POSTGRES_USER=halia
POSTGRES_PASSWORD=P@ssw0rd_Super_Segur0_2024_XyZ
POSTGRES_DB=halia

# Traccar GPS Server
TRACCAR_URL=https://prueba-traccar.b4blvy.easypanel.host
TRACCAR_USER=bjrodriguez530@gmail.com
TRACCAR_PASS=admin

# JWT Authentication (genera uno aleatorio)
JWT_SECRET=bA9nar9UGrMEj4RynPZgFnptsDiMAiNY46a7aM+cA+E=
JWT_EXPIRES_IN=8h

# Application URL (tu dominio)
NEXT_PUBLIC_APP_URL=https://halia.tudominio.com
APP_PORT=3000
```

### Paso 4: Generar JWT Secret Seguro

```bash
# Opción 1: Con OpenSSL
openssl rand -base64 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copia el resultado y pégalo en JWT_SECRET
```

### Paso 5: Construir y Ejecutar

```bash
# Construir imágenes (primera vez o después de cambios)
docker compose --env-file .env.production build

# Iniciar servicios
docker compose --env-file .env.production up -d

# Ver logs en tiempo real
docker compose logs -f app
```

### Paso 6: Verificar Deployment

```bash
# Ver servicios corriendo
docker compose ps

# Verificar que la app esté lista
curl http://localhost:3000

# Ver logs de PostgreSQL
docker compose logs postgres
```

---

## 🌐 Configurar Nginx como Reverse Proxy (Recomendado)

### Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configurar dominio

Crea `/etc/nginx/sites-available/halia`:

```nginx
server {
    listen 80;
    server_name halia.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Activar configuración

```bash
sudo ln -s /etc/nginx/sites-available/halia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Instalar SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d halia.tudominio.com
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en GitHub:

```bash
# En el servidor
cd halia

# Descargar últimos cambios
git pull

# Reconstruir imagen
docker compose --env-file .env.production build

# Reiniciar servicios
docker compose --env-file .env.production up -d

# Ver logs
docker compose logs -f app
```

---

## 📊 Comandos Útiles en Producción

### Estado y Monitoreo

```bash
# Ver servicios corriendo
docker compose ps

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker compose logs -f

# Ver últimas 100 líneas de logs
docker compose logs --tail=100 app

# Ver logs de errores
docker compose logs app | grep ERROR
```

### Gestión de Contenedores

```bash
# Detener servicios (sin borrar datos)
docker compose down

# Reiniciar solo la app
docker compose restart app

# Reiniciar PostgreSQL
docker compose restart postgres

# Ver IP de contenedores
docker compose exec app hostname -i
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker compose exec postgres psql -U halia -d halia

# Ejecutar migraciones manualmente
docker compose exec app npx prisma migrate deploy

# Generar Prisma Client
docker compose exec app npx prisma generate

# Ver esquema de base de datos
docker compose exec postgres psql -U halia -d halia -c "\dt"
```

---

## 💾 Backups Automáticos

### Script de Backup

Crea `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/halia"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
docker compose exec -T postgres pg_dump -U halia halia > "$BACKUP_DIR/db_$DATE.sql"

# Comprimir
gzip "$BACKUP_DIR/db_$DATE.sql"

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completado: db_$DATE.sql.gz"
```

### Automatizar con Cron

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * /path/to/halia/backup.sh
```

### Restaurar Backup

```bash
# Descomprimir
gunzip /backups/halia/db_20260321_020000.sql.gz

# Restaurar
docker compose exec -T postgres psql -U halia halia < /backups/halia/db_20260321_020000.sql
```

---

## 🔒 Seguridad en Producción

### 1. Firewall

```bash
# Permitir solo SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. No Exponer PostgreSQL

El `docker-compose.yml` ya NO expone el puerto 5432 externamente. Solo la app interna puede acceder.

### 3. Cambiar Credenciales por Defecto

- ✅ Cambia `POSTGRES_PASSWORD` por una contraseña fuerte
- ✅ Genera un `JWT_SECRET` aleatorio único
- ✅ No uses credenciales de prueba en producción

### 4. Actualizar Regularmente

```bash
# Actualizar imágenes de Docker
docker compose pull
docker compose up -d

# Actualizar sistema operativo
sudo apt update && sudo apt upgrade -y
```

---

## 🔧 Troubleshooting en Producción

### App no inicia

```bash
# Ver logs completos
docker compose logs app

# Verificar variables de entorno
docker compose config

# Reconstruir sin caché
docker compose build --no-cache
docker compose up -d
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs postgres

# Probar conexión manual
docker compose exec postgres psql -U halia -d halia
```

### Prisma no encuentra la base de datos

```bash
# Ejecutar migraciones manualmente
docker compose exec app npx prisma migrate deploy

# Regenerar Prisma Client
docker compose exec app npx prisma generate

# Reiniciar app
docker compose restart app
```

### SSL no funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📈 Escalamiento

### Separar Base de Datos

Si necesitas escalar, usa PostgreSQL externo:

```yaml
# En docker-compose.yml
app:
  environment:
    DATABASE_URL: postgresql://user:pass@external-db.com:5432/halia
```

Luego elimina el servicio `postgres` del compose.

### Múltiples Instancias

Para balanceo de carga:

```bash
# Escalar a 3 instancias
docker compose up -d --scale app=3

# Configurar Nginx para load balancing
upstream halia_backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

---

## 📝 Checklist Pre-Producción

- [ ] `.env.production` configurado con credenciales seguras
- [ ] `JWT_SECRET` aleatorio generado
- [ ] Dominio apuntando al servidor
- [ ] Firewall configurado (UFW)
- [ ] Nginx instalado y configurado
- [ ] SSL/HTTPS activo (Let's Encrypt)
- [ ] Backups automáticos configurados
- [ ] Logs siendo monitoreados
- [ ] Docker y Docker Compose actualizados
- [ ] Pruebas de conexión exitosas

---

## 🎯 Comandos Rápidos

```bash
# Deploy completo
git pull && docker compose --env-file .env.production build && docker compose --env-file .env.production up -d

# Ver logs en vivo
docker compose logs -f app

# Reinicio rápido
docker compose restart app

# Backup manual
docker compose exec -T postgres pg_dump -U halia halia > backup_$(date +%Y%m%d).sql

# Detener todo
docker compose down

# Limpiar todo (¡CUIDADO! Borra datos)
docker compose down -v
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa logs: `docker compose logs -f`
2. Verifica variables: `docker compose config`
3. Revisa documentación de Traccar
4. Contacta al equipo de desarrollo
