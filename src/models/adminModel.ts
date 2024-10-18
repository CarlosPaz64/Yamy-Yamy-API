import { db } from '../database/database';
import { RowDataPacket } from 'mysql2'; // Importa el tipo adecuado

// Define la interfaz Administrador si no lo has hecho ya
export interface Administrador {
  admin_id: number;
  username: string;
  email: string;
  created_at: Date;
}

export class AdministradorModel {
  // Obtener todos los administradores
  static async obtenerTodos(): Promise<Administrador[]> {
    const [rows] = await db.query<RowDataPacket[]>('SELECT admin_id, username, email, created_at FROM administrador');
    return rows as Administrador[];
  }

  // Obtener un administrador por su username
  static async obtenerPorUsername(username: string): Promise<Administrador | null> {
    const [rows] = await db.query<RowDataPacket[]>('SELECT admin_id, username, email, created_at FROM administrador WHERE username = ?', [username]);
    return (rows as Administrador[]).length ? (rows[0] as Administrador) : null;
  }
}