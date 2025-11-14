/**
 * Logger utility para manejar logs en desarrollo y producción
 *
 * En producción, los logs se deshabilitan automáticamente
 * En desarrollo, funcionan normalmente
 *
 * Uso:
 * import { logger } from '@/src/utils/logger';
 *
 * logger.log('Mensaje de log');
 * logger.error('Error:', error);
 * logger.warn('Advertencia');
 * logger.info('Información');
 */

// Determinar si estamos en producción
const __DEV__ = process.env.NODE_ENV !== 'production';

class Logger {
  /**
   * Log normal - solo en desarrollo
   */
  log(...args: any[]) {
    if (__DEV__) {
      console.log(...args);
    }
  }

  /**
   * Error log - siempre se muestra pero solo en desarrollo con stack trace completo
   */
  error(...args: any[]) {
    if (__DEV__) {
      console.error(...args);
    } else {
      // En producción, podrías enviar a un servicio de tracking como Sentry
      // Sentry.captureException(args[0]);
    }
  }

  /**
   * Warning - solo en desarrollo
   */
  warn(...args: any[]) {
    if (__DEV__) {
      console.warn(...args);
    }
  }

  /**
   * Info log - solo en desarrollo
   */
  info(...args: any[]) {
    if (__DEV__) {
      console.info(...args);
    }
  }

  /**
   * Debug log - solo en desarrollo
   */
  debug(...args: any[]) {
    if (__DEV__) {
      console.debug(...args);
    }
  }

  /**
   * Table log - solo en desarrollo
   */
  table(data: any) {
    if (__DEV__) {
      console.table(data);
    }
  }

  /**
   * Group - solo en desarrollo
   */
  group(label: string) {
    if (__DEV__) {
      console.group(label);
    }
  }

  /**
   * GroupEnd - solo en desarrollo
   */
  groupEnd() {
    if (__DEV__) {
      console.groupEnd();
    }
  }

  /**
   * Time - solo en desarrollo
   */
  time(label: string) {
    if (__DEV__) {
      console.time(label);
    }
  }

  /**
   * TimeEnd - solo en desarrollo
   */
  timeEnd(label: string) {
    if (__DEV__) {
      console.timeEnd(label);
    }
  }
}

// Exportar instancia única del logger
export const logger = new Logger();

// Export default para compatibilidad
export default logger;
