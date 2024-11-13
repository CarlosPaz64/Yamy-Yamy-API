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
      // Verificar el estado del carrito
      const carritoEstadoQuery = `
        SELECT estado_pago FROM carrito WHERE carrito_id = ?
      `;
      const [estadoRows] = await db.execute<RowDataPacket[]>(carritoEstadoQuery, [carrito_id]);
      const carritoEstado = estadoRows[0]?.estado_pago;

      if (carritoEstado !== 'Pendiente') {
        throw new Error('No se pueden agregar productos a un carrito finalizado.');
      }

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
        const queryInsert = `
          INSERT INTO carrito_producto (carrito_id, product_id, cantidad)
          VALUES (?, ?, ?)
        `;
        const [insertResult] = await db.execute<ResultSetHeader>(queryInsert, [carrito_id, product_id, cantidad]);
        carrito_producto_id = insertResult.insertId;
      }

      return { carrito_producto_id };
    } catch (error) {
      console.error('Error en addOrUpdateProductInCarrito:', error);
      throw new Error('Error al añadir o actualizar el producto en el carrito.');
    }
  }

  // Ajustar el stock al finalizar la compra
  async ajustarStockAlFinalizar(carrito_id: number): Promise<void> {
    try {
      const queryProductos = `
        SELECT cp.product_id, cp.cantidad, p.stock
        FROM carrito_producto cp
        INNER JOIN producto p ON cp.product_id = p.product_id
        WHERE cp.carrito_id = ?
      `;

      const [productos] = await db.execute<RowDataPacket[]>(queryProductos, [carrito_id]);

      for (const producto of productos) {
        if (producto.stock < producto.cantidad) {
          throw new Error(`Stock insuficiente para el producto con ID ${producto.product_id}`);
        }

        const queryUpdateStock = `
          UPDATE producto
          SET stock = stock - ?
          WHERE product_id = ?
        `;
        await db.execute<ResultSetHeader>(queryUpdateStock, [producto.cantidad, producto.product_id]);
      }
    } catch (error) {
      console.error('Error en ajustarStockAlFinalizar:', error);
      throw new Error('Error al ajustar el stock al finalizar la compra.');
    }
  }

  // Reducir la cantidad de un producto en el carrito
  async decrementProductQuantityInCarrito(carrito_producto_id: number, cantidad: number): Promise<void> {
    try {
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error('La cantidad debe ser un número entero positivo.');
      }

      const queryGetProduct = `
        SELECT cantidad, carrito_id
        FROM carrito_producto
        WHERE carrito_producto_id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(queryGetProduct, [carrito_producto_id]);
      const productInfo = rows[0] as { cantidad: number; carrito_id: number } | undefined;

      if (!productInfo) {
        throw new Error('Producto no encontrado en el carrito.');
      }

      const { cantidad: cantidadActual, carrito_id } = productInfo;

      // Verificar el estado del carrito
      const carritoEstadoQuery = `
        SELECT estado_pago FROM carrito WHERE carrito_id = ?
      `;
      const [estadoRows] = await db.execute<RowDataPacket[]>(carritoEstadoQuery, [carrito_id]);
      const carritoEstado = estadoRows[0]?.estado_pago;

      if (carritoEstado !== 'Pendiente') {
        throw new Error('No se pueden modificar productos de un carrito finalizado.');
      }

      if (cantidad > cantidadActual) {
        throw new Error('La cantidad a reducir excede la cantidad actual en el carrito.');
      }

      if (cantidadActual === cantidad) {
        const queryDelete = `
          DELETE FROM carrito_producto
          WHERE carrito_producto_id = ?
        `;
        await db.execute<ResultSetHeader>(queryDelete, [carrito_producto_id]);
      } else {
        const queryUpdateQuantity = `
          UPDATE carrito_producto
          SET cantidad = cantidad - ?
          WHERE carrito_producto_id = ? AND cantidad >= ?
        `;
        await db.execute<ResultSetHeader>(queryUpdateQuantity, [cantidad, carrito_producto_id, cantidad]);
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

  async calcularTotalCarrito(carrito_id: number): Promise<number> {
    const query = `
      SELECT SUM(p.precio * cp.cantidad) AS total
      FROM carrito_producto cp
      INNER JOIN producto p ON cp.product_id = p.product_id
      WHERE cp.carrito_id = ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [carrito_id]);
    const total = rows[0]?.total || 0; // Si no hay productos, el total es 0

    return Number(total); // Devuelve el total como un número
  }
}

export const carritoProductoModel = new CarritoProductoModel();
