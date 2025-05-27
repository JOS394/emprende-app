import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importamos nuestras pantallas
import HomeScreen from './index';
import ProfileScreen from './profile';
import SearchScreen from './search';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Esta función define los iconos para cada tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Decidimos qué icono mostrar según la pantalla
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Colores del tab bar
        tabBarActiveTintColor: '#007AFF', // Color cuando está seleccionado
        tabBarInactiveTintColor: 'gray',  // Color cuando no está seleccionado
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5,
        },
        // Estilo de las etiquetas
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // Ocultar el header principal ya que cada tab puede tener el suyo
        headerShown: false,
      })}
    >
      {/* Definimos cada tab con su pantalla correspondiente */}
      <Tab.Screen 
        name="index" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
          headerShown: true,
          headerTitle: 'Business App - Inicio'
        }}
      />
      <Tab.Screen 
        name="search" 
        component={SearchScreen}
        options={{
          title: 'Buscar',
          headerShown: true,
          headerTitle: 'Buscar'
        }}
      />
      <Tab.Screen 
        name="profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerShown: true,
          headerTitle: 'Mi Perfil'
        }}
      />
    </Tab.Navigator>
  );
}