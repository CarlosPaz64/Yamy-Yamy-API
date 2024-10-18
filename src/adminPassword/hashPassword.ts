import { db } from '../database/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';

// Función para hashear una contraseña si no está hasheada
const hashearContraseñasAdmin = async () => {
  try {
    // Obtener todos los administradores de la base de datos
    const [admins]: [RowDataPacket[], any] = await db.query('SELECT admin_id, username, password_admin FROM administrador');

    // Asegúrate de que 'admins' es un array antes de iterar
    if (Array.isArray(admins)) {
      for (const admin of admins) {
        const { admin_id, password_admin } = admin;

        // Verificar si la contraseña ya está hasheada (generalmente los hashes de bcrypt empiezan con $2)
        if (!password_admin.startsWith('$2')) {
          // Si la contraseña no está hasheada, hashearla
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password_admin, saltRounds);

          // Actualizar la contraseña en la base de datos
          await db.query('UPDATE administrador SET password_admin = ? WHERE admin_id = ?', [hashedPassword, admin_id]);

          console.log(`Contraseña de administrador con id ${admin_id} hasheada correctamente.`);
        } else {
          console.log(`Contraseña del administrador con id ${admin_id} ya está hasheada.`);
        }
      }
    } else {
      console.error('Error: El resultado de la consulta no es un array.');
    }
  } catch (error) {
    console.error('Error al hashear las contraseñas de los administradores:', error);
  }
};

export default hashearContraseñasAdmin;
