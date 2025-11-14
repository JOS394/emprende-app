# Guía de Migración del Logger

Este archivo documenta cómo migrar los `console.log` existentes a la nueva utilidad de logger para producción.

## ¿Por qué usar el logger?

El logger permite:
- ✅ Deshabilitar logs en producción automáticamente
- ✅ Mejor performance en producción
- ✅ Posibilidad de enviar errores a servicios como Sentry
- ✅ Control centralizado de todos los logs

## Cómo usar el logger

### Importar el logger

```typescript
import { logger } from '@/src/utils/logger';
```

### Reemplazar console.log

**Antes:**
```typescript
console.log('Datos cargados:', data);
console.error('Error:', error);
console.warn('Advertencia:', message);
```

**Después:**
```typescript
logger.log('Datos cargados:', data);
logger.error('Error:', error);
logger.warn('Advertencia:', message);
```

## Archivos que necesitan migración

Los siguientes archivos contienen `console.log/error/warn` que deberían migrar:

### Servicios (src/services/)
- ✅ `ProductsService.tsx` - 8 console.error
- ✅ `CustomerOrderService.tsx` - 11 console.error
- ✅ `BackupService.tsx` - 5 console.error
- ✅ `ReportsService.tsx` - 6 console.error
- ✅ `CustomersService.tsx` - 9 console.error
- ✅ `DashboardService.tsx` - 4 console.error
- ✅ `OrdersService.tsx` - 5 console.error
- ✅ `ProfileService.tsx` - 4 console.error
- ✅ `VendorsService.tsx` - 5 console.error
- ✅ `authService.tsx` - 5 console.error

### Contextos (src/contexts/)
- ✅ `AuthContext.tsx` - 1 console.error

### Database (src/database/)
- ✅ `database.tsx` - 5 console.error

### Lib (src/lib/)
- ✅ `supabase.js` - 3 console.log

## Estrategia de migración recomendada

### Opción 1: Migración gradual (Recomendado)
Migrar archivo por archivo cuando trabajes en ellos:

1. Importar el logger al inicio del archivo
2. Hacer find & replace de `console.` por `logger.`
3. Probar que funciona correctamente

### Opción 2: Migración masiva con script
Crear un script que reemplace automáticamente:

```bash
# Ejemplo con sed (Linux/Mac)
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/console\./logger\./g'
```

**⚠️ Advertencia:** Necesitarás agregar el import del logger manualmente después.

### Opción 3: Mantener console.error para errores críticos
Puedes mantener `console.error` en producción para errores críticos y solo migrar los `console.log` y `console.warn`:

```typescript
// Logs normales - solo desarrollo
logger.log('Cargando datos...');

// Errores - puede ir a Sentry en producción
logger.error('Error crítico:', error);
```

## Ejemplo completo de migración

**Antes (ProductsService.tsx):**
```typescript
static async getProducts() {
  try {
    // ... código
    return { success: true, products };
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    return { success: false, error: error.message };
  }
}
```

**Después:**
```typescript
import { logger } from '../utils/logger';

static async getProducts() {
  try {
    // ... código
    return { success: true, products };
  } catch (error: any) {
    logger.error('Error obteniendo productos:', error);
    return { success: false, error: error.message };
  }
}
```

## Integración futura con servicios de tracking

El logger está preparado para integrar con servicios como Sentry:

```typescript
// En src/utils/logger.ts
error(...args: any[]) {
  if (__DEV__) {
    console.error(...args);
  } else {
    // Enviar a Sentry en producción
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(args[0]);
    }
  }
}
```

## Checklist de migración

- [ ] Migrar archivos de servicios (10 archivos)
- [ ] Migrar contextos (1 archivo)
- [ ] Migrar database (1 archivo)
- [ ] Migrar lib/supabase (1 archivo)
- [ ] Actualizar componentes si tienen logs
- [ ] Probar en desarrollo que los logs funcionan
- [ ] Probar en producción que los logs están deshabilitados
- [ ] (Opcional) Integrar con Sentry u otro servicio

## Notas importantes

1. **El logger NO necesita migración inmediata**. Los `console.log` actuales seguirán funcionando.

2. **Migración gradual es mejor**. No hace falta migrar todo de una vez.

3. **Los console.error pueden mantenerse** si quieres que se muestren en producción para debugging crítico.

4. **En producción, NODE_ENV debe ser 'production'** para que el logger deshabilite los logs.

## Estado actual

✅ Logger creado y listo para usar
⏳ Migración pendiente de ~87 ocurrencias de console.log/error/warn
📝 Archivos identificados y documentados

## Preguntas frecuentes

**P: ¿Debo migrar TODO ahora?**
R: No, puedes hacerlo gradualmente.

**P: ¿Los console.log dejan de funcionar?**
R: No, siguen funcionando normalmente. El logger es una alternativa mejor.

**P: ¿Qué pasa con los console.error?**
R: Los logger.error() pueden configurarse para enviarse a Sentry en producción.

**P: ¿Cómo sé que estoy en producción?**
R: El logger lo detecta automáticamente con `process.env.NODE_ENV`.
