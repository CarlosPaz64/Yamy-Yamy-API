import { Request, Response } from 'express';
import { getCityByPostalCode } from '../database/zipCodes';  // Importa la función que consulta la base de datos

// Controlador para obtener la ciudad y colonias por código postal
export const getCity = async (req: Request, res: Response): Promise<void> => {
  const { codigoPostal } = req.params;

  try {
    // Llamada a la función que consulta la base de datos
    const data = await getCityByPostalCode(codigoPostal);

    if (data) {
      // Envía la respuesta con la ciudad y las colonias
      res.status(200).json({ ciudad: data.ciudad, colonias: data.colonias });
    } else {
      // Si no se encuentra el código postal, envía un 404
      res.status(404).json({ message: 'Código postal no encontrado' });
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener la ciudad y colonias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
