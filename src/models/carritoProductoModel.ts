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

    // Verificar si el producto ya está en el carrito
    const queryCheck = `
      SELECT * FROM carrito_producto
      WHERE carrito_id = ? AND product_id = ?
    `;
    const [existingRows] = await db.execute(queryCheck, [carrito_id, product_id]);
    const existingProduct = (existingRows as CarritoProducto[])[0];

    if (existingProduct) {
      // Si el producto ya está en el carrito, incrementa la cantidad
      const queryUpdate = `
        UPDATE carrito_producto
        SET cantidad = cantidad + ?
        WHERE carrito_producto_id = ?
      `;
      await db.execute(queryUpdate, [cantidad, existingProduct.carrito_producto_id]);
    } else {
      // Si el producto no está en el carrito, añádelo como nueva entrada
      const queryInsert = `
        INSERT INTO carrito_producto (carrito_id, product_id, cantidad)
        VALUES (?, ?, ?)
      `;
      await db.execute(queryInsert, [carrito_id, product_id, cantidad]);
    }

    // Reducir el stock del producto en la tabla `producto`
    const queryUpdateStock = `
      UPDATE producto
      SET stock = stock - ?
      WHERE product_id = ? AND stock >= ?
    `;
    const [updateStockResult] = await db.execute(queryUpdateStock, [cantidad, product_id, cantidad]);

    // Verificar si la actualización de stock fue exitosa
    if ((updateStockResult as any).affectedRows === 0) {
      throw new Error('Stock insuficiente para este producto');
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
