import { db } from '../database/database';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

export interface Cliente {
  client_id?: number;
  email: string;
  password_cliente: string;
  nombre_cliente?: string;
  apellido_cliente?: string;
}

// Función existente
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

// Nueva función para obtener nombre y apellido por ID
export const getNombreApellidoById = async (clientId: number): Promise<{ nombre_cliente: string; apellido_cliente: string } | null> => {
  try {
    const [rows]: [RowDataPacket[], any] = await db.query(
      'SELECT nombre_cliente, apellido_cliente FROM cliente WHERE client_id = ?',
      [clientId]
    );

    if (rows.length > 0) {
      return rows[0] as { nombre_cliente: string; apellido_cliente: string };
    }

    return null;
  } catch (error) {
    console.error('Error al obtener el nombre y apellido del cliente por ID:', error);
    return null;
  }
};
