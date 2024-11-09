import { Request, Response } from 'express';
import { carritoService } from '../services/carritoServices';
import CarritoModel from '../models/carritoModels';

class CarritoController {
  // Crear o obtener un carrito para el cliente
  async createCarrito(req: Request, res: Response): Promise<void> {
    const { client_id, token, opcion_entrega, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv } = req.body;

    console.log('Datos recibidos en createCarrito:', { client_id, token, opcion_entrega, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv });

    try {
      const carritoId = await carritoService.createOrGetCarrito(client_id, token);
      console.log('Carrito ID obtenido/creado:', carritoId);

      // Opcional: actualizar datos adicionales en el carrito
      await CarritoModel.actualizarCarrito(carritoId, {
        opcion_entrega,
        tipo_tarjeta,
        numero_tarjeta,
        fecha_tarjeta,
        cvv,
      });

      res.status(201).json({ message: 'Carrito creado o encontrado exitosamente', carritoId });
    } catch (error) {
      console.error('Error en createCarrito:', error);
      res.status(500).json({ message: 'Error al crear o obtener el carrito' });
    }
  }

  // Agregar o actualizar un producto en el carrito
  async addOrUpdateProduct(req: Request, res: Response): Promise<void> {
    const { client_id, product_id, cantidad, token } = req.body;
  
    console.log('Datos recibidos en addOrUpdateProduct:', { client_id, product_id, cantidad, token });
  
    try {
      const { carrito_producto_id, carrito_id } = await carritoService.addOrUpdateProductInCarrito(client_id, product_id, cantidad, token);
      
      console.log('Producto añadido/actualizado:', { carrito_producto_id, carrito_id });
  
      res.status(200).json({
        message: 'Producto añadido o actualizado en el carrito',
        carrito_producto_id,
        carrito_id, // Asegúrate de enviar carrito_id
      });
    } catch (error) {
      console.error('Error en addOrUpdateProduct:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al agregar producto al carrito' });
    }
  }
  

  // Obtener todos los productos en un carrito específico
  async getProductsInCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    console.log('Carrito ID recibido en getProductsInCarrito:', carrito_id);

    try {
      const productos = await carritoService.getProductsInCarrito(Number(carrito_id));
      console.log('Productos en carrito:', productos);
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error en getProductsInCarrito:', error);
      res.status(500).json({ message: 'Error al obtener productos del carrito' });
    }
  }

  // Finalizar el carrito
  async finalizeCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    console.log('Carrito ID recibido en finalizeCarrito:', carrito_id);

    try {
      await carritoService.finalizeCarrito(Number(carrito_id));
      res.status(200).json({ message: 'Carrito finalizado exitosamente', carrito_id: Number(carrito_id) });
    } catch (error) {
      console.error('Error en finalizeCarrito:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al finalizar el carrito' });
    }
  }

  // Eliminar o reducir la cantidad de un producto específico del carrito
  async removeProduct(req: Request, res: Response): Promise<void> {
    const { carrito_producto_id } = req.params;
    const { cantidad } = req.body;

    console.log('Datos recibidos en removeProduct:', { carrito_producto_id, cantidad });

    try {
      await carritoService.removeProductFromCarrito(Number(carrito_producto_id), Number(cantidad));
      res.status(200).json({
        message: cantidad > 0
          ? 'Cantidad reducida en el carrito'
          : 'Producto eliminado del carrito',
        carrito_producto_id: Number(carrito_producto_id),
      });
    } catch (error) {
      console.error('Error en removeProduct:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al eliminar producto del carrito' });
    }
  }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    console.log('Carrito ID recibido en clearCarrito:', carrito_id);

    try {
      await carritoService.clearCarrito(Number(carrito_id));
      res.status(200).json({ message: 'Carrito vaciado exitosamente', carrito_id: Number(carrito_id) });
    } catch (error) {
      console.error('Error en clearCarrito:', error);
      res.status(500).json({ message: 'Error al vaciar el carrito' });
    }
  }

  // Obtener datos del cliente relacionados con el carrito
  async getClientCartData(req: Request, res: Response): Promise<void> {
    const { client_id } = req.params;

    console.log('Client ID recibido en getClientCartData:', client_id);

    try {
      const clientData = await CarritoModel.obtenerDatosCliente(Number(client_id));
      res.status(200).json(clientData);
    } catch (error) {
      console.error('Error en getClientCartData:', error);
      res.status(500).json({ message: 'Error al obtener datos del cliente' });
    }
  }
}

export const carritoController = new CarritoController();
