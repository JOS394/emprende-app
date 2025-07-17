import { Stack } from 'expo-router';

export default function CustomerOrderLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Pedidos Clientes',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
    </Stack>
  );
}