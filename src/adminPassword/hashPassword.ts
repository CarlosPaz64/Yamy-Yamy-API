import { db } from '../database/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// Función para hashear una contraseña si no está hasheada
const hashearContraseñasCliente = async () => {
  try {
    // Obtener todos los clientes de la base de datos
    const [clientes]: [RowDataPacket[], any] = await db.query('SELECT client_id, email, password_cliente FROM cliente');

    // Asegúrate de que 'clientes' es un array antes de iterar
    if (Array.isArray(clientes)) {
      for (const cliente of clientes) {
        const { client_id, password_cliente } = cliente;

        // Verificar si la contraseña ya está hasheada (generalmente los hashes de bcrypt empiezan con $2)
        if (!password_cliente.startsWith('$2')) {
          // Si la contraseña no está hasheada, hashearla
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password_cliente, saltRounds);

          // Actualizar la contraseña en la base de datos
          await db.query('UPDATE cliente SET password_cliente = ? WHERE client_id = ?', [hashedPassword, client_id]);

          console.log(`Contraseña del cliente con id ${client_id} hasheada correctamente.`);
        } else {
          console.log(`Contraseña del cliente con id ${client_id} ya está hasheada.`);
        }
      }
    } else {
      console.error('Error: El resultado de la consulta no es un array.');
    }
  } catch (error) {
    console.error('Error al hashear las contraseñas de los clientes:', error);
  }
};

export default hashearContraseñasCliente;
