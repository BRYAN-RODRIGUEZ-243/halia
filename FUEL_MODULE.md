# Módulo de Combustible - HALIA

## Arquitectura

El módulo de combustible permite rastrear cargas de combustible por vehículo, calcular eficiencia (km/L), costos y monitorear presupuestos mensuales.

### Componentes Principales

#### 1. **Capa de Datos**
- **`src/types/fuel.ts`**: Tipos TypeScript (FuelLog, FuelStats, VehicleEfficiency, MonthlyBudget)
- **`prisma/schema.prisma`**: Modelos de base de datos (Driver, FuelLog, MonthlyBudget)
- **`src/lib/prisma.ts`**: Cliente Prisma singleton

#### 2. **Lógica de Negocio**
- **`src/lib/fuelCalculations.ts`**: Funciones puras de cálculo
  - `calcEfficiency()`: Calcula km/L por vehículo usando diferencias de odómetro
  - `calcMonthlyStats()`: Agrega totales de litros, costo, promedio
  - `calcBudgetProgress()`: Calcula estado del presupuesto (ok/warning/exceeded)
  - `groupByVehicle()`: Agrupa logs por deviceId
  - `groupByMonth()`: Agrupa logs por mes (últimos 12 meses)

#### 3. **API Endpoints**
- **`GET /api/fuel`**: Listar registros con filtros (deviceId, driverId, from, to, fuelType)
- **`POST /api/fuel`**: Crear nuevo registro con validaciones
- **`GET /api/fuel/[id]`**: Obtener registro específico
- **`PUT /api/fuel/[id]`**: Actualizar registro existente
- **`DELETE /api/fuel/[id]`**: Eliminar registro
- **`GET /api/fuel/stats`**: Obtener estadísticas agregadas y eficiencia por vehículo
- **`PUT /api/fuel/stats`**: Actualizar/crear presupuesto mensual

#### 4. **Hooks de React Query**
- **`src/hooks/useFuel.ts`**:
  - `useFuelLogs(filters)`: Lista de registros
  - `useFuelLog(id)`: Registro individual
  - `useFuelStats(filters)`: Estadísticas y eficiencia
  - `useCreateFuelLog()`: Crear registro
  - `useUpdateFuelLog()`: Actualizar registro
  - `useDeleteFuelLog()`: Eliminar registro
  - `useUpdateBudget()`: Actualizar presupuesto mensual

## Configuración Inicial

### 1. Configurar Base de Datos

Agregar a `.env.local`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/halia"
```

### 2. Ejecutar Migración

```bash
npx prisma migrate dev --name add_fuel_budget
```

Esto creará las tablas:
- `Driver`
- `FuelLog`
- `MonthlyBudget`

### 3. Verificar Schema

```bash
npx prisma studio
```

Abre una interfaz web para explorar la base de datos.

## Modelo de Datos

### FuelLog

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | ID único del registro |
| `deviceId` | String | ID del vehículo en Traccar |
| `driverId` | String? | ID del conductor (opcional) |
| `liters` | Float | Litros cargados |
| `pricePerLiter` | Float | Precio por litro |
| `totalCost` | Float | Costo total (calculado automáticamente) |
| `odometer` | Float | Lectura del odómetro en km |
| `station` | String? | Nombre de la estación de servicio |
| `fuelType` | String | 'regular', 'super' o 'diesel' |
| `invoiceNumber` | String? | Número de factura |
| `date` | DateTime | Fecha y hora de la carga |
| `notes` | String? | Notas adicionales |

### MonthlyBudget

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | ID único |
| `month` | String | Mes en formato 'YYYY-MM' (único) |
| `budgetAmount` | Float | Presupuesto asignado |

## Validaciones de la API

### POST /api/fuel

1. **deviceId existe en Traccar**: Verifica que el vehículo exista
2. **odometer > último registro**: Valida que no se retroceda el odómetro
3. **totalCost calculado en servidor**: No confía en el cliente

### PUT /api/fuel/[id]

1. **odometer > último registro**: Excluyendo el registro actual
2. **Recalcula totalCost**: Si cambian litros o precio

## Cálculos de Eficiencia

La función `calcEfficiency()` calcula km/L por vehículo:

1. Agrupa registros por `deviceId`
2. Ordena por fecha ascendente
3. Para cada par consecutivo:
   - `distancia = odometer_actual - odometer_anterior`
   - `litros = liters_actual`
   - `eficiencia = distancia / litros`
4. Promedia todas las eficiencias del vehículo

## Uso de los Hooks

### Listar Registros

```tsx
import { useFuelLogs } from '@/hooks/useFuel';

function FuelTable() {
  const { data, isLoading, error } = useFuelLogs({
    deviceId: '123', // Opcional
    from: '2024-01-01',
    to: '2024-12-31',
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Total: ${data.stats.totalCost}</p>
      <ul>
        {data.logs.map(log => (
          <li key={log.id}>
            {log.vehicleName} - {log.liters}L - ${log.totalCost}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Crear Registro

```tsx
import { useCreateFuelLog } from '@/hooks/useFuel';

function FuelForm() {
  const createMutation = useCreateFuelLog();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    createMutation.mutate({
      deviceId: '123',
      driverId: '456',
      liters: 50,
      pricePerLiter: 1.5,
      odometer: 10000,
      station: 'Shell Centro',
      fuelType: 'regular',
      date: new Date().toISOString(),
    }, {
      onSuccess: () => {
        alert('Registro creado exitosamente');
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

### Ver Estadísticas

```tsx
import { useFuelStats } from '@/hooks/useFuel';

function FuelDashboard() {
  const { data, isLoading } = useFuelStats({
    from: '2024-01-01',
    to: '2024-12-31',
  });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Estadísticas Generales</h2>
      <p>Total Litros: {data.stats.totalLiters}</p>
      <p>Total Costo: ${data.stats.totalCost}</p>
      <p>Precio Promedio: ${data.stats.avgPricePerLiter}/L</p>

      <h2>Eficiencia por Vehículo</h2>
      <ul>
        {data.efficiency.map(vehicle => (
          <li key={vehicle.deviceId}>
            {vehicle.vehicleName}: {vehicle.avgEfficiency.toFixed(2)} km/L
          </li>
        ))}
      </ul>

      {data.budgetProgress && (
        <div>
          <h2>Presupuesto del Mes</h2>
          <p>Estado: {data.budgetProgress.status}</p>
          <p>Porcentaje: {data.budgetProgress.percentage}%</p>
          <p>Restante: ${data.budgetProgress.remaining}</p>
        </div>
      )}
    </div>
  );
}
```

## Próximos Pasos

1. **Componentes UI** (pendiente):
   - `FuelFormModal.tsx`: Formulario de carga de combustible
   - `FuelTable.tsx`: Tabla con filtros y acciones CRUD
   - `FuelDashboard.tsx`: Estadísticas y gráficos
   - `FuelBudgetCard.tsx`: Card de presupuesto mensual

2. **Gráficos** (pendiente):
   - Consumo mensual (barras)
   - Eficiencia por vehículo (líneas)
   - Distribución por tipo de combustible (pie)

3. **Filtros Avanzados** (pendiente):
   - Por rango de fechas
   - Por conductor
   - Por estación de servicio
   - Por tipo de combustible

4. **Exportar Datos** (pendiente):
   - Excel/CSV con filtros aplicados
   - Reporte PDF mensual

## Notas Técnicas

- **Prisma ORM**: Typesafe database queries
- **TanStack Query**: Caching automático, refetch en foco, invalidación por mutaciones
- **Traccar Integration**: Nombres de vehículos enriquecidos desde API externa
- **Validaciones**: Server-side para seguridad (odómetro creciente, dispositivo válido)
- **Cálculos Puros**: Funciones sin efectos secundarios para testabilidad
