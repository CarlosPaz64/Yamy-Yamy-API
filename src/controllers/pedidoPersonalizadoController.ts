import { Request, Response } from 'express';
import sharp from 'sharp';
import ProductoPersonalizadoService from '../services/productoPersonalizadoService';

class PedidoPersonalizadoController {
  static async crearPedidoPersonalizado(req: Request, res: Response): Promise<void> {
    try {
      const {
        client_id,
        token,
        categoria,
        descripcion,
        opcion_entrega,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        codigo_postal,
        descripcion_ubicacion,
        numero_telefono,
      } = req.body;

      // Verificar si Multer subió las imágenes
      const files = req.files as Express.Multer.File[] || [];
      let imagen_referencia_1: Buffer | undefined;
      let imagen_referencia_2: Buffer | undefined;

      // Comprimir y procesar las imágenes de referencia, si existen
      if (files[0]) {
        imagen_referencia_1 = await sharp(files[0].buffer)
          .resize(800) // Tamaño máximo 800px
          .jpeg({ quality: 60 }) // Calidad de compresión 60
          .toBuffer();
      }

      if (files[1]) {
        imagen_referencia_2 = await sharp(files[1].buffer)
          .resize(800) // Tamaño máximo 800px
          .jpeg({ quality: 60 }) // Calidad de compresión 60
          .toBuffer();
      }

      // Crear el objeto del nuevo pedido personalizado con imágenes comprimidas en Buffer
      const nuevoPedido = {
        client_id: Number(client_id),
        token,
        categoria,
        descripcion,
        opcion_entrega,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        codigo_postal,
        descripcion_ubicacion,
        numero_telefono,
        imagen_referencia_1,
        imagen_referencia_2,
      };

      // Crear el pedido personalizado usando el servicio
      await ProductoPersonalizadoService.crearPedidoPersonalizado(nuevoPedido);
      res.status(201).json({ message: 'Pedido personalizado creado exitosamente' });
    } catch (error: any) {
      console.error('Error al crear el pedido personalizado:', error);
      res.status(500).json({
        error: 'Error al crear pedido personalizado',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : null,
      });
    }
  }
}

export default PedidoPersonalizadoController;
