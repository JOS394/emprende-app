// services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export class AuthService {
  
  // Registrar nuevo usuario
  static async signUp(email: string, password: string, userData: any = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            business_name: userData.businessName || '',
          }
        }
      });

      if (error) throw error;

      // Si el registro es exitoso, crear perfil del usuario
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          business_name: userData.businessName || '',
          phone: userData.phone || '',
        });
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en registro:', error);
      let errorMessage = 'Ocurrió un error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      return { success: false, error: errorMessage };
    }
  }

  // Iniciar sesión
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Guardar datos básicos localmente
      await AsyncStorage.setItem('userEmail', email);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error en login:', error);
      let errorMessage = 'Ocurrió un error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      return { success: false, error: errorMessage };
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar datos locales
      await AsyncStorage.multiRemove([
        'userEmail',
        'userProfile',
        'businessConfig'
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      let errorMessage = 'Ocurrió un error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      return { success: false, error: errorMessage };
    }
  }

  // Crear perfil de usuario
  static async createUserProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            ...profileData,
          }
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creando perfil:', error);
      let errorMessage = 'Ocurrió un error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      return { success: false, error: errorMessage };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      let errorMessage = 'Ocurrió un error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as any).message;
      }
      return { success: false, error: errorMessage };
    }
  }
}