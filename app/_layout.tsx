import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LoadingProvider } from '../src/contexts/LoadingContext';
import { initDatabase } from '../src/database/database';

export default function RootLayout() {
  useEffect(() => {
    try {
      initDatabase();
      console.log('Base de datos inicializada');
    } catch (error) {
      console.error('Error iniciando DB:', error);
    }
  }, []);

  return (
    <LoadingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </LoadingProvider>
  );
}