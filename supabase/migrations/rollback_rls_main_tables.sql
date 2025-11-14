-- =====================================================
-- Migración de Rollback: Deshabilitar Row Level Security
-- Descripción: Deshabilita RLS y elimina todas las políticas
--              USAR SOLO EN DESARROLLO O EMERGENCIAS
-- Fecha: 2025-11-14
-- =====================================================

-- ADVERTENCIA: Esta migración elimina todas las protecciones RLS
-- Solo ejecutar si necesitas revertir los cambios

-- =====================================================
-- TABLA: products
-- =====================================================

-- Eliminar políticas
DROP POLICY IF EXISTS "Users can view own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products;
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

-- Deshabilitar RLS
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Eliminar índice
DROP INDEX IF EXISTS idx_products_user_id;

-- =====================================================
-- TABLA: customers
-- =====================================================

-- Eliminar políticas
DROP POLICY IF EXISTS "Users can view own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON public.customers;

-- Deshabilitar RLS
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Eliminar índice
DROP INDEX IF EXISTS idx_customers_user_id;

-- =====================================================
-- TABLA: orders
-- =====================================================

-- Eliminar políticas
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;

-- Deshabilitar RLS
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Eliminar índice
DROP INDEX IF EXISTS idx_orders_user_id;

-- =====================================================
-- TABLA: order_items
-- =====================================================

-- Eliminar políticas
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can delete own order items" ON public.order_items;

-- Deshabilitar RLS
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Eliminar índice
DROP INDEX IF EXISTS idx_order_items_order_id;

-- =====================================================
-- TABLA: user_profiles
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
  ) THEN
    -- Eliminar políticas
    DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
    DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

    -- Deshabilitar RLS
    ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

    -- Eliminar índice
    DROP INDEX IF EXISTS idx_user_profiles_user_id;
  END IF;
END
$$;
