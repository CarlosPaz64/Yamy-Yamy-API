import { db } from '../database/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Cliente {
    client_id?: number;
    nombre_cliente: string;
    apellido_cliente: string;
    email: string;
    password_cliente: string;
    numero_telefono?: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    colonia: string;
    ciudad: string;
    codigo_postal: string;
    descripcion_ubicacion: string;
}

export const registerCliente = async (cliente: Cliente): Promise<number | null> => {
    try {
        const query = `
            INSERT INTO cliente (
                nombre_cliente, apellido_cliente, email, password_cliente, numero_telefono, 
                calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, descripcion_ubicacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            cliente.nombre_cliente,
            cliente.apellido_cliente,
            cliente.email,
            cliente.password_cliente,
            cliente.numero_telefono || null,
            cliente.calle,
            cliente.numero_exterior,
            cliente.numero_interior || null,
            cliente.colonia,
            cliente.ciudad,
            cliente.codigo_postal,
            cliente.descripcion_ubicacion,
        ];

        const [result] = await db.query<ResultSetHeader>(query, values);

        if (result && result.insertId) {
            return result.insertId; // Devuelve el id del nuevo cliente creado
        } else {
            console.error('No se pudo obtener el insertId después de la inserción.');
            return null;
        }
    } catch (error) {
        console.error('Error al registrar el cliente en la base de datos:', error);
        return null;
    }
};
