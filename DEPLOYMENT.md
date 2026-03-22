# DEPLOYMENT.md - Guía de Despliegue HALIA

## Opciones de Despliegue

### 1. Easypanel (Recomendado para Producción) ⭐

Easypanel ofrece hosting Docker con PostgreSQL incluido y es la opción más completa.

**Ventajas:**
- ✅ PostgreSQL incluido
- ✅ Docker nativo (usa nuestro Dockerfile)
- ✅ Auto-deploy desde GitHub
- ✅ SSL/HTTPS automático
- ✅ Consola y logs integrados
- ✅ Monitoreo y métricas
- ✅ Backups automatizados

**Guía Completa:** 👉 [EASYPANEL.md](EASYPANEL.md)

**Resumen:**
1. Crear PostgreSQL service
2. Crear App desde GitHub: `BRYAN-RODRIGUEZ-243/halia`
3. Configurar variables de entorno
4. Deploy automático con Dockerfile
5. ¡Listo!

---

### 2. Docker en VPS/Cloud 🐳

Para despliegues en servidores propios (DigitalOcean, AWS, Linode, etc.)

**Ventajas:**
- ✅ Control total del servidor
- ✅ Docker Compose incluido
- ✅ PostgreSQL local
- ✅ Fácil escalamiento

**Guía Completa:** 👉 [DOCKER.md](DOCKER.md)

**Comandos rápidos:**
```bash
git clone https://github.com/BRYAN-RODRIGUEZ-243/halia.git
cd halia
cp .env.production.example .env.production
# Editar .env.production
docker compose --env-file .env.production up -d
```

---

### 3. Vercel (Solo Frontend) 🌐

Vercel es la plataforma oficial de Next.js, ideal para frontend pero requiere DB externa.

**Pasos:**

1. **Preparar Base de Datos (Neon - Gratis)**
   - Ve a [neon.tech](https://neon.tech)
   - Crea cuenta y nuevo proyecto
   - Copia el `DATABASE_URL` (ejemplo: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/halia?sslmode=require`)

2. **Subir a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HALIA Fleet Management"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/HALIA.git
   git push -u origin main
   ```

3. **Desplegar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Import Project"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio HALIA
   - Configura variables de entorno:
     ```env
     TRACCAR_URL=https://prueba-traccar.b4blvy.easypanel.host
     TRACCAR_USER=bjrodriguez530@gmail.com
     TRACCAR_PASS=admin
     JWT_SECRET=genera_uno_aleatorio_aqui
     DATABASE_URL=tu_url_de_neon_aqui
     ```
   - Click "Deploy"

4. **Ejecutar Migraciones**
   Después del despliegue, en Vercel dashboard:
   - Ve a tu proyecto → Settings → Functions
   - O ejecuta desde tu terminal:
     ```bash
     npx prisma migrate deploy
     ```

**✅ Ventajas:**
- Despliegue automático en cada push
- SSL gratuito
- Edge network global
- Fácil configuración
- Build times rápidos

---

### 4. Railway 🚂

Railway ofrece base de datos PostgreSQL incluida.

**Pasos:**

1. **Crear Cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta con GitHub

2. **Crear Nuevo Proyecto**
   - Click "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio HALIA

3. **Agregar PostgreSQL**
   - En el proyecto, click "+ New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway generará automáticamente `DATABASE_URL`

4. **Configurar Variables de Entorno**
   En Settings → Variables:
   ```env
   TRACCAR_URL=https://prueba-traccar.b4blvy.easypanel.host
   TRACCAR_USER=bjrodriguez530@gmail.com
   TRACCAR_PASS=admin
   JWT_SECRET=genera_uno_aleatorio_aqui
   ```
   (No necesitas DATABASE_URL, Railway lo crea automáticamente)

5. **Ejecutar Migraciones**
   En Railway terminal o localmente conectado a Railway DB:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

**✅ Ventajas:**
- Base de datos incluida
- Menos configuración
- $5 de crédito gratis mensual
- Fácil escalamiento

---

### 5. Render 🎨

Alternativa gratuita con PostgreSQL incluido.

**Pasos:**

1. **Crear Cuenta en Render**
   - Ve a [render.com](https://render.com)

2. **Crear PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Nombre: `halia-db`
   - Region: Oregon (gratis)
   - Copia la connection string externa

3. **Crear Web Service**
   - Dashboard → "New" → "Web Service"
   - Conecta GitHub repository
   - Configuración:
     - Name: `halia`
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Start Command: `npm start`

4. **Variables de Entorno**
   ```env
   TRACCAR_URL=https://prueba-traccar.b4blvy.easypanel.host
   TRACCAR_USER=bjrodriguez530@gmail.com
   TRACCAR_PASS=admin
   JWT_SECRET=genera_uno_aleatorio_aqui
   DATABASE_URL=[tu_url_de_render_postgres]
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Espera el build (puede tardar 5-10 min primera vez)

**✅ Ventajas:**
- Tier gratuito generoso
- PostgreSQL gratis incluido
- Auto deploys en push

**⚠️ Limitaciones:**
- Servicios gratuitos se "duermen" después de 15 min inactividad
- Primer request puede tardar 30 seg en despertar

---

### 6. Supabase (Solo Base de Datos)

Si ya tienes hosting para Next.js pero necesitas solo la base de datos:

1. **Crear Proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - "New Project"
   - Copia el `DATABASE_URL` desde Settings → Database

2. **Formato de URL**
   ```
   postgresql://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres
   ```

3. **Usar en tu plataforma de despliegue**
   Agrega esta `DATABASE_URL` a las variables de entorno de Vercel/Railway/etc.

---

## Generar JWT_SECRET Seguro

### Opción 1: OpenSSL (Linux/Mac/Git Bash)
```bash
openssl rand -base64 32
```

### Opción 2: Node.js
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Opción 3: PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Opción 4: Online
- [randomkeygen.com](https://randomkeygen.com/)
- Usa "256-bit WPA Key"

---

## Checklist Antes de Desplegar

- [ ] `.env` y `.env.local` están en `.gitignore`
- [ ] `.env.example` tiene solo placeholders (sin credenciales reales)
- [ ] `JWT_SECRET` es aleatorio y seguro
- [ ] Base de datos PostgreSQL está creada
- [ ] Variables de entorno configuradas en plataforma
- [ ] `npm run build` funciona localmente
- [ ] Migraciones ejecutadas: `npx prisma migrate deploy`

---

## Comandos Git para Subir a GitHub

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "feat: Initial commit - HALIA Fleet Management Platform"

# Renombrar rama a main
git branch -M main

# Agregar remote (reemplaza TU_USUARIO con tu username de GitHub)
git remote add origin https://github.com/TU_USUARIO/HALIA.git

# Subir a GitHub
git push -u origin main
```

**Antes de hacer push:**
1. Crea el repositorio en GitHub (github.com/new)
2. No inicialices con README (ya tienes uno)
3. Usa el URL HTTPS que te dan

---

## Troubleshooting

### Error: "Prisma Client not generated"
```bash
npx prisma generate
npm run build
```

### Error: "Can't reach database"
- Verifica que `DATABASE_URL` esté correctamente configurado
- Asegúrate de incluir `?sslmode=require` para conexiones externas
- Revisa que el usuario/password sean correctos

### Error: "Module not found" en producción
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### SSE/Real-time no funciona
- Server-Sent Events requiere HTTP/2, disponible en HTTPS
- Asegúrate de que tu despliegue use HTTPS (Vercel/Railway lo hacen automáticamente)

---

## Post-Deployment

Una vez desplegado:

1. **Prueba el login** con tus credenciales de Traccar
2. **Verifica el mapa** muestra vehículos en tiempo real
3. **Crea un conductor** para probar el módulo de drivers
4. **Registra combustible** para probar el módulo fuel
5. **Configura un presupuesto mensual** en Fuel Stats

---

## Actualizaciones Futuras

Cuando hagas cambios:

```bash
git add .
git commit -m "feat: Descripción del cambio"
git push
```

- **Vercel/Railway/Render**: auto-desplegarán los cambios
- Si cambiaste el schema de Prisma: ejecuta `npx prisma migrate deploy` en producción

---

## Costos Estimados

| Plataforma | Hosting | Database | Total/Mes |
|-----------|---------|----------|-----------|
| Vercel + Neon | Gratis | Gratis* | $0 |
| Railway | Gratis* | Incluido | $0-5 |
| Render | Gratis | Gratis | $0 |

*Plan gratuito con límites, suficiente para desarrollo/demos

---

¿Necesitas ayuda? Revisa los logs de build en tu plataforma o contacta soporte.
