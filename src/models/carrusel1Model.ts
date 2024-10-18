import { db } from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Importa ResultSetHeader

// Interfaz para representar una imagen del carrusel
export interface ImagenCarrusel {
    idImagen?: number;
    imagen: string;  // La imagen en formato base64
    nombreImagen?: string;
  }
  

export class Carrusel1Model {
  // Subir una imagen al carrusel
  static async subirImagen(imagen: string, nombreImagen: string): Promise<void> {
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM carrusel_1');
      const totalImagenes = rows[0].total;

      if (totalImagenes >= 6) {
        throw new Error('El carrusel ya tiene 6 imágenes. No se pueden añadir más.');
      }

      await db.query('INSERT INTO carrusel_1 (imagen, nombreImagen) VALUES (?, ?)', [imagen, nombreImagen]);
    } catch (error) {
      throw new Error('Error al subir la imagen al carrusel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Eliminar una imagen del carrusel por su ID
  static async eliminarImagen(idImagen: number): Promise<void> {
    try {
      const [result] = await db.query<ResultSetHeader>('DELETE FROM carrusel_1 WHERE idImagen = ?', [idImagen]);

      if (result.affectedRows === 0) {
        throw new Error('No se encontró ninguna imagen con ese ID.');
      }
    } catch (error) {
      throw new Error('Error al eliminar la imagen del carrusel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  // Obtener todas las imágenes del carrusel
  static async obtenerImagenes(): Promise<ImagenCarrusel[]> {
    try {
      const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM carrusel_1');
      return rows as ImagenCarrusel[];
    } catch (error) {
      throw new Error('Error al obtener las imágenes del carrusel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}
