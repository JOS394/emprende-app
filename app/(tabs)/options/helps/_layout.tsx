import { Stack } from 'expo-router';

export default function HelpLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Ayuda y tutoriales',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
    </Stack>  
  );
}