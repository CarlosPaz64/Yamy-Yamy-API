import CarritoModel from '../models/carritoModels';
import { carritoProductoModel, CarritoProducto } from '../models/carritoProductoModel';
import { ProductoModel } from '../models/productoModel';

class CarritoService {
  /**
   * Valida que los parámetros requeridos no sean null o undefined.
   * @param params Objeto con los parámetros a validar.
   * @throws Error indicando qué parámetro falta.
   */
  private validateParams(params: { [key: string]: any }) {
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        throw new Error(`El parámetro '${key}' es obligatorio y no puede ser null o undefined.`);
      }
    }
  }

  /**
   * Crea un carrito en estado Pendiente para el cliente si no existe o retorna el carrito pendiente.
   * @param client_id ID del cliente.
   * @param token Token de autenticación.
   * @returns ID del carrito.
   */
  async createOrGetCarrito(client_id: number, token: string): Promise<number> {
    this.validateParams({ client_id, token });
  
    let carrito = await CarritoModel.obtenerCarritoPorCliente(client_id);
  
    if (!carrito) {
      const carrito_id = await CarritoModel.crearCarrito({
        client_id,
        token,
        opcion_entrega: 'domicilio',
        precio_total: 0,
        tipo_tarjeta: '',
        numero_tarjeta: '',
        fecha_tarjeta: '',
        cvv: '',
      }); // Ahora CarritoCreacion
      return carrito_id;
    }
  
    if (carrito.estado_pago === 'Completado') {
      throw new Error('El cliente ya tiene un carrito finalizado.');
    }
  
    return carrito.carrito_id;
  }
  
  
  
  /**
   * Añade o actualiza un producto en un carrito en estado Pendiente.
   * @param client_id ID del cliente.
   * @param product_id ID del producto.
   * @param cantidad Cantidad del producto.
   * @param token Token de autenticación.
   * @returns El ID del producto en el carrito.
   */
  async addOrUpdateProductInCarrito(
    client_id: number,
    product_id: number,
    cantidad: number,
    token: string
  ): Promise<{ carrito_producto_id: number; carrito_id: number }> { // <-- Cambia el tipo de retorno
    this.validateParams({ client_id, product_id, cantidad, token });
  
    const carrito_id = await this.createOrGetCarrito(client_id, token);
  
    // Verificar existencia y stock del producto
    const producto = await ProductoModel.getProductById(product_id);
    if (!producto) {
      throw new Error('Producto no encontrado.');
    }
  
    if (producto.stock < cantidad) {
      throw new Error('Stock insuficiente.');
    }
  
    // Llamada al modelo que devuelve carrito_producto_id
    const result = await carritoProductoModel.addOrUpdateProductInCarrito({
      carrito_producto_id: 0,
      carrito_id,
      product_id,
      cantidad,
    });
  
    if (!result.carrito_producto_id) {
      throw new Error('Error al añadir o actualizar el producto en el carrito.');
    }
  
    return { carrito_producto_id: result.carrito_producto_id, carrito_id }; // <-- Devuelve ambos valores
  }
  

  /**
   * Obtiene los productos de un carrito específico.
   * @param carrito_id ID del carrito.
   * @returns Lista de productos.
   */
  async getProductsInCarrito(carrito_id: number): Promise<CarritoProducto[]> {
    this.validateParams({ carrito_id });

    const productos = await carritoProductoModel.getProductsByCarritoId(carrito_id);

    if (productos.length === 0) {
      throw new Error(`El carrito con ID ${carrito_id} no contiene productos.`);
    }

    return productos;
  }

  /**
   * Finaliza un carrito, ajusta el stock y cambia el estado a Completado.
   * @param carrito_id ID del carrito.
   * @param client_id
   */
  async finalizeCarrito(carrito_id: number): Promise<void> {
    this.validateParams({ carrito_id });

    const carrito = await CarritoModel.obtenerCarritoPorCliente(carrito_id);
    if (!carrito || carrito.estado_pago !== 'Pendiente') {
      throw new Error('El carrito no está en estado Pendiente o no existe.');
    }

    await carritoProductoModel.ajustarStockAlFinalizar(carrito_id);
    await CarritoModel.finalizarCompra(carrito_id);
  }

  /**
   * Elimina o reduce la cantidad de un producto específico del carrito.
   * @param carrito_producto_id ID del producto en el carrito.
   * @param cantidad Cantidad a eliminar.
   */
  async removeProductFromCarrito(carrito_producto_id: number, cantidad: number): Promise<void> {
    this.validateParams({ carrito_producto_id, cantidad });

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad debe ser un número entero positivo.');
    }

    const productoEnCarrito = await carritoProductoModel.getProductsByCarritoId(carrito_producto_id);
    if (productoEnCarrito.length === 0) {
      throw new Error(`Producto con ID ${carrito_producto_id} no encontrado en el carrito.`);
    }

    await carritoProductoModel.decrementProductQuantityInCarrito(carrito_producto_id, cantidad);
  }

  /**
   * Vacía el carrito completo de un cliente.
   * @param carrito_id ID del carrito.
   */
  async clearCarrito(carrito_id: number): Promise<void> {
    this.validateParams({ carrito_id });

    const productos = await carritoProductoModel.getProductsByCarritoId(carrito_id);
    if (productos.length === 0) {
      throw new Error(`El carrito con ID ${carrito_id} ya está vacío.`);
    }

    await carritoProductoModel.clearCarrito(carrito_id);
  }
}

export const carritoService = new CarritoService();
