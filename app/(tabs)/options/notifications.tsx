import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useNotifications } from '../../../src/contexts/NotificationContext';

export default function NotificationsSettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateSettings, requestPermissions, isEnabled } = useNotifications();

  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = (key: keyof typeof localSettings) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleThresholdChange = (value: string) => {
    const numValue = parseInt(value) || 10;
    setLocalSettings({ ...localSettings, lowStockThreshold: numValue });
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings(localSettings);
    setHasChanges(false);
    Alert.alert('Éxito', 'Configuración de notificaciones guardada');
  };

  const handleEnableNotifications = async () => {
    if (!isEnabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permisos denegados',
          'Para recibir notificaciones, habilita los permisos en la configuración de tu dispositivo.'
        );
      }
    } else {
      await updateSettings({ enabled: false });
    }
  };

  const SettingRow = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
    disabled = false
  }: {
    icon: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: theme.primary + '80' }}
        thumbColor={value ? theme.primary : theme.textTertiary}
        disabled={disabled}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status de notificaciones */}
        <View style={[styles.statusCard, { backgroundColor: isEnabled ? '#10B981' : '#EF4444' }]}>
          <View style={styles.statusIcon}>
            <Ionicons
              name={isEnabled ? 'checkmark-circle' : 'close-circle'}
              size={32}
              color="#fff"
            />
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {isEnabled ? 'Notificaciones Activas' : 'Notificaciones Desactivadas'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isEnabled
                ? 'Recibirás alertas según tu configuración'
                : 'Activa las notificaciones para recibir alertas importantes'}
            </Text>
          </View>
        </View>

        {/* Activar/Desactivar notificaciones globales */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Control General
            </Text>
          </View>
          <SettingRow
            icon="notifications-outline"
            title="Notificaciones Activadas"
            subtitle="Habilitar o deshabilitar todas las notificaciones"
            value={localSettings.enabled && isEnabled}
            onToggle={handleEnableNotifications}
          />
        </View>

        {/* Tipos de notificaciones */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Tipos de Alertas
            </Text>
          </View>

          <SettingRow
            icon="cube-outline"
            title="Alertas de Stock Bajo"
            subtitle="Notificar cuando un producto tiene poco inventario"
            value={localSettings.lowStockAlerts}
            onToggle={() => handleToggle('lowStockAlerts')}
            disabled={!localSettings.enabled || !isEnabled}
          />

          <SettingRow
            icon="receipt-outline"
            title="Recordatorios de Órdenes"
            subtitle="Notificar sobre órdenes pendientes diariamente"
            value={localSettings.orderReminders}
            onToggle={() => handleToggle('orderReminders')}
            disabled={!localSettings.enabled || !isEnabled}
          />

          <SettingRow
            icon="cash-outline"
            title="Recordatorios de Pagos"
            subtitle="Notificar sobre pagos pendientes diariamente"
            value={localSettings.paymentReminders}
            onToggle={() => handleToggle('paymentReminders')}
            disabled={!localSettings.enabled || !isEnabled}
          />

          <SettingRow
            icon="bar-chart-outline"
            title="Resumen Diario"
            subtitle="Recibir un resumen de ventas al final del día"
            value={localSettings.dailySummary}
            onToggle={() => handleToggle('dailySummary')}
            disabled={!localSettings.enabled || !isEnabled}
          />
        </View>

        {/* Umbral de stock bajo */}
        {localSettings.lowStockAlerts && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Configuración de Alertas
              </Text>
            </View>

            <View style={styles.thresholdContainer}>
              <View style={styles.thresholdInfo}>
                <Text style={[styles.thresholdLabel, { color: theme.text }]}>
                  Umbral de Stock Bajo
                </Text>
                <Text style={[styles.thresholdSubtitle, { color: theme.textSecondary }]}>
                  Notificar cuando el stock sea menor o igual a:
                </Text>
              </View>
              <View style={styles.thresholdInputContainer}>
                <TextInput
                  style={[styles.thresholdInput, {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.background
                  }]}
                  value={localSettings.lowStockThreshold.toString()}
                  onChangeText={handleThresholdChange}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={[styles.thresholdUnit, { color: theme.textSecondary }]}>
                  unidades
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={[styles.infoCard, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name="information-circle" size={24} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Las notificaciones te ayudan a mantener tu negocio al día con alertas sobre stock bajo,
            órdenes pendientes y recordatorios de pagos. Puedes personalizar qué tipo de alertas deseas recibir.
          </Text>
        </View>

        {/* Botón de guardar */}
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  thresholdContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  thresholdInfo: {
    marginBottom: 12,
  },
  thresholdLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  thresholdSubtitle: {
    fontSize: 14,
  },
  thresholdInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  thresholdUnit: {
    fontSize: 16,
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
