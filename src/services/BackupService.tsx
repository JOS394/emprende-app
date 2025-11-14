import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export class BackupService {

  // Crear backup completo de datos del usuario
  static async createBackup() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener todos los datos del usuario
      const [products, customers, orders, profile] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('orders').select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price
          )
        `).eq('user_id', user.id),
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      ]);

      // Verificar errores
      if (products.error) throw products.error;
      if (customers.error) throw customers.error;
      if (orders.error) throw orders.error;
      if (profile.error) throw profile.error;

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        userId: user.id,
        data: {
          products: products.data,
          customers: customers.data,
          orders: orders.data,
          profile: profile.data,
        },
        stats: {
          totalProducts: products.data?.length || 0,
          totalCustomers: customers.data?.length || 0,
          totalOrders: orders.data?.length || 0,
        }
      };

      // Calcular tamaño del backup (estimado)
      const backupString = JSON.stringify(backupData);
      const backupSize = (new Blob([backupString]).size / 1024 / 1024).toFixed(2); // MB

      // Guardar metadata del backup en AsyncStorage
      await AsyncStorage.setItem('lastBackup', JSON.stringify({
        timestamp: backupData.timestamp,
        size: `${backupSize} MB`,
        itemsCount: backupData.stats.totalProducts + backupData.stats.totalCustomers + backupData.stats.totalOrders,
      }));

      return {
        success: true,
        backup: backupData,
        size: `${backupSize} MB`,
      };
    } catch (error: any) {
      logger.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estado de sincronización
  static async getSyncStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Contar elementos en cada tabla
      const [products, customers, orders] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const totalItems = (products.count || 0) + (customers.count || 0) + (orders.count || 0);

      // Obtener último backup
      const lastBackupString = await AsyncStorage.getItem('lastBackup');
      const lastBackup = lastBackupString ? JSON.parse(lastBackupString) : null;

      return {
        success: true,
        status: {
          isConnected: true,
          lastSync: lastBackup?.timestamp || new Date().toISOString(),
          pendingChanges: 0, // En esta implementación no hay cambios pendientes
          totalItems,
          syncedItems: totalItems,
        }
      };
    } catch (error: any) {
      logger.error('Error getting sync status:', error);
      return {
        success: false,
        error: error.message,
        status: {
          isConnected: false,
          lastSync: null,
          pendingChanges: 0,
          totalItems: 0,
          syncedItems: 0,
        }
      };
    }
  }

  // Sincronizar datos (en esta versión es automático con Supabase)
  static async syncNow() {
    try {
      // Verificar conexión
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) throw error;

      // Actualizar timestamp de sincronización
      await AsyncStorage.setItem('lastSync', new Date().toISOString());

      return { success: true, message: 'Sincronización completada' };
    } catch (error: any) {
      logger.error('Error syncing:', error);
      return { success: false, error: error.message };
    }
  }

  // Restaurar backup (importar datos)
  static async restoreBackup(backupData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validar estructura del backup
      if (!backupData.version || !backupData.data) {
        throw new Error('Formato de backup inválido');
      }

      // Advertencia: esto eliminará datos existentes
      Alert.alert(
        'Advertencia',
        'Restaurar un backup eliminará todos tus datos actuales. ¿Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Restaurar',
            style: 'destructive',
            onPress: async () => {
              // Aquí iría la lógica de restauración
              // Por seguridad, no implementamos eliminación automática
              logger.log('Restauración de backup preparada');
            }
          }
        ]
      );

      return { success: true, message: 'Backup cargado. Confirma para restaurar.' };
    } catch (error: any) {
      logger.error('Error restoring backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Exportar datos a JSON
  static async exportToJSON() {
    try {
      const backupResult = await this.createBackup();

      if (!backupResult.success) {
        throw new Error(backupResult.error);
      }

      return {
        success: true,
        data: backupResult.backup,
        filename: `emprende-backup-${new Date().toISOString().split('T')[0]}.json`,
      };
    } catch (error: any) {
      logger.error('Error exporting to JSON:', error);
      return { success: false, error: error.message };
    }
  }

  // Importar datos desde JSON
  static async importFromJSON(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);

      // Validar estructura
      if (!data.version || !data.data) {
        throw new Error('Archivo JSON inválido o corrupto');
      }

      return await this.restoreBackup(data);
    } catch (error: any) {
      logger.error('Error importing from JSON:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener información del último backup
  static async getLastBackupInfo() {
    try {
      const lastBackupString = await AsyncStorage.getItem('lastBackup');

      if (!lastBackupString) {
        return { success: true, backup: null };
      }

      const lastBackup = JSON.parse(lastBackupString);

      return {
        success: true,
        backup: {
          timestamp: lastBackup.timestamp,
          size: lastBackup.size,
          itemsCount: lastBackup.itemsCount,
        }
      };
    } catch (error: any) {
      logger.error('Error getting last backup info:', error);
      return { success: false, error: error.message };
    }
  }
}
