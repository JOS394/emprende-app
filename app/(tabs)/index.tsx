import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRequireAuth } from '../../src/contexts/AuthContext';
import { useLoading } from '../../src/contexts/LoadingContext';
import { supabase } from '../../src/lib/supabase';

interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  todaySales: number;
  lowStockProducts: number;
  totalProducts: number;
  totalClients: number;
}

export default function HomeScreen() {
  const { user, loading } = useRequireAuth();
  const { showLoading, hideLoading } = useLoading();
  
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 8,
    pendingOrders: 3,
    todaySales: 125000,
    lowStockProducts: 5,
    totalProducts: 42,
    totalClients: 28,
  });

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  }, []);

  const handleNavigation = (screenName: string) => {
    showLoading();
    setTimeout(() => {
      router.push(`/${screenName}` as any);
      hideLoading();
    }, 300);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('test').select('*').limit(1);
        console.log('✅ Conexión exitosa:', !!supabase);
      } catch (err) {
        console.log('❌ Error:', err);
      }
    };
    testConnection();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header con saludo */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.businessName}>Mi Negocio</Text>
            <Text style={styles.date}>{getTodayDate()}</Text>
          </View>
          <Ionicons name="storefront" size={40} color="#2196F3" />
        </View>

        {/* Métricas principales */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
          
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.salesCard]}>
              <View style={styles.metricHeader}>
                <Ionicons name="cash" size={24} color="#4CAF50" />
                <Text style={styles.metricValue}>{formatCurrency(stats.todaySales)}</Text>
              </View>
              <Text style={styles.metricLabel}>Ventas de Hoy</Text>
            </View>

            <View style={[styles.metricCard, styles.ordersCard]}>
              <View style={styles.metricHeader}>
                <Ionicons name="receipt" size={24} color="#2196F3" />
                <Text style={styles.metricValue}>{stats.todayOrders}</Text>
              </View>
              <Text style={styles.metricLabel}>Pedidos Hoy</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, styles.pendingCard]}>
              <View style={styles.metricHeader}>
                <Ionicons name="time" size={24} color="#FF9800" />
                <Text style={styles.metricValue}>{stats.pendingOrders}</Text>
              </View>
              <Text style={styles.metricLabel}>Pendientes</Text>
            </View>

            <View style={[styles.metricCard, styles.stockCard]}>
              <View style={styles.metricHeader}>
                <Ionicons name="warning" size={24} color="#F44336" />
                <Text style={styles.metricValue}>{stats.lowStockProducts}</Text>
              </View>
              <Text style={styles.metricLabel}>Poco Stock</Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.newOrderAction]}
              onPress={() => handleNavigation('customerOrders')}
            >
              <Ionicons name="add-circle" size={32} color="#4CAF50" />
              <Text style={styles.actionTitle}>Nuevo Pedido</Text>
              <Text style={styles.actionSubtitle}>Registrar venta</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.addProductAction]}
              onPress={() => handleNavigation('products')}
            >
              <Ionicons name="cube" size={32} color="#2196F3" />
              <Text style={styles.actionTitle}>Productos</Text>
              <Text style={styles.actionSubtitle}>{stats.totalProducts} items</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.clientsAction]}
              onPress={() => handleNavigation('clients')}
            >
              <Ionicons name="people" size={32} color="#9C27B0" />
              <Text style={styles.actionTitle}>Clientes</Text>
              <Text style={styles.actionSubtitle}>{stats.totalClients} registrados</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.moreAction]}
              onPress={() => handleNavigation('more')}
            >
              <Ionicons name="grid" size={32} color="#607D8B" />
              <Text style={styles.actionTitle}>Más</Text>
              <Text style={styles.actionSubtitle}>Todas las opciones</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Alertas importantes */}
        {stats.lowStockProducts > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>Alertas</Text>
            
            <TouchableOpacity 
              style={styles.alertCard}
              onPress={() => handleNavigation('products')}
            >
              <View style={styles.alertIcon}>
                <Ionicons name="warning" size={24} color="#FF9800" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Stock Bajo</Text>
                <Text style={styles.alertText}>
                  {stats.lowStockProducts} productos necesitan reabastecimiento
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {stats.pendingOrders > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => handleNavigation('customerOrders')}
          >
            <View style={[styles.alertIcon, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="time" size={24} color="#2196F3" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pedidos Pendientes</Text>
              <Text style={styles.alertText}>
                Tienes {stats.pendingOrders} pedidos esperando confirmación
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {/* Información del negocio */}
        <View style={styles.businessInfoContainer}>
          <Text style={styles.sectionTitle}>Tu Negocio</Text>
          
          <View style={styles.businessCard}>
            <View style={styles.businessStats}>
              <View style={styles.businessStat}>
                <Text style={styles.businessStatNumber}>{stats.totalProducts}</Text>
                <Text style={styles.businessStatLabel}>Productos</Text>
              </View>
              <View style={styles.businessStat}>
                <Text style={styles.businessStatNumber}>{stats.totalClients}</Text>
                <Text style={styles.businessStatLabel}>Clientes</Text>
              </View>
              <View style={styles.businessStat}>
                <Text style={styles.businessStatNumber}>
                  {stats.todayOrders + 156}
                </Text>
                <Text style={styles.businessStatLabel}>Ventas Total</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsContainer: {
    marginBottom: 25,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  stockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActionsContainer: {
    marginBottom: 25,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newOrderAction: {
    borderTopWidth: 3,
    borderTopColor: '#4CAF50',
  },
  addProductAction: {
    borderTopWidth: 3,
    borderTopColor: '#2196F3',
  },
  clientsAction: {
    borderTopWidth: 3,
    borderTopColor: '#9C27B0',
  },
  moreAction: {
    borderTopWidth: 3,
    borderTopColor: '#607D8B',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertsContainer: {
    marginBottom: 25,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff3e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  businessInfoContainer: {
    marginBottom: 20,
  },
  businessCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  businessStat: {
    alignItems: 'center',
  },
  businessStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  businessStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});