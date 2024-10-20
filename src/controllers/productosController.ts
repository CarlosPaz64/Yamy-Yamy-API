import { Request, Response } from 'express';
import { ProductoService } from '../services/productosServices';

export class ProductoController {
  // Controlador para obtener todos los productos
  static async obtenerProductos(req: Request, res: Response): Promise<void> {
    try {
      const productos = await ProductoService.obtenerProductos();

      // Las imágenes ya están en base64, no es necesario convertirlas
      res.json(productos); // Envía la respuesta con los productos
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }

  // Controlador para crear un nuevo producto
  static async crearProducto(req: Request, res: Response): Promise<void> {
    try {
      const { nombre_producto, descripcion_producto, precio, categoria, stock } = req.body;

      // Verificar si Multer subió una imagen
      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ninguna imagen.' });
        return;
      }

      // Convertir la imagen subida a base64
      const base64Imagen = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      // Crear el objeto del nuevo producto
      const nuevoProducto = {
        nombre_producto,
        descripcion_producto,
        precio,
        categoria,
        stock,
        url_imagen: `data:${mimeType};base64,${base64Imagen}`, // Guardar la imagen como base64
      };

      // Crear el producto usando el servicio
      await ProductoService.crearProducto(nuevoProducto);
      res.status(201).json({ message: 'Producto creado' });
    } catch (error: any) {
      console.error('Error al crear el producto:', error);
      res.status(500).json({
        error: 'Error al crear producto',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : null,
      });
    }
  }

  // Controlador para obtener productos ordenados por categorías
  static async obtenerProductosPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const productos = await ProductoService.obtenerProductosPorCategoria();

      // Las imágenes ya están en base64, no es necesario convertirlas
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
  }
}
