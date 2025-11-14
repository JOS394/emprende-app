# Migraciones de Supabase

Este directorio contiene las migraciones SQL para configurar la base de datos de Supabase.

## Migraciones Disponibles

### 1. `create_business_settings.sql`
Crea la tabla `business_settings` para almacenar la configuración del negocio por usuario, con RLS habilitado.

### 2. `enable_rls_main_tables.sql` ⚠️ CRÍTICO
Habilita Row Level Security (RLS) en todas las tablas principales:
- `products` - Productos del inventario
- `customers` - Clientes
- `orders` - Órdenes de clientes
- `order_items` - Items de las órdenes
- `user_profiles` - Perfiles de usuario (si existe)

**IMPORTANTE**: Esta migración es crítica para la seguridad. Sin RLS, todos los usuarios autenticados pueden ver y modificar los datos de otros usuarios.

### 3. `rollback_rls_main_tables.sql` 🔴 EMERGENCIA
Deshabilita RLS y elimina todas las políticas. **SOLO USAR EN DESARROLLO O EMERGENCIAS**.

## Cómo Aplicar las Migraciones

### Opción 1: Supabase CLI (Recomendado)

1. Instala Supabase CLI si no lo tienes:
   ```bash
   npm install -g supabase
   ```

2. Inicializa Supabase en tu proyecto (si no lo has hecho):
   ```bash
   supabase init
   ```

3. Conecta a tu proyecto de Supabase:
   ```bash
   supabase link --project-ref <tu-project-ref>
   ```

4. Aplica todas las migraciones:
   ```bash
   supabase db push
   ```

### Opción 2: Dashboard de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de cada archivo `.sql`
4. Ejecuta los scripts en orden:
   - Primero: `create_business_settings.sql`
   - Segundo: `enable_rls_main_tables.sql`

### Opción 3: API de Supabase

Puedes ejecutar las migraciones programáticamente usando la API de Supabase.

## Verificar que RLS está Habilitado

Después de aplicar las migraciones, verifica que RLS está habilitado ejecutando:

```sql
-- En Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'customers', 'orders', 'order_items', 'user_profiles', 'business_settings');
```

Todas las tablas deben tener `rowsecurity = true`.

## Verificar Políticas RLS

Para ver las políticas creadas:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Requisitos Previos

Antes de aplicar `enable_rls_main_tables.sql`, asegúrate de que:

1. ✅ Las tablas existan en Supabase:
   - `products`
   - `customers`
   - `orders`
   - `order_items`

2. ✅ Todas las tablas tengan la columna `user_id` de tipo `UUID` que hace referencia a `auth.users(id)`

3. ✅ Tienes un backup de tu base de datos (por si acaso)

## Agregar columna user_id (si no existe)

Si las tablas no tienen la columna `user_id`, ejecuta esto primero:

```sql
-- Agregar user_id a products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar user_id a customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Agregar user_id a orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Si quieres establecer un user_id por defecto para datos existentes:
-- UPDATE public.products SET user_id = '<UUID-de-tu-usuario>' WHERE user_id IS NULL;
-- UPDATE public.customers SET user_id = '<UUID-de-tu-usuario>' WHERE user_id IS NULL;
-- UPDATE public.orders SET user_id = '<UUID-de-tu-usuario>' WHERE user_id IS NULL;
```

## Rollback en Caso de Emergencia

Si algo sale mal después de aplicar RLS:

```bash
# Usando Supabase SQL Editor, ejecuta:
# rollback_rls_main_tables.sql
```

⚠️ **ADVERTENCIA**: El rollback eliminará todas las protecciones de seguridad. Solo usar temporalmente mientras se corrige el problema.

## Pruebas Recomendadas

Después de aplicar RLS, prueba lo siguiente:

1. Crea un usuario de prueba
2. Inicia sesión con ese usuario
3. Intenta crear, leer, actualizar y eliminar datos
4. Verifica que solo puedes ver tus propios datos
5. Intenta acceder a datos de otro usuario (debe fallar)

## Soporte

Para más información sobre RLS en Supabase:
- [Documentación oficial de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas de RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
