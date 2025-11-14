import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { BusinessSettingsService, type BusinessHours } from '../../../../src/services/BusinessSettingsService';

const BusinessConfigScreen = () => {
  const [businessData, setBusinessData] = useState({    
    name: 'Mi Emprendimiento',
    description: 'Vendemos productos de calidad para toda la familia',
    phone: '+503 7123-4567',
    email: 'contacto@miemprendimiento.com',
    address: 'San Salvador, El Salvador',
    logo: null,
    whatsapp: '+503 7123-4567',
    facebook: '@miemprendimiento',
    instagram: '@miemprendimiento',
    // Horarios de atención
    schedule: {
      monday: { open: '08:00', close: '18:00', enabled: true },
      tuesday: { open: '08:00', close: '18:00', enabled: true },
      wednesday: { open: '08:00', close: '18:00', enabled: true },
      thursday: { open: '08:00', close: '18:00', enabled: true },
      friday: { open: '08:00', close: '18:00', enabled: true },
      saturday: { open: '09:00', close: '17:00', enabled: true },
      sunday: { open: '10:00', close: '16:00', enabled: false },
    },
    // Configuraciones adicionales
    autoBackup: true,
    notifications: true,
    currency: 'USD',
    language: 'es',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      const result = await BusinessSettingsService.getSettings();

      if (result.success && result.settings) {
        // Convertir del formato del servicio al formato del componente
        const hours = result.settings.hours as BusinessHours;
        setBusinessData({
          name: result.settings.business_name || 'Mi Emprendimiento',
          description: result.settings.description || '',
          phone: result.settings.phone || '',
          email: result.settings.email || '',
          address: result.settings.address || '',
          logo: result.settings.logo_url || null,
          whatsapp: result.settings.social_whatsapp || '',
          facebook: result.settings.social_facebook || '',
          instagram: result.settings.social_instagram || '',
          schedule: {
            monday: hours.Lunes || { open: '08:00', close: '18:00', enabled: true },
            tuesday: hours.Martes || { open: '08:00', close: '18:00', enabled: true },
            wednesday: hours.Miércoles || { open: '08:00', close: '18:00', enabled: true },
            thursday: hours.Jueves || { open: '08:00', close: '18:00', enabled: true },
            friday: hours.Viernes || { open: '08:00', close: '18:00', enabled: true },
            saturday: hours.Sábado || { open: '09:00', close: '17:00', enabled: true },
            sunday: hours.Domingo || { open: '10:00', close: '16:00', enabled: false },
          },
          autoBackup: result.settings.auto_backup ?? true,
          notifications: result.settings.notifications ?? true,
          currency: result.settings.currency || 'USD',
          language: 'es',
        });
      }
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBusinessData = async () => {
    try {
      setIsLoading(true);

      // Convertir del formato del componente al formato del servicio
      const settingsToSave = {
        business_name: businessData.name,
        phone: businessData.phone,
        email: businessData.email,
        address: businessData.address,
        description: businessData.description,
        logo_url: businessData.logo || '',
        social_whatsapp: businessData.whatsapp,
        social_facebook: businessData.facebook,
        social_instagram: businessData.instagram,
        hours: {
          Lunes: businessData.schedule.monday,
          Martes: businessData.schedule.tuesday,
          Miércoles: businessData.schedule.wednesday,
          Jueves: businessData.schedule.thursday,
          Viernes: businessData.schedule.friday,
          Sábado: businessData.schedule.saturday,
          Domingo: businessData.schedule.sunday,
        },
        currency: businessData.currency,
        auto_backup: businessData.autoBackup,
        notifications: businessData.notifications,
      };

      const result = await BusinessSettingsService.updateSettings(settingsToSave);

      if (result.success) {
        Alert.alert('Éxito', 'Configuración guardada correctamente en la nube');
      } else {
        Alert.alert('Advertencia', 'Configuración guardada localmente. Sincronizará cuando haya conexión.');
      }
    } catch (error) {
      console.error('Error saving business data:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Pedir permisos para acceder a la galería
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    // Abrir selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Imagen cuadrada
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;

      // Subir imagen a Supabase Storage
      setIsLoading(true);
      const uploadResult = await BusinessSettingsService.uploadLogo(imageUri);
      setIsLoading(false);

      if (uploadResult.success) {
        setBusinessData(prev => ({
          ...prev,
          logo: uploadResult.logoUrl || imageUri
        }));

        Alert.alert(
          'Logo actualizado',
          uploadResult.logoUrl?.includes('supabase')
            ? 'Logo subido a la nube correctamente'
            : 'Logo guardado localmente'
        );
      } else {
        // Fallback a URI local
        setBusinessData(prev => ({
          ...prev,
          logo: imageUri
        }));
      }
    }
  };

  const updateField = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSchedule = (day, field, value) => {
    setBusinessData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const days = [
    { key: 'monday', name: 'Lunes' },
    { key: 'tuesday', name: 'Martes' },
    { key: 'wednesday', name: 'Miércoles' },
    { key: 'thursday', name: 'Jueves' },
    { key: 'friday', name: 'Viernes' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' },
  ];

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración del Negocio</Text>
        <TouchableOpacity 
          onPress={saveBusinessData}
          style={styles.saveButton}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          {/* Logo del negocio */}
          <View style={styles.logoSection}>
            <Text style={styles.inputLabel}>Logo del negocio</Text>
            <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
              {businessData.logo ? (
                <Image source={{ uri: businessData.logo }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#9CA3AF" />
                  <Text style={styles.logoPlaceholderText}>Agregar logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <InputField
            label="Nombre del negocio"
            value={businessData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Ej: Mi Emprendimiento"
          />

          <InputField
            label="Descripción"
            value={businessData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe brevemente tu negocio..."
            multiline={true}
          />

          <InputField
            label="Teléfono"
            value={businessData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="+503 7123-4567"
            keyboardType="phone-pad"
          />

          <InputField
            label="Email"
            value={businessData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="contacto@miemprendimiento.com"
            keyboardType="email-address"
          />

          <InputField
            label="Dirección"
            value={businessData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder="Ciudad, País"
          />
        </View>

        {/* Redes sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociales</Text>
          
          <InputField
            label="WhatsApp"
            value={businessData.whatsapp}
            onChangeText={(value) => updateField('whatsapp', value)}
            placeholder="+503 7123-4567"
            keyboardType="phone-pad"
          />

          <InputField
            label="Facebook"
            value={businessData.facebook}
            onChangeText={(value) => updateField('facebook', value)}
            placeholder="@miemprendimiento"
          />

          <InputField
            label="Instagram"
            value={businessData.instagram}
            onChangeText={(value) => updateField('instagram', value)}
            placeholder="@miemprendimiento"
          />
        </View>

        {/* Horarios de atención */}
        <View style={styles.sectionTimes}>
          <Text style={styles.sectionTitle}>Horarios de Atención</Text>
          
          {days.map((day) => (
            <View key={day.key} style={styles.scheduleRow}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{day.name}</Text>
                <Switch
                  value={businessData.schedule[day.key].enabled}
                  onValueChange={(value) => updateSchedule(day.key, 'enabled', value)}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={businessData.schedule[day.key].enabled ? '#FFF' : '#FFF'}
                />
              </View>
              
              {businessData.schedule[day.key].enabled && (
                <View style={styles.timeInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={businessData.schedule[day.key].open}
                    onChangeText={(value) => updateSchedule(day.key, 'open', value)}
                    placeholder="08:00"
                    keyboardType="numeric"
                  />
                  <Text style={styles.timeSeparator}>a</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={businessData.schedule[day.key].close}
                    onChangeText={(value) => updateSchedule(day.key, 'close', value)}
                    placeholder="18:00"
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Configuraciones adicionales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuraciones</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Respaldo automático</Text>
              <Text style={styles.settingSubtitle}>Guardar datos en la nube</Text>
            </View>
            <Switch
              value={businessData.autoBackup}
              onValueChange={(value) => updateField('autoBackup', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={businessData.autoBackup ? '#FFF' : '#FFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notificaciones</Text>
              <Text style={styles.settingSubtitle}>Recordatorios y alertas</Text>
            </View>
            <Switch
              value={businessData.notifications}
              onValueChange={(value) => updateField('notifications', value)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={businessData.notifications ? '#FFF' : '#FFF'}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.inputLabel}>Moneda</Text>
            <View style={styles.currencyOptions}>
              {['USD', 'EUR', 'MXN'].map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyOption,
                    businessData.currency === currency && styles.currencyOptionSelected
                  ]}
                  onPress={() => updateField('currency', currency)}
                >
                  <Text style={[
                    styles.currencyText,
                    businessData.currency === currency && styles.currencyTextSelected
                  ]}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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
  sectionTimes: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 50,
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
    marginBottom: 20,
  },
  logoSection: {
    marginBottom: 20,
  },
  logoContainer: {
    alignSelf: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  scheduleRow: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    width: 80,
    backgroundColor: '#FFF',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  currencySection: {
    marginTop: 20,
  },
  currencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  currencyOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  currencyOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  currencyTextSelected: {
    color: '#3B82F6',
  },
  bottomSpace: {
    height: 20,
  },
});

export default BusinessConfigScreen;