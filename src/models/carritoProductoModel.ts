// src/models/CarritoProductoModel.ts
import { db } from '../database/database';

export interface CarritoProducto {
  carrito_producto_id?: number;
  carrito_id: number;
  product_id: number;
  cantidad: number;
}

class CarritoProductoModel {
  // Añadir o incrementar un producto en el carrito
  async addOrUpdateProductInCarrito(carritoProducto: CarritoProducto): Promise<void> {
    const { carrito_id, product_id, cantidad } = carritoProducto;

    const queryCheck = `
      SELECT * FROM carrito_producto
      WHERE carrito_id = ? AND product_id = ?
    `;
    const [existingRows] = await db.execute(queryCheck, [carrito_id, product_id]);
    const existingProduct = (existingRows as CarritoProducto[])[0];

    if (existingProduct) {
      const queryUpdate = `
        UPDATE carrito_producto
        SET cantidad = cantidad + ?
        WHERE carrito_producto_id = ?
      `;
      await db.execute(queryUpdate, [cantidad, existingProduct.carrito_producto_id]);
    } else {
      const queryInsert = `
        INSERT INTO carrito_producto (carrito_id, product_id, cantidad)
        VALUES (?, ?, ?)
      `;
      await db.execute(queryInsert, [carrito_id, product_id, cantidad]);
    }
  }

  // Obtener productos en un carrito específico
  async getProductsByCarritoId(carrito_id: number): Promise<CarritoProducto[]> {
    const query = `
      SELECT * FROM carrito_producto
      WHERE carrito_id = ?
    `;
    const [rows] = await db.execute(query, [carrito_id]);
    return rows as CarritoProducto[];
  }

  // Eliminar un producto específico del carrito
  async removeProductFromCarrito(carrito_producto_id: number): Promise<void> {
    const query = `
      DELETE FROM carrito_producto
      WHERE carrito_producto_id = ?
    `;
    await db.execute(query, [carrito_producto_id]);
  }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(carrito_id: number): Promise<void> {
    const query = `
      DELETE FROM carrito_producto
      WHERE carrito_id = ?
    `;
    await db.execute(query, [carrito_id]);
  }
}

export const carritoProductoModel = new CarritoProductoModel();
