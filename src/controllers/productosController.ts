import { Request, Response } from 'express';
import { ProductoService } from '../services/productosServices';

export class ProductoController {
  // Controlador para obtener todos los productos
  static async obtenerProductos(req: Request, res: Response) {
    try {
      const productos = await ProductoService.obtenerProductos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  // Controlador para crear un nuevo producto
  static async crearProducto(req: Request, res: Response) {
    try {
      await ProductoService.crearProducto(req.body);
      res.status(201).json({ message: 'Producto creado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
}