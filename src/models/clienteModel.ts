import { db } from '../database/database';
import { RowDataPacket } from 'mysql2';

// Define la interfaz Cliente
export interface Cliente {
  client_id: number;
  nombre_cliente: string;
  apellido_cliente: string;
  email: string;
  password_cliente: string;
  numero_telefono: string | null;
  calle: string;
  numero_exterior: string;
  numero_interior: string | null;
  colonia: string;
  ciudad: string;
  codigo_postal: string;
  created_at: Date;
}

export class ClienteModel {
  // Obtener un cliente por su email
  static async obtenerPorEmail(email: string): Promise<Cliente | null> {
    try {
      // Obtenemos el cliente por el email, ya no se incluye la contraseña en la consulta
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT client_id, nombre_cliente, apellido_cliente, email, password_cliente, numero_telefono, calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, created_at FROM cliente WHERE email = ?',
        [email]
      );

      if (rows.length > 0) {
        return rows[0] as Cliente;  // Retornamos al cliente completo
      }

      // Si no se encontró el cliente, devolvemos null
      return null;
    } catch (error) {
      console.error('Error al obtener el cliente por email:', error);
      throw error;
    }
  }
}
