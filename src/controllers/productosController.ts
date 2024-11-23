import { Request, Response } from 'express';
import { ProductoService } from '../services/productosServices';
import sharp from 'sharp'; // Importa sharp

export class ProductoController {
  // Controlador para obtener todos los productos
  static async obtenerProductos(req: Request, res: Response): Promise<void> {
    try {
      const productos = await ProductoService.obtenerProductos();
      res.json(productos); // Envía la respuesta con los productos
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  // Controlador para obtener productos ordenados por categorías
  static async obtenerProductosPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const productos = await ProductoService.obtenerProductosPorCategoria();
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
  }
}
