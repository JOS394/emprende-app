import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const HelpScreen = () => {
  const [activeTab, setActiveTab] = useState('tutorials');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // 📚 CONCEPTO: Datos estructurados para tutoriales
  // Organizamos los tutoriales por categorías para facilitar la navegación
  const tutorials = [
    {
      id: 1,
      title: 'Primeros pasos',
      subtitle: 'Configura tu negocio',
      icon: 'play-circle-outline',
      duration: '3 min',
      color: '#3B82F6',
      lessons: [
        'Crear tu primer producto',
        'Configurar información del negocio',
        'Entender el dashboard principal'
      ]
    },
    {
      id: 2,
      title: 'Gestión de productos',
      subtitle: 'Inventario y catálogo',
      icon: 'cube-outline',
      duration: '5 min',
      color: '#10B981',
      lessons: [
        'Agregar productos con fotos',
        'Organizar por categorías',
        'Control de stock y precios'
      ]
    },
    {
      id: 3,
      title: 'Manejo de pedidos',
      subtitle: 'Del pedido a la entrega',
      icon: 'receipt-outline',
      duration: '4 min',
      color: '#F59E0B',
      lessons: [
        'Crear pedidos rápidamente',
        'Seguimiento de estados',
        'Gestión de pagos'
      ]
    },
    {
      id: 4,
      title: 'Clientes y ventas',
      subtitle: 'Construye relaciones',
      icon: 'people-outline',
      duration: '6 min',
      color: '#8B5CF6',
      lessons: [
        'Base de datos de clientes',
        'Historial de compras',
        'Comunicación efectiva'
      ]
    },
    {
      id: 5,
      title: 'Reportes y análisis',
      subtitle: 'Entiende tu negocio',
      icon: 'bar-chart-outline',
      duration: '7 min',
      color: '#EF4444',
      lessons: [
        'Interpretar reportes de ventas',
        'Análisis de productos top',
        'Proyecciones de crecimiento'
      ]
    },
    {
      id: 6,
      title: 'Marketing digital',
      subtitle: 'Promociona tus productos',
      icon: 'megaphone-outline',
      duration: '8 min',
      color: '#06B6D4',
      lessons: [
        'Compartir en redes sociales',
        'Crear catálogos atractivos',
        'Estrategias de WhatsApp Business'
      ]
    }
  ];

  // 📚 CONCEPTO: FAQs organizadas por categorías
  // Preguntas frecuentes agrupadas para mejor experiencia de usuario
  const faqData = [
    {
      id: 1,
      category: 'Inicio',
      question: '¿Cómo creo mi primer producto?',
      answer: 'Ve a la sección "Productos" y toca el botón "+". Completa el nombre, precio, y agrega una foto. El sistema automáticamente organizará tu inventario.'
    },
    {
      id: 2,
      category: 'Inicio',
      question: '¿Puedo usar la app sin internet?',
      answer: 'Sí, la app funciona offline. Cuando tengas internet, los datos se sincronizarán automáticamente con la nube.'
    },
    {
      id: 3,
      category: 'Productos',
      question: '¿Cómo organizo mis productos por categorías?',
      answer: 'Al crear o editar un producto, selecciona la categoría. Puedes crear categorías personalizadas en Configuración > Categorías.'
    },
    {
      id: 4,
      category: 'Productos',
      question: '¿Cuántas fotos puedo agregar por producto?',
      answer: 'Puedes agregar hasta 5 fotos por producto. La primera foto será la principal en tu catálogo.'
    },
    {
      id: 5,
      category: 'Pedidos',
      question: '¿Cómo marco un pedido como entregado?',
      answer: 'En la lista de pedidos, toca el pedido y cambia el estado a "Entregado". Esto actualizará automáticamente el inventario.'
    },
    {
      id: 6,
      category: 'Pedidos',
      question: '¿Puedo modificar un pedido después de crearlo?',
      answer: 'Sí, puedes modificar pedidos mientras estén en estado "Pendiente". Una vez marcados como "Entregado", no se pueden editar.'
    },
    {
      id: 7,
      category: 'Clientes',
      question: '¿Cómo veo el historial de compras de un cliente?',
      answer: 'En la sección "Clientes", toca el nombre del cliente. Verás todos sus pedidos ordenados por fecha.'
    },
    {
      id: 8,
      category: 'Reportes',
      question: '¿Qué significan las gráficas de ventas?',
      answer: 'Las gráficas muestran tendencias de ventas por día, semana o mes. Los colores indican diferentes métricas: azul para ventas, verde para ganancias.'
    },
    {
      id: 9,
      category: 'Técnico',
      question: '¿Mis datos están seguros?',
      answer: 'Sí, todos los datos se cifran y almacenan en servidores seguros. Además, hacemos respaldos automáticos cada 24 horas.'
    },
    {
      id: 10,
      category: 'Técnico',
      question: '¿Cómo contacto soporte técnico?',
      answer: 'Puedes contactarnos vía WhatsApp, email o desde esta misma sección. Respondemos en menos de 24 horas.'
    }
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'WhatsApp',
      subtitle: 'Respuesta rápida',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/50377310931?text=Hola, necesito ayuda con EmprendeApp')
    },
    {
      id: 2,
      title: 'Email',
      subtitle: 'Consultas detalladas',
      icon: 'mail-outline',
      color: '#3B82F6',
      action: () => Linking.openURL('mailto:soporte@emprendeapp.com?subject=Consulta sobre la EmprendeApp')
    },
    {
      id: 3,
      title: 'Video llamada',
      subtitle: 'Soporte personalizado',
      icon: 'videocam-outline',
      color: '#8B5CF6',
      action: () => Alert.alert('Programar llamada', 'Te contactaremos para agendar una sesión personalizada')
    }
  ];

  // 📚 CONCEPTO: Función para manejar expandir/contraer FAQs
  // Usamos el estado para controlar qué FAQ está expandida
  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // 📚 CONCEPTO: Función para manejar clic en tutorial
  const handleTutorialPress = (tutorial) => {
    Alert.alert(
      tutorial.title,
      `Tutorial: ${tutorial.subtitle}\nDuración: ${tutorial.duration}\n\nLecciones:\n${tutorial.lessons.map((lesson, index) => `${index + 1}. ${lesson}`).join('\n')}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver tutorial', onPress: () => console.log('Abriendo tutorial:', tutorial.title) }
      ]
    );
  };

  // 📚 CONCEPTO: Componente para las pestañas
  const TabButton = ({ title, tabKey, icon }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabKey && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabKey)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabKey ? '#3B82F6' : '#6B7280'} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabKey && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // 📚 CONCEPTO: Componente para tarjetas de tutorial
  const TutorialCard = ({ tutorial }) => (
    <TouchableOpacity
      style={styles.tutorialCard}
      onPress={() => handleTutorialPress(tutorial)}
      activeOpacity={0.7}
    >
      <View style={[styles.tutorialIcon, { backgroundColor: tutorial.color + '20' }]}>
        <Ionicons name={tutorial.icon} size={24} color={tutorial.color} />
      </View>
      <View style={styles.tutorialContent}>
        <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
        <Text style={styles.tutorialSubtitle}>{tutorial.subtitle}</Text>
        <View style={styles.tutorialMeta}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
          <View style={styles.lessonCount}>
            <Text style={styles.lessonCountText}>{tutorial.lessons.length} lecciones</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // 📚 CONCEPTO: Componente para preguntas frecuentes
  const FaqItem = ({ faq }) => (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFaq(faq.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqCategory}>
          <Text style={styles.faqCategoryText}>{faq.category}</Text>
        </View>
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        <Ionicons
          name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expandedFaq === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  // 📚 CONCEPTO: Componente para opciones de contacto
  const ContactOption = ({ option }) => (
    <TouchableOpacity
      style={styles.contactOption}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // 📚 CONCEPTO: Función para renderizar contenido según la pestaña activa
  const renderContent = () => {
    switch (activeTab) {
      case 'tutorials':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Tutoriales paso a paso</Text>
            <Text style={styles.contentSubtitle}>
              Aprende a usar todas las funciones de la app
            </Text>
            {tutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </View>
        );

      case 'faq':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Preguntas frecuentes</Text>
            <Text style={styles.contentSubtitle}>
              Encuentra respuestas rápidas a las dudas más comunes
            </Text>
            {faqData.map((faq) => (
              <FaqItem key={faq.id} faq={faq} />
            ))}
          </View>
        );

      case 'contact':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Contacta con nosotros</Text>
            <Text style={styles.contentSubtitle}>
              ¿No encuentras lo que buscas? Estamos aquí para ayudarte
            </Text>
            {contactOptions.map((option) => (
              <ContactOption key={option.id} option={option} />
            ))}
            
            <View style={styles.supportHours}>
              <Text style={styles.supportHoursTitle}>Horarios de atención:</Text>
              <Text style={styles.supportHoursText}>Lunes a Viernes: 8:00 AM - 6:00 PM</Text>
              <Text style={styles.supportHoursText}>Sábados: 9:00 AM - 2:00 PM</Text>
              <Text style={styles.supportHoursText}>Domingos: Solo emergencias</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      {/* 📚 CONCEPTO: Navegación por pestañas */}
      <View style={styles.tabContainer}>
        <TabButton 
          title="Tutoriales" 
          tabKey="tutorials" 
          icon="play-circle-outline" 
        />
        <TabButton 
          title="FAQ" 
          tabKey="faq" 
          icon="help-circle-outline" 
        />
        <TabButton 
          title="Contacto" 
          tabKey="contact" 
          icon="chatbubble-outline" 
        />
      </View>

      {/* 📚 CONCEPTO: Contenido dinámico según pestaña activa */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTabButton: {
    backgroundColor: '#EBF4FF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 5,
  },
  activeTabButtonText: {
    color: '#3B82F6',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 25,
    lineHeight: 24,
  },
  tutorialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tutorialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  tutorialSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 12,
  },
  lessonCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lessonCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  faqItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqCategory: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  faqCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  supportHours: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  supportHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  supportHoursText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default HelpScreen;