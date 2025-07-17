import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Clipboard,
    Dimensions,
    Linking,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const ShareAppScreen = () => {
  const [copied, setCopied] = useState(false);
  
  // URL de descarga y mensaje personalizado
  const appUrl = 'https://play.google.com/store/apps/details?id=com.emprendedoresapp';
  const shareMessage = `¡Descubre EmprendeApp! 🚀\n\nLa app perfecta para emprendedores que venden por redes sociales:\n✅ Controla tu inventario\n✅ Gestiona pedidos\n✅ Organiza clientes\n✅ Reportes de ventas\n\n¡Descárgala gratis!\n${appUrl}`;

  // Opciones de compartir con diferentes plataformas
  const shareOptions = [
    {
      id: 1,
      title: 'WhatsApp',
      subtitle: 'Comparte con contactos',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => shareToWhatsApp()
    },
    {
      id: 2,
      title: 'Facebook',
      subtitle: 'Publica en tu perfil',
      icon: 'logo-facebook',
      color: '#1877F2',
      action: () => shareToFacebook()
    },
    {
      id: 3,
      title: 'Instagram',
      subtitle: 'Comparte en Stories',
      icon: 'logo-instagram',
      color: '#E4405F',
      action: () => shareToInstagram()
    },
    {
      id: 4,
      title: 'Twitter',
      subtitle: 'Tuitea sobre la app',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      action: () => shareToTwitter()
    },
    {
      id: 5,
      title: 'Email',
      subtitle: 'Envía por correo',
      icon: 'mail-outline',
      color: '#3B82F6',
      action: () => shareViaEmail()
    },
    {
      id: 6,
      title: 'SMS',
      subtitle: 'Envía por mensaje',
      icon: 'chatbubble-outline',
      color: '#10B981',
      action: () => shareViaSMS()
    }
  ];

  // Beneficios para mostrar en la pantalla
  const benefits = [
    {
      icon: 'cube-outline',
      title: 'Inventario inteligente',
      description: 'Control total de productos y stock'
    },
    {
      icon: 'receipt-outline',
      title: 'Gestión de pedidos',
      description: 'Del pedido a la entrega sin complicaciones'
    },
    {
      icon: 'people-outline',
      title: 'Base de clientes',
      description: 'Historial y contactos organizados'
    },
    {
      icon: 'bar-chart-outline',
      title: 'Reportes claros',
      description: 'Conoce tus ventas y ganancias'
    }
  ];

  // Función para copiar enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset después de 2 segundos
      Alert.alert('¡Copiado!', 'El enlace se copió al portapapeles');
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el enlace');
    }
  };

  // Función nativa de compartir (funciona en cualquier plataforma)
  const shareNative = async () => {
    try {
      await Share.share({
        message: shareMessage,
        url: appUrl,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  // Compartir específico por WhatsApp
  const shareToWhatsApp = () => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp no está instalado');
      }
    });
  };

  // Compartir a Facebook
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    Linking.openURL(facebookUrl);
  };

  // Compartir a Instagram (abre la app)
  const shareToInstagram = () => {
    const instagramUrl = 'instagram://app';
    Linking.canOpenURL(instagramUrl).then((supported) => {
      if (supported) {
        Linking.openURL(instagramUrl);
        Alert.alert('Instagram', 'Comparte el enlace en tus Stories');
      } else {
        Alert.alert('Error', 'Instagram no está instalado');
      }
    });
  };

  // Compartir a Twitter
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(twitterUrl);
  };

  // Compartir por email
  const shareViaEmail = () => {
    const emailUrl = `mailto:?subject=Te recomiendo EmprendeApp&body=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(emailUrl);
  };

  // Compartir por SMS
  const shareViaSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    Linking.openURL(smsUrl);
  };

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
            <Text style={styles.headerTitle}>Compartir app</Text>
            <Text style={styles.headerSubtitle}>Ayuda a otros emprendedores</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="share" size={28} color="#93C5FD" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección principal con logo y descripción */}
        <View style={styles.mainSection}>
          <View style={styles.logoContainer}>
            <View style={styles.appLogo}>
              <Ionicons name="storefront" size={60} color="#3B82F6" />
            </View>
            <Text style={styles.appName}>EmprendeApp</Text>
            <Text style={styles.appDescription}>
              La app más simple para emprendedores que venden por redes sociales
            </Text>
          </View>

          {/* Beneficios en grid */}
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Ionicons name={benefit.icon} size={24} color="#3B82F6" />
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botón de compartir nativo */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareNative}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color="#FFF" />
          <Text style={styles.shareButtonText}>Compartir ahora</Text>
        </TouchableOpacity>

        {/* Opciones de compartir específicas */}
        <View style={styles.shareOptionsSection}>
          <Text style={styles.sectionTitle}>Compartir en:</Text>
          <View style={styles.shareOptionsGrid}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.shareOption}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <Text style={styles.shareOptionTitle}>{option.title}</Text>
                <Text style={styles.shareOptionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Copiar enlace */}
        <View style={styles.copySection}>
          <Text style={styles.sectionTitle}>O copia el enlace:</Text>
          <View style={styles.copyContainer}>
            <View style={styles.urlContainer}>
              <Text style={styles.urlText} numberOfLines={1}>
                {appUrl}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.copyButton, copied && styles.copiedButton]}
              onPress={copyToClipboard}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={copied ? "checkmark" : "copy-outline"} 
                size={20} 
                color={copied ? "#10B981" : "#6B7280"} 
              />
              <Text style={[styles.copyButtonText, copied && styles.copiedButtonText]}>
                {copied ? 'Copiado' : 'Copiar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estadísticas de impacto */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Tu impacto:</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>+5,000</Text>
              <Text style={styles.statLabel}>Emprendedores</Text>
              <Text style={styles.statLabel}>ya confían en nosotros</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Calificación</Text>
              <Text style={styles.statLabel}>en Play Store</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Soporte</Text>
              <Text style={styles.statLabel}>para usuarios</Text>
            </View>
          </View>
        </View>

        {/* Programa de referidos */}
        <View style={styles.referralSection}>
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.referralCard}
          >
            <Ionicons name="gift-outline" size={32} color="#FFF" />
            <Text style={styles.referralTitle}>¡Programa de referidos!</Text>
            <Text style={styles.referralDescription}>
              Por cada amigo que instale la app, ambos reciben 1 mes gratis de premium
            </Text>
            <TouchableOpacity
              style={styles.referralButton}
              onPress={() => Alert.alert('Próximamente', 'El programa de referidos estará disponible pronto')}
              activeOpacity={0.7}
            >
              <Text style={styles.referralButtonText}>Saber más</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    paddingTop: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  mainSection: {
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  benefitCard: {
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
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  shareButton: {
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
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareOptionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shareOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  shareOptionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  copySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  urlContainer: {
    flex: 1,
    paddingRight: 12,
  },
  urlText: {
    fontSize: 14,
    color: '#6B7280',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  copiedButton: {
    backgroundColor: '#D1FAE5',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  copiedButtonText: {
    color: '#10B981',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
    textAlign: 'center',
  },
  referralSection: {
    paddingHorizontal: 20,
  },
  referralCard: {
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  referralButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  referralButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShareAppScreen;