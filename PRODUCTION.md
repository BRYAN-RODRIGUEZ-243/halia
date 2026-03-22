# 🚀 Despliegue Rápido en Producción

## Comandos para ejecutar en tu servidor

### 1. Clonar repositorio
```bash
git clone https://github.com/BRYAN-RODRIGUEZ-243/halia.git
cd halia
```

### 2. Configurar variables de entorno
```bash
cp .env.production.example .env.production
nano .env.production
```

Edita estas variables **obligatorias**:
```env
POSTGRES_PASSWORD=TU_CONTRASEÑA_SEGURA_AQUI
JWT_SECRET=TU_SECRET_ALEATORIO_AQUI
TRACCAR_URL=https://your-traccar-server.com
TRACCAR_USER=your_email@example.com
TRACCAR_PASS=your_password
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Generar JWT Secret
```bash
openssl rand -base64 32
# Copia el resultado en JWT_SECRET
```

### 4. Iniciar servicios
```bash
docker compose --env-file .env.production up -d
```

### 5. Ver logs
```bash
docker compose logs -f app
```

### 6. Verificar
Abre: `http://your-server-ip:3000`

---

## Configurar SSL (Opcional pero recomendado)

Ver guía completa en [DOCKER.md](DOCKER.md#-configurar-nginx-como-reverse-proxy-recomendado)

---

## Actualizar después de cambios

```bash
git pull
docker compose --env-file .env.production build
docker compose --env-file .env.production up -d
```

---

## ⚠️ IMPORTANTE

- ✅ Nunca subas `.env.production` a GitHub
- ✅ Cambia `POSTGRES_PASSWORD` por una contraseña fuerte
- ✅ Genera un `JWT_SECRET` único y aleatorio
- ✅ Usa HTTPS en producción (Let's Encrypt gratis)
- ✅ Configura backups automáticos

Ver guía completa: [DOCKER.md](DOCKER.md)
