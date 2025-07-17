import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
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

export default function UserProfile() {
  const [userProfile, setUserProfile] = useState({
    // Información personal
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@ejemplo.com',
    phone: '+503 7123-4567',
    birthDate: '1990-05-15',
    address: 'San Salvador, El Salvador',
    avatar: null,
    
    // Información profesional
    occupation: 'Emprendedor Digital',
    experience: '2 años',
    businessGoal: 'Expandir mi negocio online',
    
    // Configuraciones de la app
    notifications: {
      orderAlerts: true,
      stockAlerts: true,
      salesReports: true,
      marketing: false,
    },
    
    // Preferencias
    theme: 'light', // light, dark, auto
    language: 'es',
    currency: 'USD',
    timezone: 'America/El_Salvador',
    
    // Configuración de privacidad
    profileVisible: true,
    shareData: false,
    analytics: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal'); // personal, professional, settings, privacy

  // Cargar datos guardados al iniciar
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveUserProfile = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Aquí conectarías con Supabase para guardar en la nube
      // await supabase.from('user_profiles').upsert(userProfile);
      
      Alert.alert('Éxito', 'Perfil guardado correctamente');
    } catch (error) {
      console.error('Error saving user profile:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      updateField('avatar', result.assets[0].uri);
    }
  };

  const updateField = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNotification = (type, value) => {
    setUserProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

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

  const SectionButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.sectionButton, isActive && styles.sectionButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.sectionButtonText, isActive && styles.sectionButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const SettingRow = ({ icon, title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
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

  const renderPersonalSection = () => (
    <View style={styles.section}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {userProfile.avatar ? (
            <Image source={{ uri: userProfile.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarText}>Cambiar foto</Text>
      </View>

      <InputField
        label="Nombre"
        value={userProfile.firstName}
        onChangeText={(value) => updateField('firstName', value)}
        placeholder="Tu nombre"
      />

      <InputField
        label="Apellido"
        value={userProfile.lastName}
        onChangeText={(value) => updateField('lastName', value)}
        placeholder="Tu apellido"
      />

      <InputField
        label="Email"
        value={userProfile.email}
        onChangeText={(value) => updateField('email', value)}
        placeholder="tu@email.com"
        keyboardType="email-address"
      />

      <InputField
        label="Teléfono"
        value={userProfile.phone}
        onChangeText={(value) => updateField('phone', value)}
        placeholder="+503 7123-4567"
        keyboardType="phone-pad"
      />

      <InputField
        label="Fecha de nacimiento"
        value={userProfile.birthDate}
        onChangeText={(value) => updateField('birthDate', value)}
        placeholder="YYYY-MM-DD"
      />

      <InputField
        label="Dirección"
        value={userProfile.address}
        onChangeText={(value) => updateField('address', value)}
        placeholder="Tu dirección completa"
        multiline={true}
      />

      {/* Información calculada */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Información</Text>
        <Text style={styles.infoText}>Edad: {calculateAge(userProfile.birthDate)} años</Text>
        <Text style={styles.infoText}>Miembro desde: Enero 2024</Text>
      </View>
    </View>
  );

  const renderProfessionalSection = () => (
    <View style={styles.section}>
      <InputField
        label="Ocupación"
        value={userProfile.occupation}
        onChangeText={(value) => updateField('occupation', value)}
        placeholder="Ej: Emprendedor Digital"
      />

      <InputField
        label="Experiencia en ventas"
        value={userProfile.experience}
        onChangeText={(value) => updateField('experience', value)}
        placeholder="Ej: 2 años"
      />

      <InputField
        label="Meta de negocio"
        value={userProfile.businessGoal}
        onChangeText={(value) => updateField('businessGoal', value)}
        placeholder="¿Cuál es tu objetivo principal?"
        multiline={true}
      />

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Estadísticas</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>123</Text>
            <Text style={styles.statLabel}>Ventas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.subsectionTitle}>Notificaciones</Text>
      
      <SettingRow
        icon="notifications"
        title="Alertas de pedidos"
        subtitle="Notificar nuevos pedidos"
        value={userProfile.notifications.orderAlerts}
        onValueChange={(value) => updateNotification('orderAlerts', value)}
      />

      <SettingRow
        icon="warning"
        title="Alertas de stock"
        subtitle="Notificar stock bajo"
        value={userProfile.notifications.stockAlerts}
        onValueChange={(value) => updateNotification('stockAlerts', value)}
      />

      <SettingRow
        icon="bar-chart"
        title="Reportes de ventas"
        subtitle="Resúmenes semanales"
        value={userProfile.notifications.salesReports}
        onValueChange={(value) => updateNotification('salesReports', value)}
      />

      <SettingRow
        icon="megaphone"
        title="Marketing"
        subtitle="Consejos y promociones"
        value={userProfile.notifications.marketing}
        onValueChange={(value) => updateNotification('marketing', value)}
      />

      <Text style={styles.subsectionTitle}>Preferencias</Text>

      <SettingRow
        icon="color-palette"
        title="Tema"
        subtitle="Apariencia de la app"
        value={userProfile.theme === 'light' ? 'Claro' : userProfile.theme === 'dark' ? 'Oscuro' : 'Automático'}
        type="select"
      />

      <SettingRow
        icon="language"
        title="Idioma"
        subtitle="Idioma de la interfaz"
        value="Español"
        type="select"
      />

      <SettingRow
        icon="cash"
        title="Moneda"
        subtitle="Moneda predeterminada"
        value={userProfile.currency}
        type="select"
      />
    </View>
  );

  const renderPrivacySection = () => (
    <View style={styles.section}>
      <SettingRow
        icon="eye"
        title="Perfil visible"
        subtitle="Otros usuarios pueden ver tu perfil"
        value={userProfile.profileVisible}
        onValueChange={(value) => updateField('profileVisible', value)}
      />

      <SettingRow
        icon="share"
        title="Compartir datos"
        subtitle="Permitir análisis de uso"
        value={userProfile.shareData}
        onValueChange={(value) => updateField('shareData', value)}
      />

      <SettingRow
        icon="analytics"
        title="Analytics"
        subtitle="Mejorar la experiencia"
        value={userProfile.analytics}
        onValueChange={(value) => updateField('analytics', value)}
      />

      <View style={styles.privacyCard}>
        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
        <Text style={styles.privacyTitle}>Tu privacidad es importante</Text>
        <Text style={styles.privacyText}>
          Todos tus datos están encriptados y protegidos. Solo tú tienes acceso a tu información personal.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil del Usuario</Text>
        <TouchableOpacity 
          onPress={saveUserProfile}
          style={styles.saveButton}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navegación de secciones */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionNav}>
        <SectionButton
          title="Personal"
          isActive={activeSection === 'personal'}
          onPress={() => setActiveSection('personal')}
        />
        <SectionButton
          title="Profesional"
          isActive={activeSection === 'professional'}
          onPress={() => setActiveSection('professional')}
        />
        <SectionButton
          title="Configuración"
          isActive={activeSection === 'settings'}
          onPress={() => setActiveSection('settings')}
        />
        <SectionButton
          title="Privacidad"
          isActive={activeSection === 'privacy'}
          onPress={() => setActiveSection('privacy')}
        />
      </ScrollView>

      {/* Contenido de la sección activa */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeSection === 'personal' && renderPersonalSection()}
        {activeSection === 'professional' && renderProfessionalSection()}
        {activeSection === 'settings' && renderSettingsSection()}
        {activeSection === 'privacy' && renderPrivacySection()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
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
  sectionNav: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 50,
  },
  sectionButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 5,
  },
  sectionButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionButtonTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 14,
    color: '#6B7280',
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
  infoCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
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
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
    marginTop: 10,
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
    backgroundColor: '#EBF4FF',
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
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginTop: 10,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpace: {
    height: 20,
  },
});