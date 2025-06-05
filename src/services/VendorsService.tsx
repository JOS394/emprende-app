import db from '../database/database';

export const VendorsService = {
  // Obtener todos los proveedores
  getAll: () => {
    try {
      const result = db.getAllSync('SELECT * FROM proveedores ORDER BY fecha_creacion DESC');
      return result;
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      throw error;
    }
  },

  // Crear proveedor
  create: (vendor: any) => {
    try {
      const result = db.runSync(
        'INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)',
        [vendor.nombre, vendor.telefono, vendor.email, vendor.direccion]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando proveedor:', error);
      throw error;
    }
  },

  // Actualizar proveedor
  update: (id: number, vendor: any) => {
    try {
      const result = db.runSync(
        'UPDATE proveedores SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
        [vendor.nombre, vendor.telefono, vendor.email, vendor.direccion, id]
      );
      return result.changes;
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      throw error;
    }
  },

  // Eliminar proveedor
  delete: (id: number) => {
    try {
      const result = db.runSync('DELETE FROM proveedores WHERE id = ?', [id]);
      return result.changes;
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      throw error;
    }
  }
};