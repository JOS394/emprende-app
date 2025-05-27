import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="home" size={32} color="#007AFF" />
          <Text style={styles.title}>¡Bienvenido a tu App!</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎉 ¡Funciona!</Text>
          <Text style={styles.cardText}>
            Has creado exitosamente tu primer Bottom Tab Navigation.
            Ahora puedes navegar entre las diferentes secciones de tu app.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>¿Qué puedes hacer ahora?</Text>
          <Text style={styles.infoText}>• Navegar entre tabs tocando los iconos de abajo</Text>
          <Text style={styles.infoText}>• Personalizar los iconos y colores</Text>
          <Text style={styles.infoText}>• Agregar más funcionalidades a cada pantalla</Text>
          <Text style={styles.infoText}>• Integrar con Supabase para datos reales</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    paddingLeft: 5,
  },
});