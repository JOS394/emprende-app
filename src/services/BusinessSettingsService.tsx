import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface BusinessHours {
  [key: string]: {
    enabled: boolean;
    open: string;
    close: string;
  };
}

export interface BusinessSettings {
  id?: string;
  user_id?: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
  logo_url?: string;
  social_whatsapp?: string;
  social_facebook?: string;
  social_instagram?: string;
  hours: BusinessHours;
  currency: string;
  auto_backup: boolean;
  notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_HOURS: BusinessHours = {
  Lunes: { enabled: true, open: '09:00', close: '18:00' },
  Martes: { enabled: true, open: '09:00', close: '18:00' },
  Miércoles: { enabled: true, open: '09:00', close: '18:00' },
  Jueves: { enabled: true, open: '09:00', close: '18:00' },
  Viernes: { enabled: true, open: '09:00', close: '18:00' },
  Sábado: { enabled: false, open: '09:00', close: '14:00' },
  Domingo: { enabled: false, open: '09:00', close: '14:00' },
};

export class BusinessSettingsService {

  // Obtener configuración del negocio
  static async getSettings(): Promise<{ success: boolean; settings?: BusinessSettings; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Intentar obtener de Supabase primero
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Si no existe en Supabase, intentar obtener de AsyncStorage como fallback
        if (error.code === 'PGRST116') { // No rows returned
          logger.log('No hay configuración en Supabase, buscando en AsyncStorage...');
          const localSettings = await AsyncStorage.getItem('businessSettings');

          if (localSettings) {
            const settings = JSON.parse(localSettings);
            // Migrar a Supabase
            logger.log('Migrando configuración local a Supabase...');
            await this.createSettings(settings);
            return { success: true, settings };
          }

          // Si no hay datos en ningún lado, retornar configuración por defecto
          const defaultSettings: BusinessSettings = {
            business_name: '',
            phone: '',
            email: '',
            address: '',
            description: '',
            logo_url: '',
            social_whatsapp: '',
            social_facebook: '',
            social_instagram: '',
            hours: DEFAULT_HOURS,
            currency: 'USD',
            auto_backup: false,
            notifications: true,
          };

          return { success: true, settings: defaultSettings };
        }
        throw error;
      }

      // Parsear hours de JSON a objeto
      const settings: BusinessSettings = {
        ...data,
        hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours,
      };

      // Guardar también en AsyncStorage como caché
      await AsyncStorage.setItem('businessSettings', JSON.stringify(settings));

      return { success: true, settings };
    } catch (error: any) {
      logger.error('Error obteniendo configuración del negocio:', error);

      // Fallback a AsyncStorage si hay error de conexión
      try {
        const localSettings = await AsyncStorage.getItem('businessSettings');
        if (localSettings) {
          return { success: true, settings: JSON.parse(localSettings) };
        }
      } catch (localError) {
        logger.error('Error leyendo configuración local:', localError);
      }

      return { success: false, error: error.message };
    }
  }

  // Crear configuración del negocio
  static async createSettings(settings: BusinessSettings): Promise<{ success: boolean; settings?: BusinessSettings; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Preparar datos para Supabase
      const dataToInsert = {
        user_id: user.id,
        business_name: settings.business_name,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        description: settings.description || '',
        logo_url: settings.logo_url || '',
        social_whatsapp: settings.social_whatsapp || '',
        social_facebook: settings.social_facebook || '',
        social_instagram: settings.social_instagram || '',
        hours: JSON.stringify(settings.hours),
        currency: settings.currency || 'USD',
        auto_backup: settings.auto_backup || false,
        notifications: settings.notifications !== undefined ? settings.notifications : true,
      };

      const { data, error } = await supabase
        .from('business_settings')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      const savedSettings: BusinessSettings = {
        ...data,
        hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours,
      };

      // Guardar también en AsyncStorage
      await AsyncStorage.setItem('businessSettings', JSON.stringify(savedSettings));

      return { success: true, settings: savedSettings };
    } catch (error: any) {
      logger.error('Error creando configuración del negocio:', error);

      // Guardar en AsyncStorage como fallback
      try {
        await AsyncStorage.setItem('businessSettings', JSON.stringify(settings));
        logger.warn('Configuración guardada solo localmente');
      } catch (localError) {
        logger.error('Error guardando configuración local:', localError);
      }

      return { success: false, error: error.message };
    }
  }

  // Actualizar configuración del negocio
  static async updateSettings(settings: BusinessSettings): Promise<{ success: boolean; settings?: BusinessSettings; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Preparar datos para actualización
      const dataToUpdate = {
        business_name: settings.business_name,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        description: settings.description || '',
        logo_url: settings.logo_url || '',
        social_whatsapp: settings.social_whatsapp || '',
        social_facebook: settings.social_facebook || '',
        social_instagram: settings.social_instagram || '',
        hours: JSON.stringify(settings.hours),
        currency: settings.currency || 'USD',
        auto_backup: settings.auto_backup || false,
        notifications: settings.notifications !== undefined ? settings.notifications : true,
      };

      const { data, error } = await supabase
        .from('business_settings')
        .update(dataToUpdate)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        // Si no existe, crear
        if (error.code === 'PGRST116') {
          return await this.createSettings(settings);
        }
        throw error;
      }

      const updatedSettings: BusinessSettings = {
        ...data,
        hours: typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours,
      };

      // Actualizar AsyncStorage
      await AsyncStorage.setItem('businessSettings', JSON.stringify(updatedSettings));

      return { success: true, settings: updatedSettings };
    } catch (error: any) {
      logger.error('Error actualizando configuración del negocio:', error);

      // Guardar en AsyncStorage como fallback
      try {
        await AsyncStorage.setItem('businessSettings', JSON.stringify(settings));
        logger.warn('Configuración actualizada solo localmente');
      } catch (localError) {
        logger.error('Error actualizando configuración local:', localError);
      }

      return { success: false, error: error.message };
    }
  }

  // Subir logo del negocio a Supabase Storage
  static async uploadLogo(imageUri: string): Promise<{ success: boolean; logoUrl?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Generar nombre único para el archivo
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Verificar si es una URI local
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        // Convertir a blob
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
          .from('business-logos')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
            upsert: true // Permitir sobrescribir logo existente
          });

        if (error) {
          if (error.message.includes('Bucket not found')) {
            logger.warn('Supabase Storage bucket no encontrado, usando URI local');
            return { success: true, logoUrl: imageUri };
          }
          throw error;
        }

        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
          .from('business-logos')
          .getPublicUrl(fileName);

        return { success: true, logoUrl: publicUrlData.publicUrl };
      } else {
        // Es una URL remota
        return { success: true, logoUrl: imageUri };
      }
    } catch (error: any) {
      logger.error('Error subiendo logo:', error);
      return { success: true, logoUrl: imageUri }; // Fallback a URI local
    }
  }

  // Eliminar configuración (opcional, para testing)
  static async deleteSettings(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('business_settings')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Eliminar también de AsyncStorage
      await AsyncStorage.removeItem('businessSettings');

      return { success: true };
    } catch (error: any) {
      logger.error('Error eliminando configuración:', error);
      return { success: false, error: error.message };
    }
  }
}
