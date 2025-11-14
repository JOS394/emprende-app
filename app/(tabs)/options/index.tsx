import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';



const MoreScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [userProfile, setUserProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    businessName: 'Mi Emprendimiento',
    avatar: null,
  });

  const [businessStats, setBusinessStats] = useState({
    totalProducts: 45,
    totalOrders: 123,
    monthlyRevenue: 2500,
  });

  // Simular carga de datos del usuario
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Aquí conectarías con Supabase para obtener datos reales
      const userData = await AsyncStorage.getItem('userProfile');
      if (userData) {
        setUserProfile(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const menuItems = [
    {
      id: 1,
      title: 'Configuración del negocio',
      subtitle: 'Información, horarios, contacto',
      icon: 'business-outline',
      color: '#3B82F6',
      screen: '/options/settingsBusiness',
    },
    {
      id: 2,
      title: 'Perfil del usuario',
      subtitle: 'Datos personales y configuración',
      icon: 'person-outline',
      color: '#10B981',
      screen: '/options/userProfile',
    },
    {
      id: 3,
      title: 'Notificaciones',
      subtitle: 'Alertas de stock, órdenes y pagos',
      icon: 'notifications-outline',
      color: '#EC4899',
      screen: '/options/notifications',
    },
    {
      id: 4,
      title: 'Reportes básicos',
      subtitle: 'Ventas, ganancias y estadísticas',
      icon: 'bar-chart-outline',
      color: '#F59E0B',
      screen: '/options/reports',
    },
    {
      id: 5,
      title: 'Proveedores',
      subtitle: 'Contactos y órdenes de compra',
      icon: 'people-outline',
      color: '#8B5CF6',
      screen: '/options/vendors',
    },
    {
      id: 6,
      title: 'Respaldo y sincronización',
      subtitle: 'Guardar datos en la nube',
      icon: 'cloud-upload-outline',
      color: '#06B6D4',
      screen: '/options/backupSync',
    },
    {
      id: 7,
      title: 'Ayuda y tutoriales',
      subtitle: 'Aprende a usar la app',
      icon: 'help-circle-outline',
      color: '#EF4444',
      screen: '/options/helps',
    },
  ];

  const handleMenuPress = (item: any) => {
    router.push(item.screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            // navigation.navigate('Login');
            router.replace('/auth/login' as any);
            console.log('Sesión cerrada');
          },
        },
      ]
    );
  };

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.surface }]}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? '#1F2937' : '#FFFFFF'} />

      {/* Header con gradiente */}
      <LinearGradient
        colors={isDarkMode ? ['#1F2937', '#374151'] : ['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <Text style={styles.businessName}>{userProfile.businessName}</Text>
            </View>
          </View>
          
          {/* Estadísticas rápidas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{businessStats.totalProducts}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{businessStats.totalOrders}</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>${businessStats.monthlyRevenue}</Text>
              <Text style={styles.statLabel}>Este mes</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menú principal */}
      <ScrollView style={[styles.menuContainer, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Configuración</Text>
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>

        {/* Acciones adicionales */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Otros</Text>

          {/* Toggle de Modo Oscuro */}
          <View style={[styles.menuItem, { backgroundColor: theme.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#FFB74D20' : '#9C27B020' }]}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny'}
                size={24}
                color={isDarkMode ? '#FFB74D' : '#9C27B0'}
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Modo oscuro</Text>
              <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                {isDarkMode ? 'Tema oscuro activado' : 'Tema claro activado'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E5E7EB', true: '#64B5F6' }}
              thumbColor={isDarkMode ? '#2196F3' : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/options/share')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="share-outline" size={24} color="#10B981" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Compartir app</Text>
              <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>Invita a otros emprendedores</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={() => router.push('/options/rating')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Calificar app</Text>
              <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>Ayúdanos con tu opinión</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: isDarkMode ? '#E5737320' : '#FEE2E2' }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Versión de la app */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>Versión 1.0.0</Text>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>Hecho con ❤️ para emprendedores</Text>
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
   
  },
  headerContent: {
    padding: 20,
    paddingTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 16,
    color: '#93C5FD',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#4B5563',
    marginHorizontal: 10,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
});

export default MoreScreen;