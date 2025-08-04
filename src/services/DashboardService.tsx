import { supabase } from '../lib/supabase';

export class DashboardService {
  
  // Obtener estadísticas del dashboard
  static async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Obtener órdenes de hoy
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .gte('created_at', startOfToday)
        .lte('created_at', endOfToday);

      if (ordersError) throw ordersError;

      // Órdenes pendientes
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Productos con stock bajo
      const { data: lowStockProducts, error: stockError } = await supabase
        .from('products')
        .select('id, stock_quantity, min_stock')
        .eq('is_active', true);

      if (stockError) throw stockError;

      // Total de productos activos
      const { data: totalProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Total de clientes
      const { data: totalClients, error: clientsError } = await supabase
        .from('customers')
        .select('id');

      if (clientsError) throw clientsError;

      // Calcular estadísticas
      const todaySales = todayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const lowStock = lowStockProducts?.filter(p => p.stock_quantity <= p.min_stock).length || 0;

      const stats = {
        todayOrders: todayOrders?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        todaySales: todaySales,
        lowStockProducts: lowStock,
        totalProducts: totalProducts?.length || 0,
        totalClients: totalClients?.length || 0,
      };

      return { success: true, stats };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener productos con stock bajo
  static async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock')
        .eq('is_active', true);

      if (error) throw error;

      const lowStockProducts = data.filter(product => 
        product.stock_quantity <= product.min_stock
      );

      return { success: true, products: lowStockProducts };
    } catch (error: any) {
      console.error('Error obteniendo productos con stock bajo:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener órdenes recientes
  static async getRecentOrders(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const orders = data.map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customers?.name || 'Sin cliente',
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: new Date(order.created_at),
      }));

      return { success: true, orders };
    } catch (error: any) {
      console.error('Error obteniendo órdenes recientes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener ventas de la semana
  static async getWeeklySales() {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'delivered')
        .gte('created_at', weekAgo.toISOString());

      if (error) throw error;

      // Agrupar por día
      const salesByDay: any = {};
      data.forEach(order => {
        const day = new Date(order.created_at).toLocaleDateString();
        salesByDay[day] = (salesByDay[day] || 0) + order.total_amount;
      });

      return { success: true, salesByDay };
    } catch (error: any) {
      console.error('Error obteniendo ventas semanales:', error);
      return { success: false, error: error.message };
    }
  }
}