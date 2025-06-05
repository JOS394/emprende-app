import { Stack } from 'expo-router';

export default function VendorsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Proveedores',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <Stack.Screen 
        name="management" 
        options={{ 
          title: 'Gestión de Proveedores',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          title: 'Realizar Pedidos',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      {/* <Stack.Screen 
        name="history" 
        options={{ 
          title: 'Historial de Pedidos',
          headerStyle: { backgroundColor: '#FF9800' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      /> */}
    </Stack>
  );
}