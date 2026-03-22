# 🚀 Despliegue en Easypanel

Guía paso a paso para desplegar HALIA en Easypanel.

---

## 📋 Requisitos Previos

- Cuenta en Easypanel
- Repositorio GitHub: https://github.com/BRYAN-RODRIGUEZ-243/halia
- Servidor Traccar funcionando

---

## 🎯 Paso 1: Crear Servicio PostgreSQL

1. **En Easypanel Dashboard:**
   - Click en **"Create Service"**
   - Selecciona **"PostgreSQL"**

2. **Configuración:**
   - **Service Name:** `halia-db`
   - **Database Name:** `halia`
   - **Username:** `halia`
   - **Password:** Genera una segura o deja la automática
   - Click **"Create"**

3. **Copiar Connection String:**
   - Espera que el servicio esté "Running"
   - Ve a **"Env Variables"** del servicio
   - Copia el valor de `DATABASE_URL`
   - Ejemplo: `postgresql://halia:password@halia-db:5432/halia`

---

## 🎯 Paso 2: Crear Aplicación Next.js

1. **En Easypanel Dashboard:**
   - Click en **"Create Service"**
   - Selecciona **"App"**

2. **Configuración General:**
   - **Service Name:** `halia`
   - **Source:** GitHub
   - **Repository:** `BRYAN-RODRIGUEZ-243/halia`
   - **Branch:** `main`

3. **Build Settings:**
   - **Build Type:** Dockerfile
   - **Dockerfile Path:** `Dockerfile` (default)
   - **Build Context:** `/` (root)

4. **Port Settings:**
   - **Port:** `3000`
   - **Protocol:** HTTP

---

## 🎯 Paso 3: Configurar Variables de Entorno

En la sección **"Environment Variables"** de tu app, agrega:

### Variables Obligatorias

```env
# Database (usa el CONNECTION STRING del Paso 1)
DATABASE_URL=postgresql://halia:password@halia-db:5432/halia

# Traccar GPS Server
TRACCAR_URL=https://prueba-traccar.b4blvy.easypanel.host
TRACCAR_USER=bjrodriguez530@gmail.com
TRACCAR_PASS=admin

# JWT Authentication (genera uno aleatorio)
JWT_SECRET=bA9nar9UGrMEj4RynPZgFnptsDiMAiNY46a7aM+cA+E=
JWT_EXPIRES_IN=8h

# Application URL (se configurará automáticamente)
NEXT_PUBLIC_APP_URL=https://halia.tu-dominio-easypanel.app
NODE_ENV=production
```

### Generar JWT_SECRET

En tu terminal local:

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copia el resultado y pégalo en `JWT_SECRET`.

---

## 🎯 Paso 4: Configurar Dominio (Opcional)

1. **En Easypanel:**
   - Ve a tu app `halia`
   - Click en **"Domains"**
   - Agrega tu dominio personalizado
   - O usa el subdominio automático: `halia.tu-proyecto.easypanel.host`

2. **Actualizar Variable:**
   - Vuelve a **"Environment Variables"**
   - Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio real

---

## 🎯 Paso 5: Deploy

1. **Guardar Configuración:**
   - Revisa que todas las variables estén correctas
   - Click **"Save"**

2. **Deployar:**
   - Easypanel detectará el Dockerfile
   - Comenzará el build automáticamente
   - Espera 3-5 minutos

3. **Ver Logs:**
   - Click en **"Logs"** en el menú de tu app
   - Verifica que no haya errores
   - Busca mensajes como:
     - ✓ "Next.js started"
     - ✓ "Listening on port 3000"
     - ✓ "Prisma migrations applied"

---

## 🎯 Paso 6: Ejecutar Migraciones (Primera Vez)

Si las migraciones no se ejecutaron automáticamente:

1. **En Easypanel:**
   - Ve a tu app `halia`
   - Click en **"Console"** o **"Terminal"**

2. **Ejecutar:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Reiniciar App:**
   - Click en **"Restart"**

---

## ✅ Verificar Deployment

1. **Abrir App:**
   - Click en el **dominio** de tu app
   - O ve a: `https://halia.tu-proyecto.easypanel.host`

2. **Probar Login:**
   - Email: `bjrodriguez530@gmail.com`
   - Password: `admin` (tu contraseña de Traccar)

3. **Verificar Funcionalidades:**
   - ✅ Dashboard carga
   - ✅ Mapa muestra vehículos
   - ✅ Datos en tiempo real (SSE)
   - ✅ Módulo de combustible funciona

---

## 🔄 Auto-Deploy desde GitHub

Easypanel puede auto-deployar cuando hagas push a GitHub:

1. **En Easypanel:**
   - Ve a tu app `halia`
   - Settings → **"GitHub Integration"**
   - Habilita **"Auto Deploy"**

2. **Probar:**
   ```bash
   # En tu local
   git add .
   git commit -m "feat: Update feature"
   git push
   ```
   
   Easypanel automáticamente:
   - Detecta el push
   - Hace pull del repo
   - Rebuilds la imagen
   - Redeploys la app

---

## 📊 Monitoreo en Easypanel

### Ver Logs en Tiempo Real

1. App → **"Logs"**
2. Filtra por:
   - **Build Logs** (durante deploy)
   - **Runtime Logs** (app corriendo)

### Métricas

1. App → **"Metrics"**
2. Ve:
   - CPU usage
   - Memory usage
   - Network traffic

### Health Checks

Easypanel automáticamente:
- ✅ Verifica que el puerto 3000 responda
- ✅ Reinicia si la app crashea
- ✅ Muestra estado "Running" / "Failed"

---

## 🔧 Troubleshooting

### Error: "Build Failed"

**Ver logs de build:**
1. App → Logs → **"Build Logs"**
2. Busca errores de:
   - npm install
   - Prisma generate
   - Next.js build

**Solución común:**
- Verifica que `Dockerfile` esté en el root del repo
- Asegúrate de que `next.config.ts` tenga `output: 'standalone'`

### Error: "Database Connection Failed"

**Verificar:**
1. PostgreSQL service está "Running"
2. `DATABASE_URL` en variables de entorno es correcto
3. Formato: `postgresql://user:pass@halia-db:5432/halia`

**Probar conexión:**
```bash
# En consola de la app
npx prisma db pull
```

### Error: "Prisma Client Not Found"

**En consola de la app:**
```bash
npx prisma generate
# Luego reinicia la app
```

### App no carga después de deploy

**Verificar:**
1. Logs → busca errores de runtime
2. Port 3000 está configurado correctamente
3. Health check pasa (Easypanel lo muestra)

**Reiniciar:**
- Click **"Restart"** en el dashboard de la app

---

## 🔐 Seguridad en Producción

### Variables de Entorno

✅ **NUNCA** hardcodees credenciales en el código
✅ Usa variables de entorno de Easypanel
✅ Genera `JWT_SECRET` aleatorio único

### PostgreSQL

✅ Easypanel gestiona la seguridad automáticamente
✅ Solo tu app puede acceder a la base de datos
✅ No está expuesta públicamente

### HTTPS

✅ Easypanel provee SSL/HTTPS automáticamente
✅ Certificados gestionados por ellos
✅ No necesitas configurar nada

---

## 💾 Backups

### PostgreSQL Backups

Easypanel puede tener backups automáticos, verifica:

1. PostgreSQL service → **"Backups"**
2. Configura frecuencia si está disponible

### Backup Manual

**Desde consola de PostgreSQL:**

```bash
pg_dump -U halia halia > backup_$(date +%Y%m%d).sql
```

**Descargar backup:**
1. Easypanel → PostgreSQL service → **"Files"** o **"Volumes"**
2. Descarga el archivo SQL

---

## 📈 Escalar

### Recursos

1. App → **"Resources"**
2. Ajusta:
   - **CPU:** Si la app es lenta
   - **Memory:** Si ves crashes por memoria
   - **Disk:** Para logs y caché

### Múltiples Instancias

Si necesitas escalar horizontalmente:

1. App → **"Scale"**
2. Aumenta número de replicas
3. Easypanel distribuye carga automáticamente

---

## 🎯 Checklist Post-Deploy

- [ ] PostgreSQL service corriendo
- [ ] App deployada y "Running"
- [ ] Todas las variables de entorno configuradas
- [ ] Migraciones ejecutadas (`prisma migrate deploy`)
- [ ] Login funciona con credenciales de Traccar
- [ ] Mapa muestra vehículos en tiempo real
- [ ] Módulo de combustible accesible
- [ ] Auto-deploy desde GitHub configurado (opcional)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Backups habilitados

---

## 📞 Soporte

**Problemas con Easypanel:**
- Documentación: https://easypanel.io/docs
- Support: Panel de Easypanel

**Problemas con HALIA:**
- Ver logs en Easypanel
- Revisar variables de entorno
- Verificar conexión con Traccar

---

## 🎉 ¡Listo!

Tu plataforma HALIA está en producción. Ahora puedes:

1. **Compartir el link** con tu equipo
2. **Comenzar a registrar combustible**
3. **Monitorear vehículos en tiempo real**
4. **Agregar conductores y vehículos**

Cualquier cambio que hagas en GitHub se desplegará automáticamente si configuraste auto-deploy. 🚀
