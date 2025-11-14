-- =====================================================
-- Migración: Habilitar Row Level Security (RLS)
-- Descripción: Habilita RLS en todas las tablas principales
--              para garantizar que los usuarios solo accedan
--              a sus propios datos
-- Fecha: 2025-11-14
-- =====================================================

-- =====================================================
-- TABLA: products
-- =====================================================

-- Habilitar RLS en la tabla products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios productos
CREATE POLICY "Users can view own products"
ON public.products
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios productos
CREATE POLICY "Users can insert own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios productos
CREATE POLICY "Users can update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios productos
CREATE POLICY "Users can delete own products"
ON public.products
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- =====================================================
-- TABLA: customers
-- =====================================================

-- Habilitar RLS en la tabla customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios clientes
CREATE POLICY "Users can view own customers"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propios clientes
CREATE POLICY "Users can insert own customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios clientes
CREATE POLICY "Users can update own customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios clientes
CREATE POLICY "Users can delete own customers"
ON public.customers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- =====================================================
-- TABLA: orders (órdenes de clientes)
-- =====================================================

-- Habilitar RLS en la tabla orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias órdenes
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar sus propias órdenes
CREATE POLICY "Users can insert own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propias órdenes
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propias órdenes
CREATE POLICY "Users can delete own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- =====================================================
-- TABLA: order_items (items de órdenes)
-- =====================================================

-- Habilitar RLS en la tabla order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios items de órdenes
-- Se verifica a través de la orden asociada
CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden insertar items en sus propias órdenes
CREATE POLICY "Users can insert own order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden actualizar items en sus propias órdenes
CREATE POLICY "Users can update own order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Política: Los usuarios solo pueden eliminar items de sus propias órdenes
CREATE POLICY "Users can delete own order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Crear índice para búsquedas rápidas por order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- =====================================================
-- TABLA: user_profiles (perfiles de usuario)
-- Solo si existe esta tabla
-- =====================================================

-- Verificar si la tabla user_profiles existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
  ) THEN
    -- Habilitar RLS en la tabla user_profiles
    ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

    -- Política: Los usuarios solo pueden ver su propio perfil
    CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    -- Política: Los usuarios solo pueden insertar su propio perfil
    CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    -- Política: Los usuarios solo pueden actualizar su propio perfil
    CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- Política: Los usuarios solo pueden eliminar su propio perfil
    CREATE POLICY "Users can delete own profile"
    ON public.user_profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

    -- Crear índice para búsquedas rápidas por user_id
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
  END IF;
END
$$;

-- =====================================================
-- Comentarios para documentación
-- =====================================================

COMMENT ON POLICY "Users can view own products" ON public.products IS 'Los usuarios solo pueden ver sus propios productos';
COMMENT ON POLICY "Users can view own customers" ON public.customers IS 'Los usuarios solo pueden ver sus propios clientes';
COMMENT ON POLICY "Users can view own orders" ON public.orders IS 'Los usuarios solo pueden ver sus propias órdenes';
COMMENT ON POLICY "Users can view own order items" ON public.order_items IS 'Los usuarios solo pueden ver items de sus propias órdenes';
