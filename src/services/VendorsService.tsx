import { Platform } from 'react-native';
import db from '../database/database';

// Datos mock para web
const mockVendors = [
  {
    id: 1,
    name: 'Proveedor Demo',
    phone: '123-456-7890',
    email: 'demo@proveedor.com',
    address: 'Dirección demo'
  }
];

export const VendorsService = {
  // Obtener todos los proveedores
  getAll: () => {
    if (Platform.OS === 'web') {
      return mockVendors;
    }

    try {
      const result = db.getAllSync(`
        SELECT * FROM vendors 
        ORDER BY date_created DESC
      `);
      return result;
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      throw error;
    }
  },

  // Crear proveedor
  create: (vendor: any) => {
    if (Platform.OS === 'web') {
      const newId = mockVendors.length + 1;
      mockVendors.push({ ...vendor, id: newId });
      return newId;
    }

    try {
      const result = db.runSync(`
        INSERT INTO vendors (name, phone, email, address) 
        VALUES (?, ?, ?, ?)
      `, [
        vendor.name,
        vendor.phone,
        vendor.email,
        vendor.address
      ]);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando proveedor:', error);
      throw error;
    }
  },

  // Actualizar proveedor
  update: (id: number, vendor: any) => {
    if (Platform.OS === 'web') {
      const index = mockVendors.findIndex(v => v.id === id);
      if (index !== -1) {
        mockVendors[index] = { ...vendor, id };
        return 1;
      }
      return 0;
    }

    try {
      const result = db.runSync(`
        UPDATE vendors 
        SET name = ?, phone = ?, email = ?, address = ? 
        WHERE id = ?
      `, [
        vendor.name,
        vendor.phone, 
        vendor.email,
        vendor.address,
        id
      ]);
      return result.changes;
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      throw error;
    }
  },

  // Eliminar proveedor
  delete: (id: number) => {
    if (Platform.OS === 'web') {
      const index = mockVendors.findIndex(v => v.id === id);
      if (index !== -1) {
        mockVendors.splice(index, 1);
        return 1;
      }
      return 0;
    }

    try {
      const result = db.runSync('DELETE FROM vendors WHERE id = ?', [id]);
      return result.changes;
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      throw error;
    }
  },

  // Buscar proveedores
  search: (query: string) => {
    if (Platform.OS === 'web') {
      return mockVendors.filter(v => 
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const result = db.getAllSync(`
        SELECT * FROM vendors 
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY date_created DESC
      `, [`%${query}%`, `%${query}%`]);
      return result;
    } catch (error) {
      console.error('Error buscando proveedores:', error);
      throw error;
    }
  }
};