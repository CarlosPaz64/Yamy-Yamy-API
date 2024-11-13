import { db } from '../database/database';
import { RowDataPacket } from 'mysql2/promise';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tu_clave_secreta';

export interface CarritoDatosBase {
  carrito_id: number; // Obligatorio en operaciones existentes
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
  estado_pago?: 'Pendiente' | 'Completado';
}

export type CarritoCreacion = Omit<CarritoDatosBase, 'carrito_id'>; // Sin carrito_id

class CarritoModel {
  // Método para encriptar datos
  private static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  // Método para desencriptar datos
  private static decrypt(data: string): string {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Crear un nuevo carrito con estado pendiente
  static async crearCarrito(carrito: CarritoCreacion): Promise<number> {
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
        numero_telefono, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv, estado_pago
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
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
      this.encrypt(tipo_tarjeta),
      this.encrypt(numero_tarjeta),
      this.encrypt(fecha_tarjeta),
      this.encrypt(cvv),
    ]);

    return (result as any).insertId;
  }

  // Obtener los datos actuales del cliente para prellenar el carrito
  static async obtenerDatosCliente(client_id: number): Promise<Partial<CarritoDatosBase>> {
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

    const data = rows[0] as Partial<CarritoDatosBase>;

    return {
      ...data,
      tipo_tarjeta: data.tipo_tarjeta ? this.decrypt(data.tipo_tarjeta) : undefined,
      numero_tarjeta: data.numero_tarjeta ? this.decrypt(data.numero_tarjeta) : undefined,
      fecha_tarjeta: data.fecha_tarjeta ? this.decrypt(data.fecha_tarjeta) : undefined,
      cvv: data.cvv ? this.decrypt(data.cvv) : undefined,
    };
  }

  // Obtener el carrito más reciente del cliente con estado pendiente
  static async obtenerCarritoPorCliente(client_id: number): Promise<CarritoDatosBase | null> {
    const query = `
      SELECT *
      FROM carrito
      WHERE client_id = ? AND estado_pago = 'Pendiente'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [client_id]);
    if (rows.length === 0) {
      return null;
    }

    return rows[0] as CarritoDatosBase;
  }

  // Obtener un carrito por su ID
  static async obtenerCarritoPorId(carrito_id: number): Promise<CarritoDatosBase | null> {
    const query = `
      SELECT * 
      FROM carrito 
      WHERE carrito_id = ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [carrito_id]);
    if (rows.length === 0) {
      return null;
    }

    return rows[0] as CarritoDatosBase;
  }

  // Obtener todos los carritos completados de un cliente
  static async obtenerCarritosCompletadosPorCliente(client_id: number): Promise<CarritoDatosBase[]> {
    const query = `
      SELECT * 
      FROM carrito
      WHERE client_id = ? AND estado_pago = 'Completado'
      ORDER BY created_at DESC
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [client_id]);
    return rows as CarritoDatosBase[];
  }

  // Validar si un carrito pertenece a un cliente
  static async validarCarritoCliente(carrito_id: number, client_id: number): Promise<void> {
    const query = `
      SELECT carrito_id FROM carrito 
      WHERE carrito_id = ? AND client_id = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(query, [carrito_id, client_id]);

    if (rows.length === 0) {
      throw new Error(`El carrito con ID ${carrito_id} no pertenece al cliente con ID ${client_id}`);
    }
  }

  // Actualizar datos del carrito antes de finalizar la compra
  static async actualizarCarrito(
    carrito_id: number,
    datosActualizados: Partial<CarritoDatosBase>
  ): Promise<void> {
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
      datosActualizados.opcion_entrega ?? null,
      datosActualizados.precio_total ?? null,
      datosActualizados.calle ?? null,
      datosActualizados.numero_exterior ?? null,
      datosActualizados.numero_interior ?? null,
      datosActualizados.colonia ?? null,
      datosActualizados.ciudad ?? null,
      datosActualizados.codigo_postal ?? null,
      datosActualizados.descripcion_ubicacion ?? null,
      datosActualizados.numero_telefono ?? null,
      datosActualizados.tipo_tarjeta ? this.encrypt(datosActualizados.tipo_tarjeta) : null,
      datosActualizados.numero_tarjeta ? this.encrypt(datosActualizados.numero_tarjeta) : null,
      datosActualizados.fecha_tarjeta ? this.encrypt(datosActualizados.fecha_tarjeta) : null,
      datosActualizados.cvv ? this.encrypt(datosActualizados.cvv) : null,
      carrito_id,
    ]);
  }
  

  // Actualizar los datos del cliente incluyendo domicilio y tarjeta
static async actualizarDatosCliente(
  client_id: number,
  datosActualizados: Partial<CarritoDatosBase>
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
    tipo_tarjeta ? this.encrypt(tipo_tarjeta) : null,
    numero_tarjeta ? this.encrypt(numero_tarjeta) : null,
    fecha_tarjeta ? this.encrypt(fecha_tarjeta) : null,
    cvv ? this.encrypt(cvv) : null,
    client_id,
  ]);
}

  // Finalizar el carrito cambiando su estado a Completado
  static async finalizarCompra(carrito_id: number, precio_total: number): Promise<void> {
    const query = `
      UPDATE carrito
      SET estado_pago = 'Completado', precio_total = ?
      WHERE carrito_id = ? AND estado_pago = 'Pendiente'
    `;
  
    const [result] = await db.execute(query, [precio_total, carrito_id]);
    if ((result as any).affectedRows === 0) {
      throw new Error('No se pudo finalizar la compra. Verifica el estado del carrito.');
    }
  }
  
}

export default CarritoModel;
