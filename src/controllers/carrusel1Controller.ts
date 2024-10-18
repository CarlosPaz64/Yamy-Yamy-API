import { Request, Response } from 'express';
import { Carrusel1Model } from '../models/carrusel1Model';

export class CarruselController {
  // Obtener todas las imágenes del carrusel (ruta pública)
  static async obtenerImagenes(req: Request, res: Response): Promise<void> {
    try {
      const imagenes = await Carrusel1Model.obtenerImagenes();
      res.status(200).json(imagenes);  // No retornamos la respuesta
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las imágenes del carrusel' });
    }
  }

  // Subir una imagen al carrusel (requiere token de administrador)
  static async subirImagen(req: Request, res: Response): Promise<void> {
    const { imagen, nombreImagen } = req.body;
    const adminId = req.adminId; // Obtenemos el ID del administrador a partir del middleware

    if (!imagen || !nombreImagen) {
      res.status(400).json({ message: 'La imagen y el nombre de la imagen son requeridos' });
      return;
    }

    try {
      console.log(`Admin con ID: ${adminId} está subiendo una imagen`);
      await Carrusel1Model.subirImagen(imagen, nombreImagen);
      res.status(201).json({ message: 'Imagen subida con éxito al carrusel' });
    } catch (error) {
      res.status(500).json({ message: 'Error al subir la imagen al carrusel' });
    }
  }

  // Eliminar una imagen del carrusel por ID (requiere token de administrador)
  static async eliminarImagen(req: Request, res: Response): Promise<void> {
    const { idImagen } = req.params;
    const adminId = req.adminId; // Obtenemos el ID del administrador a partir del middleware

    try {
      console.log(`Admin con ID: ${adminId} está eliminando la imagen con ID: ${idImagen}`);
      await Carrusel1Model.eliminarImagen(Number(idImagen));
      res.status(200).json({ message: 'Imagen eliminada con éxito' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar la imagen del carrusel' });
    }
  }
}
