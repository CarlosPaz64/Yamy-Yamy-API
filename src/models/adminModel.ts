import { db } from '../database/database';
import { RowDataPacket } from 'mysql2';

// Define la interfaz Administrador
export interface Administrador {
  admin_id: number;
  username: string;
  email: string;
  password_admin: string; // Incluimos el campo de contraseña
  created_at: Date;
}

export class AdministradorModel {
  // Obtener un administrador por su username
  static async obtenerPorUsername(username: string): Promise<Administrador | null> {
    // Obtenemos el administrador por el username
    const [rows] = await db.query<RowDataPacket[]>('SELECT admin_id, username, email, password_admin, created_at FROM administrador WHERE username = ?', [username]);

    if (rows.length > 0) {
      return rows[0] as Administrador;  // Retornamos al administrador completo
    }

    // Si no se encontró el administrador, devolvemos null
    return null;
  }
}
