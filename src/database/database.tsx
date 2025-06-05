import * as SQLite from 'expo-sqlite';

// Abrir/crear base de datos
const db = SQLite.openDatabaseSync('business_app.db');

// Inicializar tablas
export const initDatabase = () => {
  try {
    // Tabla de productos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        precio REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        proveedor_id INTEGER,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
      );
    `);
    console.log('Tabla productos creada');

    // Tabla de proveedores
    db.execSync(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla proveedores creada');

    // Tabla de empresa
    db.execSync(`
      CREATE TABLE IF NOT EXISTS empresa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        direccion TEXT
      );
    `);
    console.log('Tabla empresa creada');

    return true;
  } catch (error) {
    console.error('Error inicializando DB:', error);
    throw error;
  }
};

export default db;