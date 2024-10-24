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

  // Controlador para crear un nuevo producto
  static async crearProducto(req: Request, res: Response): Promise<void> {
    try {
      const { nombre_producto, descripcion_producto, precio, categoria, stock, epoca } = req.body;
  
      // Verificar si Multer subió una imagen
      if (!req.file) {
        res.status(400).json({ error: 'No se ha subido ninguna imagen.' });
        return;
      }
  
      // Comprimir la imagen usando sharp
      const compressedBuffer = await sharp(req.file.buffer)
        .resize(800) // Cambia el tamaño máximo a 800px
        .jpeg({ quality: 60 }) // Comprimir la imagen con calidad 60
        .toBuffer();
  
      // Crear el objeto del nuevo producto con el Buffer, no en base64
      const nuevoProducto = {
        nombre_producto,
        descripcion_producto,
        precio,
        categoria,
        stock,
        url_imagen: compressedBuffer, 
        epoca,// Guardar el Buffer directamente en la base de datos
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
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
  }
}
