import PedidoPersonalizadoModel, { NuevoPedidoPersonalizado } from '../models/pedidoPersonalizadoModel';
import { getCityByPostalCode } from '../database/zipCodes';

class ProductoPersonalizadoService {
  /**
   * Crea un pedido personalizado y actualiza los datos del cliente si es necesario.
   * @param pedido Los datos del pedido a crear
   */
  static async crearPedidoPersonalizado(pedido: NuevoPedidoPersonalizado): Promise<void> {
    const { client_id, opcion_entrega, calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, descripcion_ubicacion, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv } = pedido;

    // Actualiza los datos del cliente solo si seleccionó la opción de entrega a domicilio
    if (opcion_entrega === 'domicilio') {
      await PedidoPersonalizadoModel.actualizarDatosCliente(client_id, {
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        codigo_postal,
        descripcion_ubicacion,
        tipo_tarjeta,
        numero_tarjeta,
        fecha_tarjeta,
        cvv,
      });
    }

    // Crear el pedido en la base de datos
    await PedidoPersonalizadoModel.crearPedido(pedido);
  }

  /**
   * Obtiene la ciudad y colonias de acuerdo al código postal.
   * @param codigoPostal El código postal a consultar
   */
  static async obtenerCiudadPorCodigoPostal(codigoPostal: string) {
    return getCityByPostalCode(codigoPostal);
  }
}

export default ProductoPersonalizadoService;
