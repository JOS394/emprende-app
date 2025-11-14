-- Crear tabla para configuración del negocio
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  description TEXT,
  logo_url TEXT,
  social_whatsapp TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  hours JSONB DEFAULT '{
    "Lunes": {"enabled": true, "open": "09:00", "close": "18:00"},
    "Martes": {"enabled": true, "open": "09:00", "close": "18:00"},
    "Miércoles": {"enabled": true, "open": "09:00", "close": "18:00"},
    "Jueves": {"enabled": true, "open": "09:00", "close": "18:00"},
    "Viernes": {"enabled": true, "open": "09:00", "close": "18:00"},
    "Sábado": {"enabled": false, "open": "09:00", "close": "14:00"},
    "Domingo": {"enabled": false, "open": "09:00", "close": "14:00"}
  }'::jsonb,
  currency TEXT DEFAULT 'USD',
  auto_backup BOOLEAN DEFAULT false,
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id) -- Solo una configuración por usuario
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON public.business_settings(user_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propia configuración
CREATE POLICY "Users can view own business settings"
ON public.business_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar su propia configuración
CREATE POLICY "Users can insert own business settings"
ON public.business_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propia configuración
CREATE POLICY "Users can update own business settings"
ON public.business_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar su propia configuración
CREATE POLICY "Users can delete own business settings"
ON public.business_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.business_settings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.business_settings IS 'Configuración del negocio por usuario';
COMMENT ON COLUMN public.business_settings.hours IS 'Horarios de atención en formato JSON';
COMMENT ON COLUMN public.business_settings.currency IS 'Moneda utilizada (USD, EUR, etc)';
COMMENT ON COLUMN public.business_settings.auto_backup IS 'Backup automático habilitado';
COMMENT ON COLUMN public.business_settings.notifications IS 'Notificaciones habilitadas';
