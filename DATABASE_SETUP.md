# ⚠️ CONFIGURACIÓN DE BASE DE DATOS PENDIENTE

## Estado Actual

✅ **Funcionando:**
- Autenticación (Login/Logout)
- Vehículos (CRUD completo)
- Conductores (CRUD completo)
- Mapa con tracking en tiempo real (SSE)

⚠️ **Requiere Configuración:**
- Módulo de Combustible (requiere PostgreSQL)

---

## 🚀 CONFIGURAR COMBUSTIBLE EN 3 PASOS

### 1️⃣ Obtener Base de Datos PostgreSQL

**Opción A: Neon (Recomendado - Gratis)**
1. Ve a [neon.tech](https://neon.tech)
2. Crea cuenta gratuita
3. Crea un nuevo proyecto
4. Copia la conexión string

**Opción B: Supabase (Gratis)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la URI de conexión

**Opción C: Local (PostgreSQL instalado)**
```bash
# En Windows con PostgreSQL instalado:
createdb halia
# O usar pgAdmin para crear la base de datos
```

### 2️⃣ Configurar Variable de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Reemplaza con tu conexión real
DATABASE_URL="postgresql://usuario:contraseña@host:5432/halia"
```

**Ejemplos:**
```env
# Neon
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/halia?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"

# Local
DATABASE_URL="postgresql://postgres:admin@localhost:5432/halia"
```

### 3️⃣ Ejecutar Migraciones

```bash
# Crear las tablas
npx prisma migrate dev --name add_fuel_budget

# Generar el cliente Prisma
npx prisma generate

# Reiniciar el servidor
npm run dev
```

---

## ✅ Verificar que Funciona

1. Abre la app: http://localhost:3000
2. Haz login
3. Ve a "Combustible" en el sidebar
4. Deberías ver la tabla vacía (sin errores)
5. Haz clic en "+ Nueva Carga"
6. El formulario debería abrirse correctamente

---

## 📊 Tablas que se Crearán

- **Driver** - Almacena conductores (si decides migrar de Traccar a DB local)
- **FuelLog** - Registros de cargas de combustible
- **MonthlyBudget** - Presupuestos mensuales de combustible

---

## 🆘 Problemas Comunes

**Error: "Cannot reach database server"**
- Verifica que la URL es correcta
- Check que el host/puerto son accesibles
- En servicios cloud, verifica que permiten conexiones externas

**Error: "Environment variable not found: DATABASE_URL"**
- Asegúrate de que `.env` existe en la raíz
- El nombre debe ser exactamente `.env` (sin .local)
- Reinicia el servidor después de editar

**Error: "SSL connection required"**
- Agrega `?sslmode=require` al final de la URL
- Ejemplo: `...5432/halia?sslmode=require`

---

## 📋 Próximos Pasos Después de Configurar

Una vez que la base de datos esté configurada:

1. ✅ Módulo de Combustible funcionará completamente
2. ✅ Podrás registrar cargas de combustible
3. ✅ Ver estadísticas y eficiencia por vehículo
4. ✅ Monitorear presupuestos mensuales
5. ✅ Calcular km/L automáticamente

---

## 📖 Documentación Completa

Ver archivos para más información:
- `FUEL_MODULE.md` - Documentación completa del módulo
- `ENDPOINTS_VERIFICATION.md` - Resultado de pruebas de endpoints
- `.env.example` - Ejemplo de configuración

---

**Necesitas ayuda?** Todo el código está listo, solo falta la conexión de base de datos. Una vez configurada, el módulo de combustible funcionará inmediatamente.
