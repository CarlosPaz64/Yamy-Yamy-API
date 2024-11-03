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
    tipo_tarjeta: string; // Tipo de tarjeta de crédito
    numero_tarjeta: string; // Número de tarjeta en formato enmascarado o encriptado
    fecha_tarjeta: string;
    cvv: string;
}

export const registerCliente = async (cliente: Cliente): Promise<number | null> => {
    try {
        const query = `
            INSERT INTO cliente (
                nombre_cliente, apellido_cliente, email, password_cliente, numero_telefono, 
                calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, descripcion_ubicacion, tipo_tarjeta, numero_tarjeta,
                fecha_tarjeta, cvv
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            cliente.tipo_tarjeta,
            cliente.numero_tarjeta,
            cliente.fecha_tarjeta,
            cliente.cvv
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
