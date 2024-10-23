import { db } from './database';  // Ajusta el path según corresponda
import { RowDataPacket } from 'mysql2';

// Interfaz para tipar el resultado que incluirá ciudad y colonias
interface CityAndColonias {
  ciudad: string;
  colonias: string[];
}

// Función para obtener la ciudad y las colonias por código postal
export const getCityByPostalCode = async (codigoPostal: string): Promise<CityAndColonias | null> => {
  try {
    // Realizamos la consulta y tipamos el resultado como RowDataPacket[]
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT ciudad, colonia FROM codigos_postales WHERE codigo_postal_usuario = ?',
      [codigoPostal]
    );

    // Verificamos si se encontraron resultados
    if (rows.length > 0) {
      // Extraemos la ciudad (todas las filas tendrán la misma ciudad)
      const ciudad = rows[0].ciudad;

      // Creamos una lista con todas las colonias únicas
      const colonias = rows.map(row => row.colonia);

      return { ciudad, colonias }; // Devuelve un objeto con ciudad y colonias
    }

    return null; // Devuelve null si no se encuentra el código postal
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    throw new Error('Error al consultar la base de datos');
  }
};

// Ejemplo de uso de la función
getCityByPostalCode('97320')
  .then((data) => {
    if (data) {
      console.log('Ciudad encontrada:', data.ciudad);
      console.log('Colonias encontradas:', data.colonias);
    } else {
      console.log('No se encontró el código postal.');
    }
  })
  .catch((error) => {
    console.error(error);
  });
