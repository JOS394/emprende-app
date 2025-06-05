import db from '../database/database';

export const ProductsService = {
  // Obtener todos los productos
  getAll: () => {
    try {
      const result = db.getAllSync(`
        SELECT p.*, pr.nombre as proveedor_nombre 
        FROM productos p 
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id 
        ORDER BY p.fecha_creacion DESC
      `);
      return result;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  // Crear producto
  create: (product: any) => {
    try {
      const result = db.runSync(
        'INSERT INTO productos (nombre, precio, stock, proveedor_id) VALUES (?, ?, ?, ?)',
        [product.nombre, product.precio, product.stock, product.proveedor_id]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  // Actualizar producto
  update: (id: number, product: any) => {
    try {
      const result = db.runSync(
        'UPDATE productos SET nombre = ?, precio = ?, stock = ?, proveedor_id = ? WHERE id = ?',
        [product.nombre, product.precio, product.stock, product.proveedor_id, id]
      );
      return result.changes;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  },

  // Eliminar producto
  delete: (id: number) => {
    try {
      const result = db.runSync('DELETE FROM productos WHERE id = ?', [id]);
      return result.changes;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  // Buscar productos
  search: (query: string) => {
    try {
      const result = db.getAllSync(`
        SELECT p.*, pr.nombre as proveedor_nombre 
        FROM productos p 
        LEFT JOIN proveedores pr ON p.proveedor_id = pr.id 
        WHERE p.nombre LIKE ? OR pr.nombre LIKE ?
      `, [`%${query}%`, `%${query}%`]);
      return result;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  }
};