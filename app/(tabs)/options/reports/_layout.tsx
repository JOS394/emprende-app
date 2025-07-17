import { Stack } from 'expo-router';

export default function ReportsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Reportes',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
    </Stack>  
  );
}