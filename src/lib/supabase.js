// lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Configuración de tu proyecto Supabase
const supabaseUrl = 'https://bjmmboptbblaehwhvhox.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbW1ib3B0YmJsYWVod2h2aG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDc5MzYsImV4cCI6MjA2ODgyMzkzNn0.H2GM45Vv-GsG3k9HN_gMON_Y-XTKlrv2ugVib7-7uKM'; // Reemplaza con tu key

// Crear cliente de Supabase con AsyncStorage para persistencia
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Funciones auxiliares para debugging
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.message.includes('relation "_test" does not exist')) {
      console.log('✅ Conexión a Supabase exitosa');
      return true;
    }
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return user !== null;
};