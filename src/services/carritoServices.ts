// src/services/carritoService.ts
import { carritoModel } from '../models/carritoModels';
import { carritoProductoModel } from '../models/carritoProductoModel';
import { ProductoModel } from '../models/productoModel';

class CarritoService {
  // Crear un carrito para el cliente
  async createCarritoForClient(client_id: number, token: string): Promise<number> {
    return await carritoModel.createCarrito(client_id, token);
  }

  // Añadir o actualizar un producto en el carrito
  async addOrUpdateProductInCarrito(carrito_id: number, product_id: number, cantidad: number): Promise<void> {
    const producto = await ProductoModel.getProductById(product_id);
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.stock < cantidad) throw new Error('Stock insuficiente');

    await carritoProductoModel.addOrUpdateProductInCarrito({ carrito_id, product_id, cantidad });
  }

  // Obtener el contenido de un carrito específico
  async getProductsInCarrito(carrito_id: number) {
    return await carritoProductoModel.getProductsByCarritoId(carrito_id);
  }

  // Eliminar un producto específico del carrito
  async removeProductFromCarrito(carrito_producto_id: number): Promise<void> {
    await carritoProductoModel.removeProductFromCarrito(carrito_producto_id);
  }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(carrito_id: number): Promise<void> {
    await carritoProductoModel.clearCarrito(carrito_id);
  }
}

export const carritoService = new CarritoService();
