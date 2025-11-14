# Configuración de Base de Datos - Emprende App

Este documento describe cómo configurar las tablas y buckets de Supabase necesarios para el proyecto.

## 📋 Tabla business_settings

### Opción 1: Ejecutar desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto de Supabase: https://bjmmboptbblaehwhvhox.supabase.co
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido de `supabase/migrations/create_business_settings.sql`
5. Ejecuta la query (Run)

### Opción 2: Usar Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O ejecutar la migración manualmente
supabase db execute --file supabase/migrations/create_business_settings.sql
```

### Verificar la tabla

```sql
-- Verificar que la tabla se creó correctamente
SELECT * FROM public.business_settings LIMIT 1;

-- Ver la estructura de la tabla
\d public.business_settings;
```

---

## 🗄️ Storage Buckets

El proyecto requiere 2 buckets de Storage en Supabase:

### 1. product-images (Para imágenes de productos)

**Crear el bucket:**

1. Ve a **Storage** en el menú de Supabase
2. Click en "New Bucket"
3. Configura:
   - Name: `product-images`
   - Public: ✅ (marcado)
   - File size limit: 5 MB (recomendado)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

**Políticas de seguridad:**

```sql
-- Permitir subida a usuarios autenticados en su propia carpeta
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir lectura pública
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Permitir actualizar/eliminar solo sus propias imágenes
CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. business-logos (Para logos de negocios)

**Crear el bucket:**

1. Ve a **Storage** en el menú de Supabase
2. Click en "New Bucket"
3. Configura:
   - Name: `business-logos`
   - Public: ✅ (marcado)
   - File size limit: 2 MB (recomendado)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png`

**Políticas de seguridad:**

```sql
-- Permitir subida a usuarios autenticados (un logo por usuario)
CREATE POLICY "Users can upload business logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir lectura pública
CREATE POLICY "Public can view business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- Permitir actualizar su propio logo (upsert)
CREATE POLICY "Users can update own business logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminar su propio logo
CREATE POLICY "Users can delete own business logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## ✅ Checklist de Configuración

### Base de Datos

- [ ] Tabla `business_settings` creada
- [ ] Índice `idx_business_settings_user_id` creado
- [ ] Políticas RLS habilitadas
- [ ] Trigger `set_updated_at` funcionando
- [ ] Verificar con query: `SELECT * FROM business_settings;`

### Storage

- [ ] Bucket `product-images` creado y público
- [ ] Políticas de `product-images` configuradas
- [ ] Bucket `business-logos` creado y público
- [ ] Políticas de `business-logos` configuradas
- [ ] Probar subida de imagen desde la app

### Probar desde la App

```typescript
// Probar creación de configuración
import { BusinessSettingsService } from '@/src/services/BusinessSettingsService';

const testSettings = {
  business_name: 'Mi Negocio Test',
  phone: '+1234567890',
  email: 'test@test.com',
  address: 'Calle Test 123',
  description: 'Negocio de prueba',
  hours: DEFAULT_HOURS,
  currency: 'USD',
  auto_backup: false,
  notifications: true,
};

const result = await BusinessSettingsService.createSettings(testSettings);
console.log('Resultado:', result);
```

---

## 🔧 Troubleshooting

### Error: "relation does not exist"

**Causa:** La tabla no se creó correctamente.

**Solución:**
1. Verifica que ejecutaste el script SQL
2. Revisa en SQL Editor si la tabla existe: `SELECT * FROM business_settings;`

### Error: "Bucket not found"

**Causa:** Los buckets de Storage no están creados.

**Solución:**
1. Ve a Storage en Supabase Dashboard
2. Crea los buckets manualmente
3. Configura como públicos

**Fallback:** La app usará URIs locales si los buckets no existen.

### Error: "new row violates row-level security policy"

**Causa:** Las políticas RLS no están configuradas correctamente.

**Solución:**
1. Ejecuta las políticas SQL proporcionadas
2. Verifica que el usuario esté autenticado
3. Revisa los logs en Supabase Dashboard

### Imágenes no se suben

**Causa:** Políticas de Storage mal configuradas o bucket privado.

**Solución:**
1. Verifica que el bucket sea público
2. Ejecuta las políticas de seguridad SQL
3. Verifica que el usuario esté autenticado

---

## 📝 Estructura de la Tabla business_settings

```sql
business_settings
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users, UNIQUE)
├── business_name (TEXT, NOT NULL)
├── phone (TEXT)
├── email (TEXT)
├── address (TEXT)
├── description (TEXT)
├── logo_url (TEXT)
├── social_whatsapp (TEXT)
├── social_facebook (TEXT)
├── social_instagram (TEXT)
├── hours (JSONB) -- Horarios de atención
├── currency (TEXT, DEFAULT 'USD')
├── auto_backup (BOOLEAN, DEFAULT false)
├── notifications (BOOLEAN, DEFAULT true)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

### Ejemplo de datos en hours (JSONB):

```json
{
  "Lunes": {"enabled": true, "open": "09:00", "close": "18:00"},
  "Martes": {"enabled": true, "open": "09:00", "close": "18:00"},
  "Miércoles": {"enabled": true, "open": "09:00", "close": "18:00"},
  "Jueves": {"enabled": true, "open": "09:00", "close": "18:00"},
  "Viernes": {"enabled": true, "open": "09:00", "close": "18:00"},
  "Sábado": {"enabled": false, "open": "09:00", "close": "14:00"},
  "Domingo": {"enabled": false, "open": "09:00", "close": "14:00"}
}
```

---

## 🚀 Próximos Pasos

Una vez configurada la base de datos:

1. Prueba la creación de configuración desde la app
2. Sube una imagen de prueba
3. Verifica que los datos se guarden en Supabase
4. Prueba el fallback a AsyncStorage (modo offline)

---

## 💡 Notas Importantes

- **La app funciona sin los buckets**: Si los buckets no existen, usa URIs locales
- **AsyncStorage como fallback**: Los datos se guardan localmente si no hay conexión
- **Migración automática**: Si hay datos en AsyncStorage, se migran a Supabase
- **Un solo registro por usuario**: La constraint UNIQUE(user_id) previene duplicados
- **Seguridad RLS**: Solo puedes ver y modificar tu propia configuración

---

## 📚 Recursos

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
