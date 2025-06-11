import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrdersScreen() {
  const cards = [
    {
      title: 'Realizar Pedidos',
      description: 'Crear nuevos pedidos de productos',
      icon: 'document-text',
      color: '#2196F3',
      route: './orders/orders'
    },
    {
      title: 'Historial de Pedidos',
      description: 'Ver pedidos anteriores',
      icon: 'time',
      color: '#FF9800',
      route: './orders/history'
    }
  ];

  const handleCardPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gestión de Pedidos</Text>
        
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { borderLeftColor: card.color }]}
              onPress={() => handleCardPress(card.route)}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                  <Ionicons name={card.icon as any} size={30} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});