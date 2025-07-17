import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const RateAppScreen = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Animación para las estrellas
  const scaleAnim = new Animated.Value(1);

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.emprendedoresapp';
  const appStoreUrl = 'https://apps.apple.com/app/emprendeapp/id123456789';

  // Mensajes personalizados según la calificación
  const getRatingMessage = (rating) => {
    switch (rating) {
      case 1:
        return {
          title: '¡Ouch! 😔',
          message: 'Lamentamos que no te guste la app. Tu feedback nos ayuda a mejorar.',
          color: '#EF4444'
        };
      case 2:
        return {
          title: 'Podemos mejorar 😐',
          message: 'Sabemos que podemos hacerlo mejor. Cuéntanos qué te gustaría cambiar.',
          color: '#F59E0B'
        };
      case 3:
        return {
          title: 'No está mal 🤔',
          message: 'Está bien, pero creemos que podemos sorprenderte más.',
          color: '#F59E0B'
        };
      case 4:
        return {
          title: '¡Nos gusta! 😊',
          message: 'Te gusta la app, pero ¿qué podríamos hacer para que sea perfecta?',
          color: '#10B981'
        };
      case 5:
        return {
          title: '¡Eres increíble! 🤩',
          message: '¡Gracias! Tu reseña en la tienda nos ayuda muchísimo.',
          color: '#10B981'
        };
      default:
        return {
          title: '¿Qué te parece la app?',
          message: 'Tu opinión es muy importante para nosotros',
          color: '#6B7280'
        };
    }
  };

  // Función para animar las estrellas
  const animateStars = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Manejar selección de calificación
  const handleRatingPress = (rating) => {
    setSelectedRating(rating);
    animateStars();
    
    // Mostrar feedback si la calificación es baja
    if (rating <= 3) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  };

  // Enviar calificación
  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      Alert.alert('Calificación requerida', 'Por favor selecciona una calificación');
      return;
    }

    // Simular envío de feedback
    setHasRated(true);
    
    // Si es 4 o 5 estrellas, dirigir a la tienda
    if (selectedRating >= 4) {
      setTimeout(() => {
        Alert.alert(
          '¡Gracias!',
          '¿Te gustaría dejar una reseña en la Play Store?',
          [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Sí, vamos', onPress: () => openStore() }
          ]
        );
      }, 1000);
    }
  };

  // Abrir tienda según la plataforma
  const openStore = () => {
    const url = Platform.OS === 'ios' ? appStoreUrl : playStoreUrl;
    Linking.openURL(url);
  };

  // Características destacadas
  const features = [
    {
      icon: 'checkmark-circle',
      title: 'Fácil de usar',
      description: 'Interfaz intuitiva para emprendedores'
    },
    {
      icon: 'flash',
      title: 'Rápido y eficiente',
      description: 'Optimizado para máximo rendimiento'
    },
    {
      icon: 'shield-checkmark',
      title: 'Datos seguros',
      description: 'Tu información siempre protegida'
    },
    {
      icon: 'headset',
      title: 'Soporte 24/7',
      description: 'Estamos aquí cuando nos necesites'
    }
  ];

  // Renderizar estrellas
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingPress(i)}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={i <= selectedRating ? 'star' : 'star-outline'}
              size={40}
              color={i <= selectedRating ? '#F59E0B' : '#D1D5DB'}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (hasRated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>¡Gracias!</Text>
              <Text style={styles.headerSubtitle}>Tu opinión nos ayuda a mejorar</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Pantalla de agradecimiento */}
        <View style={styles.thankYouContainer}>
          <View style={styles.thankYouIcon}>
            <Ionicons name="heart" size={60} color="#EF4444" />
          </View>
          <Text style={styles.thankYouTitle}>¡Muchísimas gracias!</Text>
          <Text style={styles.thankYouMessage}>
            Tu feedback es invaluable para nosotros. Seguiremos trabajando para hacer la mejor app para emprendedores.
          </Text>
          
          {selectedRating >= 4 && (
            <TouchableOpacity
              style={styles.storeButton}
              onPress={openStore}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={24} color="#FFF" />
              <Text style={styles.storeButtonText}>Calificar en Play Store</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => router.push('/share-app')}
            activeOpacity={0.7}
          >
            <Ionicons name="share" size={24} color="#3B82F6" />
            <Text style={styles.shareButtonText}>Compartir con amigos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ratingInfo = getRatingMessage(selectedRating);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Calificar app</Text>
            <Text style={styles.headerSubtitle}>Tu opinión es importante</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={28} color="#F59E0B" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección principal de calificación */}
        <View style={styles.ratingSection}>
          <View style={styles.appIcon}>
            <Ionicons name="storefront" size={50} color="#3B82F6" />
          </View>
          
          <Text style={styles.ratingTitle}>EmprendeApp</Text>
          <Text style={styles.ratingSubtitle}>
            ¿Qué te parece nuestra app?
          </Text>
          
          {/* Estrellas de calificación */}
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          {/* Mensaje dinámico según calificación */}
          {selectedRating > 0 && (
            <View style={styles.ratingMessageContainer}>
              <Text style={[styles.ratingMessageTitle, { color: ratingInfo.color }]}>
                {ratingInfo.title}
              </Text>
              <Text style={styles.ratingMessageText}>
                {ratingInfo.message}
              </Text>
            </View>
          )}
        </View>

        {/* Campo de feedback para calificaciones bajas */}
        {showFeedback && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>
              Cuéntanos más detalles:
            </Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              placeholder="¿Qué podríamos mejorar? Tu feedback es muy valioso..."
              placeholderTextColor="#9CA3AF"
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Características destacadas */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Lo que nos hace especiales:</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Ionicons name={feature.icon} size={24} color="#3B82F6" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botón de enviar calificación */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedRating === 0 && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitRating}
          activeOpacity={0.7}
          disabled={selectedRating === 0}
        >
          <Ionicons name="send" size={24} color="#FFF" />
          <Text style={styles.submitButtonText}>Enviar calificación</Text>
        </TouchableOpacity>

        {/* Estadísticas de otras calificaciones */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Lo que dicen otros usuarios:</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Promedio</Text>
              <View style={styles.statStars}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={12} color="#F59E0B" />
                ))}
              </View>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2,847</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
              <Text style={styles.statSubtext}>en Play Store</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>94%</Text>
              <Text style={styles.statLabel}>Satisfacción</Text>
              <Text style={styles.statSubtext}>de usuarios</Text>
            </View>
          </View>
        </View>

        {/* Testimonios rápidos */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>Testimonios recientes:</Text>
          
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.testimonialStars}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialAuthor}>María González</Text>
            </View>
            <Text style={styles.testimonialText}>
              "Perfecta para mi negocio de repostería. Muy fácil de usar y me ahorra mucho tiempo."
            </Text>
          </View>

          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.testimonialStars}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={14} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialAuthor}>Carlos Ramírez</Text>
            </View>
            <Text style={styles.testimonialText}>
              "Los reportes son increíbles. Ahora entiendo mejor mi negocio."
            </Text>
          </View>
        </View>
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
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 2,
  },
  headerIcon: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  ratingSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 25,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    marginHorizontal: 5,
    padding: 5,
  },
  ratingMessageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  ratingMessageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingMessageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  feedbackSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  feedbackInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  statStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  testimonialsSection: {
    paddingHorizontal: 20,
  },
  testimonialCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testimonialStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  testimonialText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Estilos para pantalla de agradecimiento
  thankYouContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  thankYouIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  thankYouTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  thankYouMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  storeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shareButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RateAppScreen;