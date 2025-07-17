import { Stack } from 'expo-router';

export default function VendorsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Proveedores',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <Stack.Screen 
        name="management" 
        options={{ 
          title: 'Gestión de Proveedores',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
    </Stack>
  );
}