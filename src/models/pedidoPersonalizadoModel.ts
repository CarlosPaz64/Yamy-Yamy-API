import { db } from '../database/database';
import sharp from 'sharp';

export interface NuevoPedidoPersonalizado {
  client_id: number;
  token: string;
  categoria: string;
  descripcion: string;
  opcion_entrega: 'domicilio' | 'recoger';
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
}

class PedidoPersonalizadoModel {
  static async crearPedido(pedido: NuevoPedidoPersonalizado): Promise<void> {
    let {
      client_id,
      token,
      categoria,
      descripcion,
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
      imagen_referencia_2
    } = pedido;

    // Si la opción de entrega es "domicilio", obtenemos la dirección y descripción del cliente desde la tabla "cliente"
    if (opcion_entrega === 'domicilio') {
      const [rows]: any = await db.query(
        `SELECT calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, numero_telefono, descripcion 
         FROM cliente 
         WHERE client_id = ?`,
        [client_id]
      );

      const clienteData = rows[0]; // Toma el primer registro si existe

      if (clienteData) {
        // Asignamos los datos de domicilio, teléfono y descripción obtenidos de la tabla "cliente"
        calle = clienteData.calle;
        numero_exterior = clienteData.numero_exterior;
        numero_interior = clienteData.numero_interior;
        colonia = clienteData.colonia;
        ciudad = clienteData.ciudad;
        codigo_postal = clienteData.codigo_postal;
        numero_telefono = clienteData.numero_telefono;
        descripcion_ubicacion = clienteData.descripcion; // Asigna la descripción de ubicación
      }
    }

    // Inserta el pedido en la base de datos
    await db.query(
      `INSERT INTO pedido_personalizado (
        client_id, token, categoria, descripcion, opcion_entrega,
        calle, numero_exterior, numero_interior, colonia, ciudad,
        codigo_postal, descripcion_ubicacion, numero_telefono,
        imagen_referencia_1, imagen_referencia_2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id, token, categoria, descripcion, opcion_entrega,
        calle, numero_exterior, numero_interior, colonia, ciudad,
        codigo_postal, descripcion_ubicacion, numero_telefono,
        imagen_referencia_1, imagen_referencia_2
      ]
    );
  }
}

export default PedidoPersonalizadoModel;
