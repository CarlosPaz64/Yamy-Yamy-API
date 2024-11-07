// src/controllers/carritoController.ts
import { Request, Response } from 'express';
import { carritoService } from '../services/carritoServices';
import CarritoModel from '../models/carritoModels';

class CarritoController {
  // Crear o obtener un carrito para el cliente
  async createCarrito(req: Request, res: Response): Promise<void> {
    const { client_id, token, opcion_entrega, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv } = req.body;

    try {
      const carritoId = await carritoService.createOrGetCarrito(client_id, token);
      
      // Opcional: Si necesitas actualizar datos adicionales en el carrito
      await CarritoModel.actualizarCarrito(carritoId, {
        opcion_entrega,
        tipo_tarjeta,
        numero_tarjeta,
        fecha_tarjeta,
        cvv,
      });

      res.status(201).json({ message: 'Carrito creado o encontrado exitosamente', carritoId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear o obtener el carrito' });
    }
  }

  // Agregar o actualizar un producto en el carrito
  async addOrUpdateProduct(req: Request, res: Response): Promise<void> {
    const { client_id, product_id, cantidad, token } = req.body;

    try {
      await carritoService.addOrUpdateProductInCarrito(client_id, product_id, cantidad, token);
      res.status(200).json({ message: 'Producto añadido o actualizado en el carrito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al agregar producto al carrito' });
    }
  }

  // Obtener todos los productos en un carrito específico
  async getProductsInCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    try {
      const productos = await carritoService.getProductsInCarrito(Number(carrito_id));
      res.status(200).json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener productos del carrito' });
    }
  }

  // Eliminar un producto específico del carrito
  async removeProduct(req: Request, res: Response): Promise<void> {
    const { carrito_producto_id } = req.params;
    const { cantidad } = req.body;

    try {
      await carritoService.removeProductFromCarrito(Number(carrito_producto_id), Number(cantidad));
      res.status(200).json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar producto del carrito' });
    }
  }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    try {
      await carritoService.clearCarrito(Number(carrito_id));
      res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al vaciar el carrito' });
    }
  }
}

export const carritoController = new CarritoController();
