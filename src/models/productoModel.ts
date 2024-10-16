import { db } from '../database/database';

export interface Producto {
  product_id: number;
  nombre_producto: string;
  descripcion_producto: string;
  precio: number;
  categoria: string;
  stock: number;
  url_imagen: string;
  epoca?: string;
}

export class ProductoModel {
  // Obtener todos los productos
  static async obtenerTodos(): Promise<Producto[]> {
    const [rows] = await db.query('SELECT * FROM producto');
    return rows as Producto[];
  }

  // Crear un nuevo producto
  static async crearProducto(producto: Producto): Promise<void> {
    const { nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca } = producto;
    await db.query(
      'INSERT INTO producto (nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre_producto, descripcion_producto, precio, categoria, stock, url_imagen, epoca]
    );
  }
}
