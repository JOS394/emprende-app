import { supabase } from '../lib/supabase';

export class ReportsService {

  // Obtener datos de ventas para un período
  static async getSalesData(period: 'week' | 'month' | 'year') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const today = new Date();
      let startDate: Date;

      // Calcular fecha de inicio según el período
      if (period === 'week') {
        startDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      } else {
        // year - últimos 6 meses
        startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      }

      // Obtener órdenes del período
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calcular totales
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);

      // Calcular crecimiento (comparar con período anterior)
      const previousPeriodStart = new Date(startDate.getTime() - (startDate.getTime() - new Date(today.getTime() - 2 * (today.getTime() - startDate.getTime()))));
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString());

      const previousSales = previousOrders
        ?.filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total_amount, 0) || 0;

      const growth = previousSales > 0
        ? ((totalSales - previousSales) / previousSales) * 100
        : 0;

      // Agrupar ventas por período
      const salesByPeriod = this.groupSalesByPeriod(deliveredOrders, period);

      return {
        success: true,
        data: {
          total: totalSales,
          growth: Math.round(growth * 10) / 10,
          transactions: deliveredOrders.length,
          salesByPeriod
        }
      };
    } catch (error: any) {
      console.error('Error obteniendo datos de ventas:', error);
      return { success: false, error: error.message };
    }
  }

  // Agrupar ventas por día/semana/mes según el período
  private static groupSalesByPeriod(orders: any[], period: 'week' | 'month' | 'year') {
    const grouped: { [key: string]: number } = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      let key: string;

      if (period === 'week') {
        // Agrupar por día de la semana
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        key = dayNames[date.getDay()];
      } else if (period === 'month') {
        // Agrupar por semana del mes
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        key = `Sem ${weekOfMonth}`;
      } else {
        // Agrupar por mes
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        key = monthNames[date.getMonth()];
      }

      grouped[key] = (grouped[key] || 0) + order.total_amount;
    });

    return grouped;
  }

  // Obtener productos más vendidos
  static async getTopSellingProducts(limit: number = 5) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener items de órdenes agrupados por producto
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          total_price,
          products (
            name
          )
        `);

      if (error) throw error;

      // Agrupar por producto
      const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};

      data.forEach((item: any) => {
        const productId = item.product_id;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.products?.name || 'Producto eliminado',
            sales: 0,
            revenue: 0
          };
        }
        productSales[productId].sales += item.quantity;
        productSales[productId].revenue += item.total_price;
      });

      // Convertir a array y ordenar
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);

      return { success: true, products: topProducts };
    } catch (error: any) {
      console.error('Error obteniendo productos más vendidos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener productos con stock bajo
  static async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('name, stock_quantity, min_stock')
        .eq('is_active', true)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;

      const lowStock = data
        .filter(p => p.stock_quantity <= (p.min_stock || 5))
        .map(p => ({
          name: p.name,
          stock: p.stock_quantity
        }));

      return { success: true, products: lowStock };
    } catch (error: any) {
      console.error('Error obteniendo productos con stock bajo:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de clientes
  static async getCustomerStats() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, created_at, total_orders');

      if (error) throw error;

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const totalCustomers = data.length;
      const newCustomers = data.filter(c => new Date(c.created_at) >= startOfMonth).length;
      const returningCustomers = data.filter(c => c.total_orders > 1).length;

      return {
        success: true,
        stats: {
          total: totalCustomers,
          new: newCustomers,
          returning: returningCustomers
        }
      };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas de clientes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener mejores compradores
  static async getTopBuyers(limit: number = 3) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name, total_orders, total_spent')
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const topBuyers = data.map(c => ({
        name: c.name,
        orders: c.total_orders,
        total: c.total_spent
      }));

      return { success: true, customers: topBuyers };
    } catch (error: any) {
      console.error('Error obteniendo mejores compradores:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener datos para gráfico de ventas por categoría de producto
  static async getProductCategorySales() {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          products (
            category
          )
        `);

      if (error) throw error;

      // Agrupar por categoría
      const categorySales: { [key: string]: number } = {};

      data.forEach((item: any) => {
        const category = item.products?.category || 'Otros';
        categorySales[category] = (categorySales[category] || 0) + item.quantity;
      });

      return { success: true, data: categorySales };
    } catch (error: any) {
      console.error('Error obteniendo ventas por categoría:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener reporte completo
  static async getCompleteReport(period: 'week' | 'month' | 'year') {
    try {
      const [salesData, topProducts, lowStock, customerStats, topBuyers, categorySales] = await Promise.all([
        this.getSalesData(period),
        this.getTopSellingProducts(5),
        this.getLowStockProducts(),
        this.getCustomerStats(),
        this.getTopBuyers(3),
        this.getProductCategorySales()
      ]);

      return {
        success: true,
        report: {
          sales: salesData.data,
          products: {
            topSelling: topProducts.products || [],
            lowStock: lowStock.products || []
          },
          customers: {
            ...customerStats.stats,
            topBuyers: topBuyers.customers || []
          },
          categorySales: categorySales.data || {}
        }
      };
    } catch (error: any) {
      console.error('Error generando reporte completo:', error);
      return { success: false, error: error.message };
    }
  }
}
