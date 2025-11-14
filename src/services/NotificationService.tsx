import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// Configurar cómo se manejan las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  lowStockAlerts: boolean;
  orderReminders: boolean;
  paymentReminders: boolean;
  dailySummary: boolean;
  lowStockThreshold: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  lowStockAlerts: true,
  orderReminders: true,
  paymentReminders: true,
  dailySummary: false,
  lowStockThreshold: 10,
};

const SETTINGS_KEY = '@notification_settings';
const NOTIFICATION_IDS_KEY = '@notification_ids';

export class NotificationService {
  // Solicitar permisos de notificación
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Permisos de notificación denegados');
        return false;
      }

      // Configurar canal de notificación para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Notificaciones de Negocio',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });

        await Notifications.setNotificationChannelAsync('stock-alerts', {
          name: 'Alertas de Stock',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF9800',
        });

        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Órdenes y Pagos',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2196F3',
        });
      }

      return true;
    } catch (error: any) {
      logger.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  }

  // Obtener configuración de notificaciones
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return DEFAULT_SETTINGS;
    } catch (error: any) {
      logger.error('Error obteniendo configuración de notificaciones:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Guardar configuración de notificaciones
  static async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error: any) {
      logger.error('Error guardando configuración de notificaciones:', error);
    }
  }

  // Programar notificación de stock bajo
  static async scheduleLowStockNotification(
    productName: string,
    currentStock: number,
    productId: number
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || !settings.lowStockAlerts) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Stock Bajo',
          body: `${productName} tiene solo ${currentStock} unidades disponibles`,
          data: { type: 'low_stock', productId, productName, stock: currentStock },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Enviar inmediatamente
      });

      await this.saveNotificationId('low_stock', notificationId);
      return notificationId;
    } catch (error: any) {
      logger.error('Error programando notificación de stock bajo:', error);
      return null;
    }
  }

  // Programar notificación de órdenes pendientes
  static async schedulePendingOrdersNotification(
    orderCount: number,
    totalAmount: number
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || !settings.orderReminders) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📦 Órdenes Pendientes',
          body: `Tienes ${orderCount} ${orderCount === 1 ? 'orden pendiente' : 'órdenes pendientes'} por $${totalAmount.toLocaleString()}`,
          data: { type: 'pending_orders', count: orderCount, total: totalAmount },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true, // Repetir diariamente
        },
      });

      await this.saveNotificationId('pending_orders', notificationId);
      return notificationId;
    } catch (error: any) {
      logger.error('Error programando notificación de órdenes pendientes:', error);
      return null;
    }
  }

  // Programar notificación de pagos pendientes
  static async schedulePendingPaymentsNotification(
    paymentCount: number,
    totalAmount: number
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || !settings.paymentReminders) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Pagos Pendientes',
          body: `Tienes ${paymentCount} ${paymentCount === 1 ? 'pago pendiente' : 'pagos pendientes'} por cobrar: $${totalAmount.toLocaleString()}`,
          data: { type: 'pending_payments', count: paymentCount, total: totalAmount },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          hour: 17,
          minute: 0,
          repeats: true, // Repetir diariamente
        },
      });

      await this.saveNotificationId('pending_payments', notificationId);
      return notificationId;
    } catch (error: any) {
      logger.error('Error programando notificación de pagos pendientes:', error);
      return null;
    }
  }

  // Programar resumen diario
  static async scheduleDailySummaryNotification(
    stats: {
      ordersToday: number;
      revenueToday: number;
      pendingOrders: number;
    }
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled || !settings.dailySummary) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Resumen Diario',
          body: `Hoy: ${stats.ordersToday} órdenes, $${stats.revenueToday.toLocaleString()} en ventas. ${stats.pendingOrders} pendientes.`,
          data: { type: 'daily_summary', ...stats },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true, // Repetir diariamente
        },
      });

      await this.saveNotificationId('daily_summary', notificationId);
      return notificationId;
    } catch (error: any) {
      logger.error('Error programando resumen diario:', error);
      return null;
    }
  }

  // Enviar notificación inmediata
  static async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Enviar inmediatamente
      });

      return notificationId;
    } catch (error: any) {
      logger.error('Error enviando notificación inmediata:', error);
      return null;
    }
  }

  // Cancelar todas las notificaciones programadas
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    } catch (error: any) {
      logger.error('Error cancelando notificaciones:', error);
    }
  }

  // Cancelar notificación por tipo
  static async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const ids = await this.getNotificationIds(type);
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      await this.removeNotificationIds(type);
    } catch (error: any) {
      logger.error('Error cancelando notificaciones por tipo:', error);
    }
  }

  // Guardar ID de notificación
  private static async saveNotificationId(type: string, id: string): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      const ids = idsJson ? JSON.parse(idsJson) : {};
      if (!ids[type]) {
        ids[type] = [];
      }
      ids[type].push(id);
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    } catch (error: any) {
      logger.error('Error guardando ID de notificación:', error);
    }
  }

  // Obtener IDs de notificaciones por tipo
  private static async getNotificationIds(type: string): Promise<string[]> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      const ids = idsJson ? JSON.parse(idsJson) : {};
      return ids[type] || [];
    } catch (error: any) {
      logger.error('Error obteniendo IDs de notificaciones:', error);
      return [];
    }
  }

  // Eliminar IDs de notificaciones por tipo
  private static async removeNotificationIds(type: string): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
      const ids = idsJson ? JSON.parse(idsJson) : {};
      delete ids[type];
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    } catch (error: any) {
      logger.error('Error eliminando IDs de notificaciones:', error);
    }
  }

  // Obtener todas las notificaciones programadas
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error: any) {
      logger.error('Error obteniendo notificaciones programadas:', error);
      return [];
    }
  }

  // Verificar si las notificaciones están habilitadas
  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const settings = await this.getSettings();
      return status === 'granted' && settings.enabled;
    } catch (error: any) {
      logger.error('Error verificando estado de notificaciones:', error);
      return false;
    }
  }
}
