import { Loading } from '@/src/components/common/Loading';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useRequireAuth } from '../../src/contexts/AuthContext';
import { useLoading } from '../../src/contexts/LoadingContext';

export default function TabLayout() {
  const { showLoading, hideLoading } = useLoading();
  const { user, loading } = useRequireAuth();

  if (loading) return <Loading />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'products') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'customerOrder') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'options') {
            iconName = focused ? 'options' : 'options-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
      screenListeners={{
        tabPress: () => {
          showLoading();
          setTimeout(() => hideLoading(), 150);
        },
      }}
    >
      {/* Tab principal - Dashboard */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Inicio',
          headerTitle: 'Mi Negocio'
        }} 
      />
      
      {/* Core del negocio */}
      <Tabs.Screen 
        name="products" 
        options={{ 
          title: 'Productos',
          headerShown: false
        }} 
      />
      
      <Tabs.Screen 
        name="customerOrder" 
        options={{ 
          title: 'Pedidos',
          headerShown: false
        }} 
      />
      
      <Tabs.Screen 
        name="customers" 
        options={{ 
          title: 'Clientes',
          headerShown: false
        }} 
      />

      <Tabs.Screen 
        name="options" 
        options={{ 
          title: 'Opciones',
          headerShown: false
        }} 
      />
            
      {/* Ocultar las que no son core */}
      <Tabs.Screen 
        name="vendors" 
        options={{ 
          href: null, // Ocultar del tab bar
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          href: null, // Ocultar del tab bar
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          href: null, // Ocultar del tab bar
        }} 
      />
      <Tabs.Screen 
        name="company" 
        options={{ 
          href: null, // Ocultar del tab bar
        }} 
      />
    </Tabs>
  );
}