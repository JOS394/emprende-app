import { supabase } from '../lib/supabase';

export class CustomersService {
  
  // Obtener todos los clientes del usuario
  static async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const customers = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      }));

      return { success: true, customers };
    } catch (error: any) {
      console.error('Error obteniendo clientes:', error);
      return { success: false, error: error.message };
    }
  }

  // Crear nuevo cliente
  static async createCustomer(customerData: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            user_id: user.id,
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            notes: customerData.notes,
            total_orders: 0,
            total_spent: 0,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        totalOrders: data.total_orders,
        totalSpent: data.total_spent,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return { success: true, customer };
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar cliente
  static async updateCustomer(customerId: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          notes: updates.notes,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      const customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        totalOrders: data.total_orders,
        totalSpent: data.total_spent,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return { success: true, customer };
    } catch (error: any) {
      console.error('Error actualizando cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar cliente (no usado debido a foreign keys, mejor mantener el registro)
  static async deleteCustomer(customerId: number) {
    try {
      // En lugar de eliminar, marcamos como inactivo o simplemente informamos
      // que no se puede eliminar debido a órdenes asociadas
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', customerId)
        .limit(1);

      if (orders && orders.length > 0) {
        return { 
          success: false, 
          error: 'No se puede eliminar el cliente porque tiene órdenes asociadas' 
        };
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error eliminando cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar clientes
  static async searchCustomers(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const customers = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      }));

      return { success: true, customers };
    } catch (error: any) {
      console.error('Error buscando clientes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener cliente por ID con historial de órdenes
  static async getCustomerById(customerId: number) {
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      // Obtener órdenes del cliente
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          order_items (
            quantity,
            products (
              name
            )
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const customerData = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
        orderHistory: orders?.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          total: order.total_amount,
          status: order.status,
          date: new Date(order.created_at),
          products: order.order_items?.map((item: any) => 
            `${item.products?.name || 'Producto'} x${item.quantity}`
          ) || []
        })) || []
      };

      return { success: true, customer: customerData };
    } catch (error: any) {
      console.error('Error obteniendo cliente:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de clientes
  static async getCustomersStats() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('total_orders, total_spent, created_at');

      if (error) throw error;

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const stats = {
        totalCustomers: data.length,
        newCustomersThisMonth: data.filter(c => 
          new Date(c.created_at) >= startOfMonth
        ).length,
        newCustomersThisYear: data.filter(c => 
          new Date(c.created_at) >= startOfYear
        ).length,
        activeCustomers: data.filter(c => c.total_orders > 0).length,
        totalRevenue: data.reduce((sum, c) => sum + (c.total_spent || 0), 0),
        averageOrdersPerCustomer: data.length > 0 
          ? data.reduce((sum, c) => sum + (c.total_orders || 0), 0) / data.length 
          : 0,
        averageSpentPerCustomer: data.length > 0
          ? data.reduce((sum, c) => sum + (c.total_spent || 0), 0) / data.length
          : 0
      };

      return { success: true, stats };
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener mejores clientes (por total gastado)
  static async getTopCustomers(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const customers = data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
      }));

      return { success: true, customers };
    } catch (error: any) {
      console.error('Error obteniendo mejores clientes:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener clientes que no han comprado recientemente
  static async getInactiveCustomers(daysSince = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysSince);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .lt('updated_at', cutoffDate.toISOString())
        .gt('total_orders', 0)
        .order('updated_at', { ascending: true });

      if (error) throw error;

      const customers = data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        totalOrders: customer.total_orders,
        totalSpent: customer.total_spent,
        lastActivity: new Date(customer.updated_at),
      }));

      return { success: true, customers };
    } catch (error: any) {
      console.error('Error obteniendo clientes inactivos:', error);
      return { success: false, error: error.message };
    }
  }
}