import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService, NotificationSettings } from '../services/NotificationService';
import { logger } from '../utils/logger';
import { useRequireAuth } from './AuthContext';

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  checkAndNotifyLowStock: (products: any[]) => Promise<void>;
  checkAndNotifyPendingOrders: (orders: any[]) => Promise<void>;
  sendCustomNotification: (title: string, body: string, data?: any) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  isEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    lowStockAlerts: true,
    orderReminders: true,
    paymentReminders: true,
    dailySummary: false,
    lowStockThreshold: 10,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const { user } = useRequireAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Cargar configuración al iniciar
  useEffect(() => {
    loadSettings();
    setupNotificationListeners();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Verificar permisos cuando el usuario cambia
  useEffect(() => {
    if (user) {
      checkPermissions();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await NotificationService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      logger.error('Error cargando configuración de notificaciones:', error);
    }
  };

  const checkPermissions = async () => {
    const enabled = await NotificationService.areNotificationsEnabled();
    setIsEnabled(enabled);
  };

  const setupNotificationListeners = () => {
    // Listener para cuando se recibe una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      logger.info('Notificación recibida:', notification);
    });

    // Listener para cuando el usuario interactúa con una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      logger.info('Usuario interactuó con notificación:', response);
      const data = response.notification.request.content.data;

      // Aquí puedes agregar navegación basada en el tipo de notificación
      if (data.type === 'low_stock') {
        // Navegar a productos
        logger.info('Navegando a productos por notificación de stock bajo');
      } else if (data.type === 'pending_orders') {
        // Navegar a órdenes
        logger.info('Navegando a órdenes por notificación');
      } else if (data.type === 'pending_payments') {
        // Navegar a pagos
        logger.info('Navegando a pagos por notificación');
      }
    });
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await NotificationService.saveSettings(updatedSettings);
      setSettings(updatedSettings);

      // Si se deshabilitaron las notificaciones, cancelar todas
      if (updatedSettings.enabled === false) {
        await NotificationService.cancelAllNotifications();
      }

      // Si se cambiaron configuraciones específicas, actualizar notificaciones
      if (newSettings.lowStockAlerts === false) {
        await NotificationService.cancelNotificationsByType('low_stock');
      }
      if (newSettings.orderReminders === false) {
        await NotificationService.cancelNotificationsByType('pending_orders');
      }
      if (newSettings.paymentReminders === false) {
        await NotificationService.cancelNotificationsByType('pending_payments');
      }
      if (newSettings.dailySummary === false) {
        await NotificationService.cancelNotificationsByType('daily_summary');
      }
    } catch (error) {
      logger.error('Error actualizando configuración de notificaciones:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    const granted = await NotificationService.requestPermissions();
    if (granted) {
      await updateSettings({ enabled: true });
      setIsEnabled(true);
    }
    return granted;
  };

  const checkAndNotifyLowStock = async (products: any[]) => {
    if (!settings.enabled || !settings.lowStockAlerts) return;

    try {
      const lowStockProducts = products.filter(
        product => product.stock_quantity <= settings.lowStockThreshold && product.stock_quantity > 0
      );

      for (const product of lowStockProducts) {
        await NotificationService.scheduleLowStockNotification(
          product.name,
          product.stock_quantity,
          product.id
        );
      }

      // Notificar productos agotados
      const outOfStockProducts = products.filter(product => product.stock_quantity === 0);
      if (outOfStockProducts.length > 0) {
        await NotificationService.sendImmediateNotification(
          '🚨 Productos Agotados',
          `${outOfStockProducts.length} ${outOfStockProducts.length === 1 ? 'producto agotado' : 'productos agotados'}`,
          { type: 'out_of_stock', count: outOfStockProducts.length }
        );
      }
    } catch (error) {
      logger.error('Error verificando stock bajo:', error);
    }
  };

  const checkAndNotifyPendingOrders = async (orders: any[]) => {
    if (!settings.enabled || !settings.orderReminders) return;

    try {
      const pendingOrders = orders.filter(
        order => order.status === 'pending' || order.status === 'confirmed'
      );

      if (pendingOrders.length > 0) {
        const totalAmount = pendingOrders.reduce((sum, order) => sum + (order.totalAmount || order.total_amount || 0), 0);
        await NotificationService.schedulePendingOrdersNotification(
          pendingOrders.length,
          totalAmount
        );
      }

      // Verificar pagos pendientes
      if (settings.paymentReminders) {
        const unpaidOrders = orders.filter(
          order => order.paymentStatus === 'pending' || order.payment_status === 'pending'
        );

        if (unpaidOrders.length > 0) {
          const totalUnpaid = unpaidOrders.reduce((sum, order) => sum + (order.totalAmount || order.total_amount || 0), 0);
          await NotificationService.schedulePendingPaymentsNotification(
            unpaidOrders.length,
            totalUnpaid
          );
        }
      }
    } catch (error) {
      logger.error('Error verificando órdenes pendientes:', error);
    }
  };

  const sendCustomNotification = async (title: string, body: string, data?: any) => {
    if (!settings.enabled) return;

    try {
      await NotificationService.sendImmediateNotification(title, body, data);
    } catch (error) {
      logger.error('Error enviando notificación personalizada:', error);
    }
  };

  const value: NotificationContextType = {
    settings,
    updateSettings,
    checkAndNotifyLowStock,
    checkAndNotifyPendingOrders,
    sendCustomNotification,
    requestPermissions,
    isEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
