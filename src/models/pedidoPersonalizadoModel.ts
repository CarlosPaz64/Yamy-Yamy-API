import { db } from '../database/database';

export interface NuevoPedidoPersonalizado {
  client_id: number;
  token: string;
  categoria: string;
  descripcion_orden: string;
  opcion_entrega: 'domicilio' | 'recoger';
  precio: number;
  cantidad: number;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia?: string;
  ciudad?: string;
  codigo_postal?: string;
  descripcion_ubicacion?: string;
  numero_telefono?: string;
  imagen_referencia_1?: Buffer;
  imagen_referencia_2?: Buffer;
  tipo_tarjeta?: string;
  numero_tarjeta?: string;
  fecha_tarjeta?: string;
  cvv?: string;
}

class PedidoPersonalizadoModel {
  // Método para crear un nuevo pedido
  static async crearPedido(pedido: NuevoPedidoPersonalizado): Promise<void> {
    const {
      client_id,
      token,
      categoria,
      descripcion_orden,
      precio,
      cantidad,
      opcion_entrega,
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      codigo_postal,
      descripcion_ubicacion,
      numero_telefono,
      imagen_referencia_1,
      imagen_referencia_2,
      tipo_tarjeta,
      numero_tarjeta,
      fecha_tarjeta,
      cvv
    } = pedido;

    await db.query(
      `INSERT INTO pedido_personalizado (
        client_id, token, categoria, descripcion_orden, precio, cantidad, opcion_entrega,
        calle, numero_exterior, numero_interior, colonia, ciudad,
        codigo_postal, descripcion_ubicacion, numero_telefono,
        imagen_referencia_1, imagen_referencia_2, tipo_tarjeta,
        numero_tarjeta, fecha_tarjeta, cvv
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id, token, categoria, descripcion_orden, precio, cantidad, opcion_entrega,
        calle, numero_exterior, numero_interior, colonia, ciudad,
        codigo_postal, descripcion_ubicacion, numero_telefono,
        imagen_referencia_1, imagen_referencia_2, tipo_tarjeta,
        numero_tarjeta, fecha_tarjeta, cvv
      ]
    );
  }

  // Método para obtener los datos del cliente (dirección y forma de pago)
  static async obtenerDatosCliente(client_id: number) {
    return db.query(
      `SELECT calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, numero_telefono, descripcion_ubicacion
       FROM cliente
       WHERE client_id = ?`,
      [client_id]
    );
  }

  // Método para actualizar datos del cliente en la tabla "cliente"
  static async actualizarDatosCliente(client_id: number, datos: Partial<NuevoPedidoPersonalizado>): Promise<void> {
    const {
      calle,
      numero_exterior,
      numero_interior,
      colonia,
      ciudad,
      descripcion_ubicacion,
      codigo_postal,
      numero_telefono,
    } = datos;

    await db.query(
      `UPDATE cliente SET
        calle = COALESCE(?, calle),
        numero_exterior = COALESCE(?, numero_exterior),
        numero_interior = COALESCE(?, numero_interior),
        colonia = COALESCE(?, colonia),
        ciudad = COALESCE(?, ciudad),
        descripcion_ubicacion = COALESCE(?, descripcion_ubicacion),
        codigo_postal = COALESCE(?, codigo_postal),
        numero_telefono = COALESCE(?, numero_telefono)
      WHERE client_id = ?`,
      [
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        descripcion_ubicacion,
        codigo_postal,
        numero_telefono,
        client_id
      ]
    );
  }
}

export default PedidoPersonalizadoModel;
