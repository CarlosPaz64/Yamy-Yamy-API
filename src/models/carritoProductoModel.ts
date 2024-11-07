// src/models/CarritoProductoModel.ts
import { db } from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface CarritoProducto {
  carrito_producto_id: number;
  carrito_id: number;
  product_id: number;
  cantidad: number;
}

class CarritoProductoModel {
  // Añadir o incrementar un producto en el carrito
  async addOrUpdateProductInCarrito(carritoProducto: CarritoProducto): Promise<{ carrito_producto_id: number }> {
    const { carrito_id, product_id, cantidad } = carritoProducto;

    try {
      const queryCheck = `
        SELECT * FROM carrito_producto
        WHERE carrito_id = ? AND product_id = ?
      `;
      const [existingRows] = await db.execute<RowDataPacket[]>(queryCheck, [carrito_id, product_id]);
      const existingProduct = existingRows[0] as CarritoProducto | undefined;

      let carrito_producto_id: number;

      if (existingProduct) {
        const queryUpdate = `
          UPDATE carrito_producto
          SET cantidad = cantidad + ?
          WHERE carrito_producto_id = ?
        `;
        await db.execute<ResultSetHeader>(queryUpdate, [cantidad, existingProduct.carrito_producto_id]);
        carrito_producto_id = existingProduct.carrito_producto_id;
      } else {
        const stockCheckQuery = `
          SELECT stock FROM producto WHERE product_id = ? AND stock >= ?
        `;
        const [stockRows] = await db.execute<RowDataPacket[]>(stockCheckQuery, [product_id, cantidad]);
        if (stockRows.length === 0) {
          throw new Error('Stock insuficiente para este producto.');
        }

        const queryInsert = `
          INSERT INTO carrito_producto (carrito_id, product_id, cantidad)
          VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute<ResultSetHeader>(queryInsert, [carrito_id, product_id, cantidad]);
        carrito_producto_id = insertResult.insertId;
      }

      const queryUpdateStock = `
        UPDATE producto
        SET stock = stock - ?
        WHERE product_id = ?
      `;
      await db.execute<ResultSetHeader>(queryUpdateStock, [cantidad, product_id]);

      return { carrito_producto_id };
    } catch (error) {
      console.error('Error en addOrUpdateProductInCarrito:', error);
      throw new Error('Error al añadir o actualizar el producto en el carrito.');
    }
  }

  // Reducir la cantidad de un producto en el carrito
  async decrementProductQuantityInCarrito(carrito_producto_id: number, cantidad: number): Promise<void> {
    try {
      const queryGetProduct = `
        SELECT cantidad, product_id
        FROM carrito_producto
        WHERE carrito_producto_id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(queryGetProduct, [carrito_producto_id]);
      const productInfo = rows[0] as { cantidad: number; product_id: number } | undefined;

      if (!productInfo) {
        throw new Error('Producto no encontrado en el carrito.');
      }

      const { cantidad: cantidadActual, product_id } = productInfo;

      if (cantidadActual <= cantidad) {
        const queryDelete = `
          DELETE FROM carrito_producto
          WHERE carrito_producto_id = ?
        `;
        await db.execute<ResultSetHeader>(queryDelete, [carrito_producto_id]);

        const queryUpdateStock = `
          UPDATE producto
          SET stock = stock + ?
          WHERE product_id = ?
        `;
        await db.execute<ResultSetHeader>(queryUpdateStock, [cantidadActual, product_id]);
      } else {
        const queryUpdateQuantity = `
          UPDATE carrito_producto
          SET cantidad = cantidad - ?
          WHERE carrito_producto_id = ?
        `;
        await db.execute<ResultSetHeader>(queryUpdateQuantity, [cantidad, carrito_producto_id]);

        const queryUpdateStockPartial = `
          UPDATE producto
          SET stock = stock + ?
          WHERE product_id = ?
        `;
        await db.execute<ResultSetHeader>(queryUpdateStockPartial, [cantidad, product_id]);
      }
    } catch (error) {
      console.error('Error en decrementProductQuantityInCarrito:', error);
      throw new Error('Error al reducir la cantidad del producto en el carrito.');
    }
  }

  // Obtener productos en un carrito específico
  async getProductsByCarritoId(carrito_id: number): Promise<CarritoProducto[]> {
    const query = `
      SELECT * FROM carrito_producto
      WHERE carrito_id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [carrito_id]);
    return rows as CarritoProducto[];
  }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(carrito_id: number): Promise<void> {
    const query = `
      DELETE FROM carrito_producto
      WHERE carrito_id = ?
    `;
    await db.execute<ResultSetHeader>(query, [carrito_id]);
  }
}

export const carritoProductoModel = new CarritoProductoModel();
