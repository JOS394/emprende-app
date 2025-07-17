import { Stack } from 'expo-router';

export default function SettingsBusinessLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Configuración de Negocio',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />

    </Stack>  
  );
}