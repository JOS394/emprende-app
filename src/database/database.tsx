import * as SQLite from 'expo-sqlite';

// Abrir/crear base de datos
const db = SQLite.openDatabaseSync('business_app.db');

// Inicializar tablas
export const initDatabase = () => {
  try {
    // Tabla de productos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        vendor_id INTEGER,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES vendors (id)
      );
    `);
    console.log('Tabla productos creada');

    // Tabla de proveedores
    db.execSync(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla proveedores creada');

    // Tabla de empresa
    db.execSync(`
      CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT
      );
    `);
    console.log('Tabla empresa creada');

    // Tabla de pedidos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_order DATE NOT NULL,
        date_start DATE NOT NULL,
        date_end DATE NOT NULL,
        vendor_id INTEGER,
        status TEXT DEFAULT 'pending',
        content TEXT NOT NULL,
        total REAL,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla pedidos creada');

    return true;
  } catch (error) {
    console.error('Error inicializando DB:', error);
    throw error;
  }
};

export default db;