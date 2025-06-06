import { Platform } from 'react-native';
import { Order } from '../../src/models/Order';
import db from '../database/database';

// Datos mock para web
const mockOrders: Order[] = [
  {
    id: 1,
    date_order: new Date('2024-12-01'),
    date_start: new Date('2024-12-05'),
    date_end: new Date('2024-12-07'),
    vendor: 'Proveedor Demo',
    status: 'pending',
    content: 'Pedido de ejemplo para web',
    total: 1000
  }
];

export const OrdersService = {
  // Obtener todos los pedidos
  getAll: () => {
    if (Platform.OS === 'web') {
      return mockOrders;
    }

    try {
      const result = db.getAllSync(`
        SELECT * FROM orders 
        ORDER BY date_created DESC
      `);
      return result.map((order: any) => ({
        id: order.id,
        date_order: new Date(order.date_order),
        date_start: new Date(order.date_start),
        date_end: new Date(order.date_end),
        vendor: order.vendor_id, // Mapear vendor_id a vendor
        status: order.status,
        content: order.content,
        total: order.total
      }));
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      throw error;
    }
  },

  // Crear pedido
  create: (order: Omit<Order, 'id'>) => {
    if (Platform.OS === 'web') {
      const newId = mockOrders.length + 1;
      mockOrders.push({ ...order, id: newId });
      return newId;
    }

    try {
      const result = db.runSync(`
        INSERT INTO orders (
          date_order, 
          date_start, 
          date_end, 
          vendor_id, 
          status, 
          content, 
          total
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        order.date_order.toISOString().split('T')[0],
        order.date_start.toISOString().split('T')[0],
        order.date_end.toISOString().split('T')[0],
        order.vendor, // Guardar como texto directamente
        order.status || 'pending',
        order.content,
        order.total || null
      ]);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  },

  // Actualizar estado del pedido
  updateStatus: (id: number, status: Order['status']) => {
    if (Platform.OS === 'web') {
      const index = mockOrders.findIndex(p => p.id === id);
      if (index !== -1) {
        mockOrders[index].status = status;
        return 1;
      }
      return 0;
    }

    try {
      const result = db.runSync(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.changes;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  },

  // Eliminar pedido
  delete: (id: number) => {
    if (Platform.OS === 'web') {
      const index = mockOrders.findIndex(p => p.id === id);
      if (index !== -1) {
        mockOrders.splice(index, 1);
        return 1;
      }
      return 0;
    }

    try {
      const result = db.runSync('DELETE FROM orders WHERE id = ?', [id]);
      return result.changes;
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      throw error;
    }
  },

  // Filtrar por estado
  getByStatus: (status: Order['status']) => {
    if (Platform.OS === 'web') {
      return mockOrders.filter(p => p.status === status);
    }

    try {
      const result = db.getAllSync(
        'SELECT * FROM orders WHERE status = ? ORDER BY date_created DESC',
        [status]
      );
      return result.map((order: any) => ({
        id: order.id,
        date_order: new Date(order.date_order),
        date_start: new Date(order.date_start),
        date_end: new Date(order.date_end),
        vendor: order.vendor_id,
        status: order.status,
        content: order.content,
        total: order.total
      }));
    } catch (error) {
      console.error('Error filtrando pedidos:', error);
      throw error;
    }
  }
};