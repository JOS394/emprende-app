import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phone: '',
  });
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, confirmPassword, businessName } = formData;

    if (!firstName.trim()) {
      Alert.alert('Oops', 'El nombre es requerido');
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert('Oops', 'El apellido es requerido');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Oops', 'El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Oops', 'El formato del email no es válido');
      return false;
    }

    if (!businessName.trim()) {
      Alert.alert('Oops', 'El nombre del negocio es requerido');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Oops', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Oops', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        phone: formData.phone,
      });

      if (result.success) {
        Alert.alert(
          '🎉 ¡Bienvenido!',
          'Tu cuenta ha sido creada exitosamente.',
          [
            {
              text: 'Continuar',
              onPress: () => router.replace('/login' as any)
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Error al crear la cuenta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardView} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header minimalista */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="#64748B" />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Ionicons name="rocket-outline" size={28} color="#3B82F6" />
                  </View>
                </View>
                <Text style={styles.title}>Crear cuenta</Text>
                <Text style={styles.subtitle}>Comienza tu viaje emprendedor</Text>
              </View>
            </View>

            {/* Formulario glassmorphism */}
            <View style={styles.formCard}>
              <View style={styles.cardContent}>
                
                {/* Información Personal */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Información personal</Text>
                  
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Nombre"
                          placeholderTextColor="#9CA3AF"
                          value={formData.firstName}
                          onChangeText={(value) => updateField('firstName', value)}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                    <View style={styles.halfInput}>
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Apellido"
                          placeholderTextColor="#9CA3AF"
                          value={formData.lastName}
                          onChangeText={(value) => updateField('lastName', value)}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9CA3AF"
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Teléfono (opcional)"
                      placeholderTextColor="#9CA3AF"
                      value={formData.phone}
                      onChangeText={(value) => updateField('phone', value)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Información del Negocio */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Tu negocio</Text>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="storefront-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre del negocio"
                      placeholderTextColor="#9CA3AF"
                      value={formData.businessName}
                      onChangeText={(value) => updateField('businessName', value)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Seguridad */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Seguridad</Text>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={formData.password}
                      onChangeText={(value) => updateField('password', value)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)} 
                      style={styles.toggleButton}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={formData.confirmPassword}
                      onChangeText={(value) => updateField('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={styles.toggleButton}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9CA3AF" 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Indicador de fortaleza minimalista */}
                  {formData.password.length > 0 && (
                    <View style={styles.passwordStrength}>
                      <View style={styles.strengthDots}>
                        <View style={[
                          styles.strengthDot, 
                          { backgroundColor: formData.password.length >= 1 ? '#EF4444' : '#E5E7EB' }
                        ]} />
                        <View style={[
                          styles.strengthDot, 
                          { backgroundColor: formData.password.length >= 6 ? '#F59E0B' : '#E5E7EB' }
                        ]} />
                        <View style={[
                          styles.strengthDot, 
                          { backgroundColor: formData.password.length >= 8 ? '#10B981' : '#E5E7EB' }
                        ]} />
                      </View>
                      <Text style={styles.strengthText}>
                        {formData.password.length < 6 ? 'Débil' : 
                         formData.password.length < 8 ? 'Media' : 'Fuerte'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Botón principal */}
                <TouchableOpacity
                  style={[styles.createButton, loading && styles.createButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.createButtonText}>Crear cuenta</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>

                {/* Términos */}
                <Text style={styles.termsText}>
                  Al continuar, aceptas los{' '}
                  <Text style={styles.termsLink}>Términos</Text> y{' '}
                  <Text style={styles.termsLink}>Privacidad</Text>
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login' as any)}>
                <Text style={styles.footerLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardContent: {
    padding: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '400',
  },
  toggleButton: {
    padding: 4,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  strengthDots: {
    flexDirection: 'row',
    gap: 6,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  termsText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: '#64748B',
  },
  footerLink: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
});