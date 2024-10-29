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
  async addOrUpdateProductInCarrito(client_id: number, product_id: number, cantidad: number, token: string): Promise<void> {
    let carrito = await carritoModel.getCarritoByClientId(client_id);
    
    // Si el carrito no existe, lo creamos y obtenemos su carrito_id
    if (!carrito) {
      const carrito_id = await this.createCarritoForClient(client_id, token);
      carrito = { carrito_id, client_id, token };
    }

    const producto = await ProductoModel.getProductById(product_id);
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.stock < cantidad) throw new Error('Stock insuficiente');

    // Añadir o actualizar el producto en el carrito
    await carritoProductoModel.addOrUpdateProductInCarrito({
      carrito_id: carrito.carrito_id as number,
      product_id,
      cantidad,
    });
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
