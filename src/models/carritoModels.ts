import { db } from '../database/database';
import { RowDataPacket } from 'mysql2/promise';

export interface CarritoDatos {
  carrito_id?: number; // Añadir esta propiedad
  client_id: number;
  token: string;
  opcion_entrega: 'domicilio' | 'recoger';
  precio_total: number;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia?: string;
  ciudad?: string;
  codigo_postal?: string;
  descripcion_ubicacion?: string;
  numero_telefono?: string;
  tipo_tarjeta: string;
  numero_tarjeta: string;
  fecha_tarjeta: string;
  cvv: string;
}

class CarritoModel {
  // Crear un nuevo carrito con datos prellenados
  static async crearCarrito(carrito: CarritoDatos): Promise<number> {
    const {
      client_id,
      token,
      opcion_entrega,
      precio_total,
      calle = null,
      numero_exterior = null,
      numero_interior = null,
      colonia = null,
      ciudad = null,
      codigo_postal = null,
      descripcion_ubicacion = null,
      numero_telefono = null,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
    } = carrito;

    const query = `
      INSERT INTO carrito (
        client_id, token, opcion_entrega, precio_total, calle, numero_exterior, 
        numero_interior, colonia, ciudad, codigo_postal, descripcion_ubicacion, 
        numero_telefono, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      client_id,
      token,
      opcion_entrega,
      precio_total,
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
    ]);

    return (result as any).insertId; // Devuelve el ID del carrito recién creado
  }

  // Obtener los datos actuales del cliente
  static async obtenerDatosCliente(client_id: number): Promise<Partial<CarritoDatos>> {
    const query = `
      SELECT 
        calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal,
        descripcion_ubicacion, numero_telefono, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv
      FROM cliente
      WHERE client_id = ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [client_id]);
    if (rows.length === 0) {
      throw new Error(`No se encontraron datos para el cliente con ID ${client_id}`);
    }

    return rows[0] as Partial<CarritoDatos>;
  }

  // Actualizar datos del cliente en la tabla "cliente"
  static async actualizarDatosCliente(
    client_id: number,
    datosActualizados: Partial<CarritoDatos>
  ): Promise<void> {
    const {
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
    } = datosActualizados;

    const query = `
      UPDATE cliente
      SET
        calle = COALESCE(?, calle),
        numero_exterior = COALESCE(?, numero_exterior),
        numero_interior = COALESCE(?, numero_interior),
        colonia = COALESCE(?, colonia),
        ciudad = COALESCE(?, ciudad),
        codigo_postal = COALESCE(?, codigo_postal),
        descripcion_ubicacion = COALESCE(?, descripcion_ubicacion),
        numero_telefono = COALESCE(?, numero_telefono),
        tipo_tarjeta = COALESCE(?, tipo_tarjeta),
        numero_tarjeta = COALESCE(?, numero_tarjeta),
        fecha_tarjeta = COALESCE(?, fecha_tarjeta),
        cvv = COALESCE(?, cvv)
      WHERE client_id = ?
    `;

    await db.execute(query, [
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
      client_id,
    ]);
  }

  // Obtener carrito por cliente
  static async obtenerCarritoPorCliente(client_id: number): Promise<CarritoDatos | null> {
    const query = `
      SELECT *
      FROM carrito
      WHERE client_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [client_id]);
    if (rows.length === 0) {
      return null;
    }

    return rows[0] as CarritoDatos;
  }

  // Método para actualizar datos del carrito
  static async actualizarCarrito(
    carrito_id: number,
    datosActualizados: Partial<CarritoDatos>
  ): Promise<void> {
    const {
      opcion_entrega,
      precio_total,
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
    } = datosActualizados;

    const query = `
      UPDATE carrito
      SET
        opcion_entrega = COALESCE(?, opcion_entrega),
        precio_total = COALESCE(?, precio_total),
        calle = COALESCE(?, calle),
        numero_exterior = COALESCE(?, numero_exterior),
        numero_interior = COALESCE(?, numero_interior),
        colonia = COALESCE(?, colonia),
        ciudad = COALESCE(?, ciudad),
        codigo_postal = COALESCE(?, codigo_postal),
        descripcion_ubicacion = COALESCE(?, descripcion_ubicacion),
        numero_telefono = COALESCE(?, numero_telefono),
        tipo_tarjeta = COALESCE(?, tipo_tarjeta),
        numero_tarjeta = COALESCE(?, numero_tarjeta),
        fecha_tarjeta = COALESCE(?, fecha_tarjeta),
        cvv = COALESCE(?, cvv)
      WHERE carrito_id = ?
    `;

    await db.execute(query, [
      opcion_entrega,
      precio_total,
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv,
      carrito_id,
    ]);
  }
}

export default CarritoModel;
