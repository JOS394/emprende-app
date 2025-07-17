import { Stack } from 'expo-router';

export default function OptionsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Mis Opciones',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <Stack.Screen 
        name="settingsBusiness" 
        options={{ 
          title: 'Configuración de Negocio',
          headerShown: false
        }} 
      />

      <Stack.Screen 
        name="userProfile"
        options={{ 
          title: 'Perfil del usuario',
          headerShown: false
        }} 
      />

      <Stack.Screen 
        name="reports"
        options={{ 
          title: 'Reportes',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="vendors"
        options={{ 
          title: 'Proveedores',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="backupSync"
        options={{ 
          title: 'Respaldo y sincronización',
          headerShown: false
        }} 
      />

      <Stack.Screen 
        name="helps"
        options={{ 
          title: 'Ayuda y tutoriales',
          headerShown: false
        }} 
      />

      <Stack.Screen 
        name="share"
        options={{ 
          title: 'Compartir la app',
          headerShown: false
        }} 
      />

      <Stack.Screen 
        name="rating"
        options={{ 
          title: 'Calificar la app',
          headerShown: false
        }} 
      />
    </Stack>  
  );
}