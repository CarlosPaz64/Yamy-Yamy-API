import { db } from './database';  // Ajusta el path según corresponda
import { RowDataPacket } from 'mysql2';

// Función para obtener la ciudad por código postal
export const getCityByPostalCode = async (codigoPostal: string): Promise<string | null> => {
  try {
    // Realizamos la consulta y tipamos el resultado como RowDataPacket[]
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT ciudad FROM codigos WHERE codigo_postal_usuario = ?',
      [codigoPostal]
    );

    // Verificamos si se encontraron resultados
    if (rows.length > 0) {
      return rows[0].ciudad;  // Devuelve la ciudad si se encuentra
    }

    return null; // Devuelve null si no se encuentra el código postal
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    throw new Error('Error al consultar la base de datos');
  }
};

// Ejemplo de uso de la función
getCityByPostalCode('97320')
  .then((ciudad) => {
    console.log('Ciudad encontrada:', ciudad);
  })
  .catch((error) => {
    console.error(error);
  });
