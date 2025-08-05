import { supabase } from '../lib/supabase';

export class ProfileService {
    
  static async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const profile = {
        id: user.id,
        email: user.email,
        firstName: data?.first_name || '',
        lastName: data?.last_name || '',
        businessName: data?.business_name || '',
        phone: data?.phone || '',
        avatarUrl: data?.avatar_url || '',
        occupation: data?.occupation || '',
        experience: data?.experience || '',
        businessGoal: data?.business_goal || '',
        address: data?.address || '',
        birthDate: data?.birth_date ? new Date(data.birth_date) : null,
        createdAt: data?.created_at ? new Date(data.created_at) : new Date(),
        updatedAt: data?.updated_at ? new Date(data.updated_at) : new Date(),
      };

      return { success: true, profile };
    } catch (error: any) {
      console.error('Error obteniendo perfil:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear o actualizar perfil
  static async updateProfile(profileData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          business_name: profileData.businessName,
          phone: profileData.phone,
          avatar_url: profileData.avatarUrl,
          occupation: profileData.occupation,
          experience: profileData.experience,
          business_goal: profileData.businessGoal,
          address: profileData.address,
          birth_date: profileData.birthDate,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, profile: data };
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas del usuario
  static async getUserStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener conteos
      const [productsResult, ordersResult, customersResult] = await Promise.all([
        supabase.from('products').select('id').eq('user_id', user.id).eq('is_active', true),
        supabase.from('orders').select('id, total_amount').eq('user_id', user.id),
        supabase.from('customers').select('id').eq('user_id', user.id)
      ]);

      const stats = {
        totalProducts: productsResult.data?.length || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalCustomers: customersResult.data?.length || 0,
        totalRevenue: ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      };

      return { success: true, stats };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // Subir avatar
  static async uploadAvatar(imageUri: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Por ahora retornamos la URI local
      // En producción implementarías Supabase Storage
      return { success: true, avatarUrl: imageUri };
    } catch (error: any) {
      console.error('Error subiendo avatar:', error);
      return { success: false, error: error.message };
    }
  }
}