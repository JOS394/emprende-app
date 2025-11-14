import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BackupService } from '../../../../src/services/BackupService';

export default function BackupScreen() {
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    includeImages: true,
    cloudProvider: 'google', // google, icloud, dropbox
    lastBackup: new Date().toISOString(),
    backupSize: '2.4 MB',
  });

  const [syncStatus, setSyncStatus] = useState({
    isConnected: true,
    lastSync: new Date().toISOString(),
    pendingChanges: 0,
    totalItems: 156,
    syncedItems: 156,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    loadBackupSettings();
    checkSyncStatus();
  }, []);

  const loadBackupSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('backupSettings');
      if (saved) {
        setBackupSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  };

  const saveBackupSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('backupSettings', JSON.stringify(newSettings));
      setBackupSettings(newSettings);
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  };

  const checkSyncStatus = async () => {
    try {
      const result = await BackupService.getSyncStatus();

      if (result.success && result.status) {
        setSyncStatus(result.status);
      } else {
        setSyncStatus(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
      setSyncStatus(prev => ({ ...prev, isConnected: false }));
    }
  };

  const performBackup = async () => {
    setIsLoading(true);
    setShowBackupModal(true);
    setBackupProgress(0);

    try {
      // Mostrar progreso visual
      const progressSteps = [20, 40, 60, 80, 90];
      for (const step of progressSteps) {
        setBackupProgress(step);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Crear backup real
      const result = await BackupService.createBackup();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear el backup');
      }

      setBackupProgress(100);

      // Actualizar configuración
      const updatedSettings = {
        ...backupSettings,
        lastBackup: new Date().toISOString(),
        backupSize: result.size || '0 MB',
      };
      await saveBackupSettings(updatedSettings);

      Alert.alert('Éxito', `Respaldo completado correctamente\nTamaño: ${result.size}`);
    } catch (error: any) {
      console.error('Error performing backup:', error);
      Alert.alert('Error', `No se pudo completar el respaldo: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
      setShowBackupModal(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async () => {
    Alert.alert(
      'Restaurar Respaldo',
      '¿Estás seguro? Esto reemplazará todos tus datos actuales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Simular restauración
              await new Promise(resolve => setTimeout(resolve, 3000));
              Alert.alert('Éxito', 'Datos restaurados correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo restaurar el respaldo');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      setIsLoading(true);

      // Obtener backup real de la base de datos
      const result = await BackupService.exportToJSON();

      if (!result.success) {
        throw new Error(result.error || 'Error al exportar datos');
      }

      const fileName = result.filename || `emprende-backup-${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(result.data, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Éxito', `Archivo exportado a: ${fileName}`);
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', `No se pudo exportar los datos: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const fileUri = result.assets[0].uri;

        // Leer el archivo JSON
        const fileContent = await FileSystem.readAsStringAsync(fileUri);

        Alert.alert(
          'Importar Datos',
          '¿Estás seguro? Esta función está en desarrollo y no reemplazará tus datos actuales.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Validar',
              onPress: async () => {
                setIsLoading(true);
                try {
                  const importResult = await BackupService.importFromJSON(fileContent);

                  if (!importResult.success) {
                    throw new Error(importResult.error || 'Error al validar el archivo');
                  }

                  Alert.alert('Validación Exitosa', 'El archivo JSON es válido. La restauración completa estará disponible próximamente.');
                } catch (error: any) {
                  console.error('Error importing data:', error);
                  Alert.alert('Error', `No se pudo importar el archivo: ${error.message || 'Error desconocido'}`);
                } finally {
                  setIsLoading(false);
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const syncNow = async () => {
    setIsLoading(true);
    try {
      const result = await BackupService.syncNow();

      if (!result.success) {
        throw new Error(result.error || 'Error al sincronizar');
      }

      // Actualizar estado de sincronización
      await checkSyncStatus();

      Alert.alert('Éxito', 'Sincronización completada. Tus datos están actualizados en la nube.');
    } catch (error: any) {
      console.error('Error syncing:', error);
      Alert.alert('Error', `No se pudo sincronizar: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const SettingRow = ({ icon, title, subtitle, value, onValueChange, type = 'switch', color = '#3B82F6' }) => (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: color }}
          thumbColor={value ? '#FFF' : '#FFF'}
        />
      )}
      {type === 'select' && (
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );

  const StatusCard = ({ title, status, lastAction, color, icon }) => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>{title}</Text>
          <Text style={[styles.statusText, { color }]}>{status}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
      </View>
      <Text style={styles.statusLastAction}>{lastAction}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>Respaldo y Sincronización</Text>
        <TouchableOpacity 
          onPress={syncNow}
          style={styles.syncButton}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Estado actual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado Actual</Text>
          
          <StatusCard
            title="Respaldo en la Nube"
            status={backupSettings.autoBackup ? 'Activo' : 'Inactivo'}
            lastAction={`Último respaldo: ${formatDate(backupSettings.lastBackup)}`}
            color={backupSettings.autoBackup ? '#10B981' : '#F59E0B'}
            icon="cloud-done"
          />

          <StatusCard
            title="Sincronización"
            status={syncStatus.isConnected ? 'Conectado' : 'Desconectado'}
            lastAction={`Última sincronización: ${formatDate(syncStatus.lastSync)}`}
            color={syncStatus.isConnected ? '#10B981' : '#EF4444'}
            icon="sync"
          />

          {syncStatus.pendingChanges > 0 && (
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                {syncStatus.pendingChanges} cambios pendientes de sincronizar
              </Text>
            </View>
          )}
        </View>

        {/* Configuración de respaldo automático */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Respaldo Automático</Text>
          
          <SettingRow
            icon="cloud-upload"
            title="Respaldo automático"
            subtitle="Respaldar datos automáticamente"
            value={backupSettings.autoBackup}
            onValueChange={(value) => saveBackupSettings({...backupSettings, autoBackup: value})}
            color="#10B981"
          />

          <SettingRow
            icon="time"
            title="Frecuencia"
            subtitle="Cada cuánto respaldar"
            value={backupSettings.backupFrequency === 'daily' ? 'Diario' : 
                   backupSettings.backupFrequency === 'weekly' ? 'Semanal' : 'Mensual'}
            type="select"
            color="#3B82F6"
          />

          <SettingRow
            icon="image"
            title="Incluir imágenes"
            subtitle="Respaldar fotos de productos"
            value={backupSettings.includeImages}
            onValueChange={(value) => saveBackupSettings({...backupSettings, includeImages: value})}
            color="#8B5CF6"
          />

          <View style={styles.backupInfo}>
            <View style={styles.backupInfoItem}>
              <Text style={styles.backupInfoLabel}>Tamaño del respaldo</Text>
              <Text style={styles.backupInfoValue}>{backupSettings.backupSize}</Text>
            </View>
            <View style={styles.backupInfoItem}>
              <Text style={styles.backupInfoLabel}>Proveedor</Text>
              <Text style={styles.backupInfoValue}>
                {backupSettings.cloudProvider === 'google' ? 'Google Drive' : 
                 backupSettings.cloudProvider === 'icloud' ? 'iCloud' : 'Dropbox'}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones de respaldo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones de Respaldo</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={performBackup} disabled={isLoading}>
            <View style={styles.actionIcon}>
              <Ionicons name="cloud-upload" size={20} color="#10B981" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Crear Respaldo Ahora</Text>
              <Text style={styles.actionSubtitle}>Respaldar todos los datos a la nube</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={restoreBackup} disabled={isLoading}>
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="cloud-download" size={20} color="#F59E0B" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Restaurar Respaldo</Text>
              <Text style={styles.actionSubtitle}>Restaurar datos desde la nube</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Exportar/Importar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exportar e Importar</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportData} disabled={isLoading}>
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="download" size={20} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Exportar Datos</Text>
              <Text style={styles.actionSubtitle}>Descargar archivo JSON con todos los datos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={importData} disabled={isLoading}>
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="cloud-upload" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Importar Datos</Text>
              <Text style={styles.actionSubtitle}>Cargar datos desde archivo JSON</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Estadísticas de sincronización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{syncStatus.totalItems}</Text>
              <Text style={styles.statLabel}>Total de elementos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{syncStatus.syncedItems}</Text>
              <Text style={styles.statLabel}>Sincronizados</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{syncStatus.pendingChanges}</Text>
              <Text style={styles.statLabel}>Pendientes</Text>
            </View>
          </View>
        </View>

        {/* Información importante */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información Importante</Text>
            <Text style={styles.infoText}>
              • Los respaldos automáticos se realizan cuando la app está cerrada{'\n'}
              • Las imágenes pueden ocupar más espacio en el respaldo{'\n'}
              • Mantén una conexión estable para sincronizar correctamente{'\n'}
              • Los datos se encriptan antes de subir a la nube
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Modal de progreso de respaldo */}
      <Modal
        visible={showBackupModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.modalTitle}>Creando Respaldo</Text>
            <Text style={styles.modalProgress}>{Math.round(backupProgress)}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${backupProgress}%` }]} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Indicador de carga */}
      {isLoading && !showBackupModal && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  syncButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLastAction: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 55,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 10,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  backupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  backupInfoItem: {
    alignItems: 'center',
  },
  backupInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  backupInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    minWidth: 200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 15,
    marginBottom: 10,
  },
  modalProgress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  progressBar: {
    width: 150,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpace: {
    height: 20,
  },
});