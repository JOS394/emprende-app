import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LoadingProvider } from '../src/contexts/LoadingContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
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
    <ThemeProvider>
      <LoadingProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </NotificationProvider>
        </AuthProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}