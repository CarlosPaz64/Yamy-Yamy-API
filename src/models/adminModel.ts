import { db } from '../database/database';
import { RowDataPacket } from 'mysql2'; // Importa el tipo adecuado
import bcrypt from 'bcrypt'; // Importa bcrypt para verificar la contraseña

// Define la interfaz Administrador
export interface Administrador {
  admin_id: number;
  username: string;
  email: string;
  password_admin: string; // Incluimos el campo de contraseña
  created_at: Date;
}

export class AdministradorModel {
  // Obtener un administrador por su username y verificar la contraseña
  static async obtenerPorUsername(username: string, password: string): Promise<Administrador | null> {
    // Primero obtenemos el administrador por el username
    const [rows] = await db.query<RowDataPacket[]>('SELECT admin_id, username, email, password_admin, created_at FROM administrador WHERE username = ?', [username]);

    if (rows.length) {
      const admin = rows[0] as Administrador;

      // Ahora verificamos la contraseña usando bcrypt
      const passwordCorrecta = await bcrypt.compare(password, admin.password_admin);

      if (passwordCorrecta) {
        // Si la contraseña es correcta, devolvemos el administrador (sin la contraseña)
        const { password_admin, ...adminSinPassword } = admin;
        return adminSinPassword as Administrador;
      }
    }

    // Si no se encontró el administrador o la contraseña es incorrecta, devolvemos null
    return null;
  }
}
