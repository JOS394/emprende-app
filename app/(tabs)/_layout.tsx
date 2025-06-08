import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useLoading } from '../../src/contexts/LoadingContext';

export default function TabLayout() {
  const { showLoading, hideLoading } = useLoading();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'company') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'vendors') {
            iconName = focused ? 'business' : 'business-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
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
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Inicio',
          headerTitle: 'Business App - Inicio'
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Buscar',
          headerTitle: 'Buscar'
        }} 
      />
      <Tabs.Screen 
        name="company" 
        options={{ 
          title: 'Empresa',
          headerTitle: 'Mi Empresa'
        }} 
      />
      <Tabs.Screen 
        name="vendors" 
        options={{ 
          title: 'Proveedores',
          headerShown: false
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          headerTitle: 'Mi Perfil'
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Pedidos',
          headerShown: false
        }} 
      />
    </Tabs>
  );
}