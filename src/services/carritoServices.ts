import CarritoModel, { CarritoDatosBase } from '../models/carritoModels';
import { carritoProductoModel, CarritoProducto } from '../models/carritoProductoModel';
import { ProductoModel } from '../models/productoModel';
import { db } from '../database/database';
import { RowDataPacket } from 'mysql2';

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
      });
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
  ): Promise<{ carrito_producto_id: number; carrito_id: number }> {
    this.validateParams({ client_id, product_id, cantidad, token });
  
    const carrito_id = await this.createOrGetCarrito(client_id, token);
  
    // Verificar existencia y stock del producto
    const producto = await ProductoModel.getProductById(product_id);
    if (!producto) {
      throw new Error('Producto no encontrado.');
    }
  
    // Obtener la cantidad actual en el carrito para este producto
    const queryGetCantidadActual = `
      SELECT cantidad
      FROM carrito_producto
      WHERE carrito_id = ? AND product_id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(queryGetCantidadActual, [carrito_id, product_id]);
    const cantidadActualEnCarrito = rows[0]?.cantidad || 0;
  
    // Validar que la cantidad total no exceda el stock
    if (cantidadActualEnCarrito + cantidad > producto.stock) {
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
  
    return { carrito_producto_id: result.carrito_producto_id, carrito_id };
  }  

  /**
   * Incrementa la cantidad de un producto en el carrito.
   * @param carrito_producto_id ID del producto en el carrito.
   * @param cantidad Cantidad a incrementar.
   * @throws Error si los parámetros no son válidos o si ocurre algún problema en la base de datos.
   */
  async incrementProductQuantity(carrito_producto_id: number, cantidad: number): Promise<void> {
    if (!carrito_producto_id || carrito_producto_id <= 0) {
      throw new Error('El ID del producto en el carrito debe ser un número positivo.');
    }
  
    if (!cantidad || cantidad <= 0) {
      throw new Error('La cantidad a incrementar debe ser un número positivo.');
    }
  
    try {
      // Obtener detalles del producto en el carrito
      const queryGetProduct = `
        SELECT cp.cantidad, p.stock
        FROM carrito_producto cp
        INNER JOIN producto p ON cp.product_id = p.product_id
        WHERE cp.carrito_producto_id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(queryGetProduct, [carrito_producto_id]);
      const productInfo = rows[0];
  
      if (!productInfo) {
        throw new Error('Producto no encontrado en el carrito.');
      }
  
      const { cantidad: cantidadActual, stock } = productInfo;
  
      // Verificar si el incremento excederá el stock
      if (cantidadActual + cantidad > stock) {
        throw new Error('Stock insuficiente para incrementar la cantidad.');
      }
  
      // Realizar el incremento
      const queryUpdate = `
        UPDATE carrito_producto
        SET cantidad = cantidad + ?
        WHERE carrito_producto_id = ?
      `;
      await db.execute(queryUpdate, [cantidad, carrito_producto_id]);
    } catch (error) {
      console.error('Error incrementando la cantidad del producto en el carrito:', error);
      throw new Error('Error al incrementar la cantidad del producto en el carrito.');
    }
  }  
  

  /**
   * Obtiene los productos de un carrito específico.
   * @param carrito_id ID del carrito.
   * @returns Lista de productos.
   */
  async getProductsInCarrito(carrito_id: number): Promise<CarritoProducto[]> {
    this.validateParams({ carrito_id });
  
    const productos = await carritoProductoModel.getProductsByCarritoId(carrito_id);
  
    // Log para depuración, pero devuelve la lista de productos sin lanzar un error.
    console.log(`Productos obtenidos para el carrito con ID ${carrito_id}:`, productos);
  
    return productos;
  }
  

  /**
   * Finaliza un carrito, ajusta el stock y cambia el estado a Completado.
   * @param carrito_id ID del carrito.
   */
  async finalizeCarrito(carrito_id: number): Promise<void> {
    this.validateParams({ carrito_id });
  
    // Verifica si hay productos en el carrito
    const productosEnCarrito = await carritoProductoModel.getProductsByCarritoId(carrito_id);
  
    if (productosEnCarrito.length === 0) {
      throw new Error('El carrito no contiene productos.');
    }
  
    const carrito = await CarritoModel.obtenerCarritoPorId(carrito_id);
  
    if (!carrito || carrito.estado_pago !== 'Pendiente') {
      throw new Error('El carrito no está en estado Pendiente o no existe.');
    }
  
    // Calcula el precio total del carrito
    const precio_total = await carritoProductoModel.calcularTotalCarrito(carrito_id);
  
    // Ajusta el stock antes de finalizar el carrito
    await carritoProductoModel.ajustarStockAlFinalizar(carrito_id);
  
    // Finaliza el carrito con el precio total calculado
    await CarritoModel.finalizarCompra(carrito_id, precio_total);
  }
  
  
  /**
   * Actualiza los datos del cliente, incluyendo su domicilio y datos bancarios.
   * @param client_id ID del cliente.
   * @param datosActualizados Datos del cliente a actualizar.
   */
  async updateClientData(client_id: number, datosActualizados: Partial<CarritoDatosBase>): Promise<void> {
    this.validateParams({ client_id });

    await CarritoModel.actualizarDatosCliente(client_id, datosActualizados);
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

    const productoEnCarrito = await carritoProductoModel.getProductsByCarritoId(
      carrito_producto_id
    );
    if (!productoEnCarrito) {
      throw new Error(`Producto con ID ${carrito_producto_id} no encontrado en el carrito.`);
    }

    await carritoProductoModel.decrementProductQuantityInCarrito(carrito_producto_id, cantidad);
  }

/**
 * Elimina un producto específico del carrito.
 * @param carrito_producto_id ID del producto en el carrito.
 */
async dropProductFromCarrito(carrito_producto_id: number): Promise<void> {
  this.validateParams({ carrito_producto_id });

  const productoEnCarrito = await carritoProductoModel.getProductsByCarritoId(carrito_producto_id);

  if (!productoEnCarrito) {
    throw new Error(`Producto con ID ${carrito_producto_id} no encontrado en el carrito.`);
  }

  await carritoProductoModel.removeProductFromCarrito(carrito_producto_id);
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

  // Nuevo método
  async updateCarritoAddress(carrito_id: number, datosActualizados: Partial<CarritoDatosBase>): Promise<void> {
    this.validateParams({ carrito_id });
  
    await CarritoModel.actualizarCarrito(carrito_id, {
      opcion_entrega: datosActualizados.opcion_entrega, // Asegúrate de que este campo se actualice
      calle: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.calle : '',
      numero_exterior: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.numero_exterior : '',
      numero_interior: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.numero_interior : '',
      colonia: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.colonia : '',
      ciudad: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.ciudad : '',
      codigo_postal: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.codigo_postal : '',
      descripcion_ubicacion: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.descripcion_ubicacion : '',
      numero_telefono: datosActualizados.opcion_entrega === 'domicilio' ? datosActualizados.numero_telefono : '',
    });
  }
  
  
}

export const carritoService = new CarritoService();
