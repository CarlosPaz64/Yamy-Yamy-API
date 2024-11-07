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

 // Reducir la cantidad de un producto específico en el carrito
 async decrementProductQuantityInCarrito(carrito_producto_id: number, cantidad: number): Promise<void> {
  // Obtener la cantidad actual del producto en el carrito
  const queryGetProduct = `
    SELECT cantidad, product_id
    FROM carrito_producto
    WHERE carrito_producto_id = ?
  `;
  const [rows] = await db.execute(queryGetProduct, [carrito_producto_id]);
  const productInfo = (rows as { cantidad: number; product_id: number }[])[0];

  if (!productInfo) {
    throw new Error('Producto no encontrado en el carrito');
  }

  const { cantidad: cantidadActual, product_id } = productInfo;

  if (cantidadActual <= cantidad) {
    // Si la cantidad a reducir es mayor o igual a la cantidad actual, eliminar el producto
    const queryDelete = `
      DELETE FROM carrito_producto
      WHERE carrito_producto_id = ?
    `;
    await db.execute(queryDelete, [carrito_producto_id]);

    // Restablecer el stock del producto
    const queryUpdateStock = `
      UPDATE producto
      SET stock = stock + ?
      WHERE product_id = ?
    `;
    await db.execute(queryUpdateStock, [cantidadActual, product_id]);
  } else {
    // Reducir la cantidad del producto en el carrito
    const queryUpdateQuantity = `
      UPDATE carrito_producto
      SET cantidad = cantidad - ?
      WHERE carrito_producto_id = ?
    `;
    await db.execute(queryUpdateQuantity, [cantidad, carrito_producto_id]);

    // Restablecer parcialmente el stock del producto
    const queryUpdateStockPartial = `
      UPDATE producto
      SET stock = stock + ?
      WHERE product_id = ?
    `;
    await db.execute(queryUpdateStockPartial, [cantidad, product_id]);
  }
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
