import { db } from '../database/database';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

export interface Cliente {
  client_id?: number;
  email: string;
  password_cliente: string;
}

export const getClienteByEmail = async (email: string): Promise<Cliente | null> => {
  try {
    const [rows]: [RowDataPacket[], any] = await db.query(
      'SELECT client_id, email, password_cliente FROM cliente WHERE email = ?',
      [email]
    );

    if (rows.length > 0) {
      return rows[0] as Cliente;
    }

    return null;
  } catch (error) {
    console.error('Error al obtener el cliente por email:', error);
    return null;
  }
};
