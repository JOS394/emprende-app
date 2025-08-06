import { supabase } from '../lib/supabase';

export class CustomerOrdersService {

    // Obtener todas las órdenes del usuario
    static async getOrders() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
              *,
              customers (
                name,
                phone,
                email
              ),
              order_items (
                id,
                product_id,
                quantity,
                unit_price,
                total_price,
                products (
                  name,
                  image_url
                )
              )
            `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transformar datos de snake_case a camelCase
            const orders = data.map(order => ({
                id: order.id,
                orderNumber: order.order_number,
                customerId: order.customer_id,
                customerName: order.customers?.name || 'Sin cliente',
                customerPhone: order.customers?.phone || '',
                customerEmail: order.customers?.email || '',
                status: order.status,
                totalAmount: order.total_amount,
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                isPaid: order.payment_status === 'paid',
                deliveryAddress: order.delivery_address,
                deliveryDate: order.delivery_date ? new Date(order.delivery_date) : null,
                notes: order.notes,
                createdAt: order.created_at ? new Date(order.created_at) : new Date(),
                updatedAt: new Date(order.updated_at),
                items: order.order_items?.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    totalPrice: item.total_price,
                    productName: item.products?.name || 'Producto eliminado',
                    productImage: item.products?.image_url || null
                })) || []
            }));

            return { success: true, orders };
        } catch (error: any) {
            console.error('Error obteniendo órdenes:', error);
            return { success: false, error: error.message };
        }
    }

    // Crear nueva orden
    static async createOrder(orderData: any) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            // Generar número de orden único
            const orderNumber = await this.generateOrderNumber();

            // Crear la orden principal
            const { data: orderResult, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user.id,
                        customer_id: orderData.customerId,
                        order_number: orderNumber,
                        status: orderData.status || 'pending',
                        total_amount: orderData.totalAmount,
                        payment_method: orderData.paymentMethod,
                        payment_status: orderData.paymentStatus || 'pending',
                        delivery_address: orderData.deliveryAddress,
                        delivery_date: orderData.deliveryDate,
                        notes: orderData.notes,
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // Crear los items de la orden
            if (orderData.items && orderData.items.length > 0) {
                const orderItems = orderData.items.map((item: any) => ({
                    order_id: orderResult.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    total_price: item.quantity * item.unitPrice
                }));

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;

                // Actualizar stock de productos
                for (const item of orderData.items) {
                    await this.updateProductStock(item.productId, -item.quantity);
                }
            }

            // Obtener la orden completa con items
            const completeOrder = await this.getOrderById(orderResult.id);

            return { success: true, order: completeOrder.order };
        } catch (error: any) {
            console.error('Error creando orden:', error);
            return { success: false, error: error.message };
        }
    }

    static async generateOrderNumber() {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = Date.now().toString().slice(-4);
        return `ORD-${dateStr}-${timeStr}`;
    }

    // Obtener orden por ID
    static async getOrderById(orderId: string) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              customers (
                name,
                phone,
                email
              ),
              order_items (
                id,
                product_id,
                quantity,
                unit_price,
                total_price,
                products (
                  name,
                  image_url
                )
              )
            `)
            .eq('id', orderId)
            .single();
    
          if (error) throw error;
    
          const order = {
            id: data.id,
            orderNumber: data.order_number,
            customerId: data.customer_id,
            customerName: data.customers?.name || 'Sin cliente',
            customerPhone: data.customers?.phone || '',
            customerEmail: data.customers?.email || '',
            status: data.status,
            totalAmount: data.total_amount,
            paymentMethod: data.payment_method,
            paymentStatus: data.payment_status,
            deliveryAddress: data.delivery_address,
            deliveryDate: data.delivery_date ? new Date(data.delivery_date) : null,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            items: data.order_items?.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
              productName: item.products?.name || 'Producto eliminado',
              productImage: item.products?.image_url || null
            })) || []
          };
    
          return { success: true, order };
        } catch (error: any) {
          console.error('Error obteniendo orden:', error);
          return { success: false, error: error.message };
        }
      }

      static async updateOrder(orderId: string, updates: any) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .update({
              customer_id: updates.customerId,
              status: updates.status,
              total_amount: updates.totalAmount,
              payment_method: updates.paymentMethod,
              payment_status: updates.paymentStatus,
              delivery_address: updates.deliveryAddress,
              delivery_date: updates.deliveryDate,
              notes: updates.notes,
            })
            .eq('id', orderId)
            .select()
            .single();
    
          if (error) throw error;
    
          // Obtener la orden completa actualizada
          const completeOrder = await this.getOrderById(orderId);
          
          return { success: true, order: completeOrder.order };
        } catch (error: any) {
          console.error('Error actualizando orden:', error);
          return { success: false, error: error.message };
        }
      }
    
      // Actualizar solo el estado de la orden
      static async updateOrderStatus(orderId: string, newStatus: string) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();
    
          if (error) throw error;
    
          return { success: true };
        } catch (error: any) {
          console.error('Error actualizando estado:', error);
          return { success: false, error: error.message };
        }
      }

    // Eliminar orden (soft delete)
    static async deleteOrder(orderId: string) {
    try {
        // Primero obtener los items para restaurar stock si está pendiente
        const orderResult = await this.getOrderById(orderId);
        if (orderResult.success && orderResult.order?.status === 'pending') {
        // Solo restaurar stock si la orden estaba pendiente
        for (const item of orderResult.order?.items || []) {
            await this.updateProductStock(item.productId, item.quantity);
        }
        }

        const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error cancelando orden:', error);
        return { success: false, error: error.message };
    }
    }

    static async searchOrders(searchTerm: string) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              customers (
                name,
                phone,
                email
              ),
              order_items (
                id,
                product_id,
                quantity,
                unit_price,
                total_price,
                products (
                  name,
                  image_url
                )
              )
            `)
            .or(`order_number.ilike.%${searchTerm}%,customers.name.ilike.%${searchTerm}%,customers.phone.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });
    
          if (error) throw error;
    
          const orders = data.map((order: any) => ({
            id: order.id,
            orderNumber: order.order_number,
            customerId: order.customer_id,
            customerName: order.customers?.name || 'Sin cliente',
            customerPhone: order.customers?.phone || '',
            customerEmail: order.customers?.email || '',
            status: order.status,
            totalAmount: order.total_amount,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            deliveryAddress: order.delivery_address,
            deliveryDate: order.delivery_date ? new Date(order.delivery_date) : null,
            notes: order.notes,
            createdAt: new Date(order.created_at),
            updatedAt: new Date(order.updated_at),
            items: order.order_items?.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price,
              productName: item.products?.name || 'Producto eliminado',
              productImage: item.products?.image_url || null
            })) || []
          }));
    
          return { success: true, orders };
        } catch (error: any) {
          console.error('Error buscando órdenes:', error);
          return { success: false, error: error.message };
        }
      }

    // Obtener órdenes por estado
    static async getOrdersStats() {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('status, total_amount, created_at, payment_status');
    
          if (error) throw error;
    
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
          const stats = {
            totalOrders: data.length,
            pendingOrders: data.filter(o => o.status === 'pending').length,
            confirmedOrders: data.filter(o => o.status === 'confirmed').length,
            deliveredOrders: data.filter(o => o.status === 'delivered').length,
            cancelledOrders: data.filter(o => o.status === 'cancelled').length,
            totalRevenue: data
              .filter(o => o.status === 'delivered')
              .reduce((sum, o) => sum + o.total_amount, 0),
            monthlyRevenue: data
              .filter(o => 
                o.status === 'delivered' && 
                new Date(o.created_at) >= startOfMonth
              )
              .reduce((sum, o) => sum + o.total_amount, 0),
            averageOrderValue: data.length > 0 
              ? data.reduce((sum, o) => sum + o.total_amount, 0) / data.length 
              : 0,
            paidOrders: data.filter(o => o.payment_status === 'paid').length,
            unpaidOrders: data.filter(o => o.payment_status === 'pending').length,
          };
    
          return { success: true, stats };
        } catch (error: any) {
          console.error('Error obteniendo estadísticas:', error);
          return { success: false, error: error.message };
        }
      }
    
      // Función auxiliar para actualizar stock de productos
      static async updateProductStock(productId: number, quantityChange: number) {
        try {
          // Obtener stock actual
          const { data: product, error: getError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productId)
            .single();
    
          if (getError) throw getError;
    
          // Actualizar stock
          const newStock = Math.max(0, product.stock_quantity + quantityChange);
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', productId);
    
          if (updateError) throw updateError;
    
          return { success: true };
        } catch (error: any) {
          console.error('Error actualizando stock:', error);
          return { success: false, error: error.message };
        }
      }
    
      // Obtener productos disponibles para crear órdenes
      static async getAvailableProducts() {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, price, stock_quantity, image_url')
            .eq('is_active', true)
            .gt('stock_quantity', 0)
            .order('name');
    
          if (error) throw error;
    
          const products = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock_quantity,
            image: product.image_url
          }));
    
          return { success: true, products };
        } catch (error: any) {
          console.error('Error obteniendo productos disponibles:', error);
          return { success: false, error: error.message };
        }
      }
    
      // Obtener clientes para asociar a órdenes
      static async getCustomers() {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('id, name, phone, email')
            .order('name');
    
          if (error) throw error;
    
          return { success: true, customers: data };
        } catch (error: any) {
          console.error('Error obteniendo clientes:', error);
          return { success: false, error: error.message };
        }
      }
}