import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack>
    <Stack.Screen 
      name="index" 
      options={{ 
        title: 'Pedidos',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' }
      }} 
    />
    <Stack.Screen 
      name="orders" 
      options={{ 
        title: 'Realizar Pedido',
        headerStyle: { backgroundColor: '#4CAF50' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' }
      }} 
    />
    <Stack.Screen 
      name="history" 
      options={{ 
        title: 'Historial de Pedidos',
        headerStyle: { backgroundColor: '#FF9800' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' }
      }} 
    />
  </Stack>
  );
}