// src/services/productsService.js
import { supabase } from '../lib/supabase';

export class ProductsService {
  
  // Obtener todos los productos del usuario
  static async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformar datos de snake_case a camelCase
      const products = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock_quantity,
        image: product.image_url,
        category: product.category,
        isActive: product.is_active,
        createdAt: new Date(product.created_at),
      }));

      return { success: true, products };
    } catch (error: any) {
      console.error('Error obteniendo productos:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear nuevo producto
  static async createProduct(productData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            user_id: user.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            cost: productData.cost,
            stock_quantity: productData.stock,
            category: productData.category,
            image_url: productData.image,
            is_active: true,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Transformar respuesta
      const product = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        stock: data.stock_quantity,
        image: data.image_url,
        category: data.category,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };

      return { success: true, product };
    } catch (error: any) {
      console.error('Error creando producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar producto
  static async updateProduct(productId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          cost: updates.cost,
          stock_quantity: updates.stock,
          category: updates.category,
          image_url: updates.image,
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Transformar respuesta
      const product = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        cost: data.cost,
        stock: data.stock_quantity,
        image: data.image_url,
        category: data.category,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };

      return { success: true, product };
    } catch (error: any) {
      console.error('Error actualizando producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar producto (soft delete)
  static async deleteProduct(productId: string) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando producto:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar productos
  static async searchProducts(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock_quantity,
        image: product.image_url,
        category: product.category,
        isActive: product.is_active,
        createdAt: new Date(product.created_at),
      }));

      return { success: true, products };
    } catch (error: any) {
      console.error('Error buscando productos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener productos por categoría
  static async getProductsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        cost: product.cost,
        stock: product.stock_quantity,
        image: product.image_url,
        category: product.category,
        isActive: product.is_active,
        createdAt: new Date(product.created_at),
      }));

      return { success: true, products };
    } catch (error: any) {
      console.error('Error obteniendo productos por categoría:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de productos
  static async getProductsStats() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity, price, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        totalProducts: data.length,
        totalValue: data.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
        lowStockProducts: data.filter(p => p.stock_quantity < 5).length,
        outOfStock: data.filter(p => p.stock_quantity === 0).length,
      };

      return { success: true, stats };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return { success: false, error: error.message};
    }
  }

  // Subir imagen a Supabase Storage
  static async uploadImage(imageUri: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Generar nombre único para el archivo
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Para React Native, necesitamos convertir la URI a un blob/archivo
      // Verificar si es una URI local o remota
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        // Es un archivo local - necesitamos usar fetch para convertirlo
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) {
          // Si el bucket no existe, usar URI local como fallback
          if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
            console.warn('Supabase Storage bucket no encontrado, usando URI local');
            return { success: true, imageUrl: imageUri };
          }
          throw error;
        }

        // Obtener URL pública de la imagen
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return { success: true, imageUrl: publicUrlData.publicUrl };
      } else {
        // Es una URL remota, retornarla directamente
        return { success: true, imageUrl: imageUri };
      }
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      // En caso de error, usar la URI local como fallback
      return { success: true, imageUrl: imageUri };
    }
  }
}