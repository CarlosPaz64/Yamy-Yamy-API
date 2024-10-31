import PedidoPersonalizadoModel, { NuevoPedidoPersonalizado } from '../models/pedidoPersonalizadoModel';
import { getCityByPostalCode } from '../database/zipCodes';

class ProductoPersonalizadoService {
  /**
   * Crea un pedido personalizado en la base de datos
   * @param pedido Los datos del pedido a crear, con imágenes en Buffer si existen
   */
  static async crearPedidoPersonalizado(pedido: NuevoPedidoPersonalizado): Promise<void> {
    // Crear el pedido en la base de datos utilizando el modelo
    await PedidoPersonalizadoModel.crearPedido(pedido);
  }

  /**
   * Obtiene la ciudad y colonias de acuerdo al código postal
   * @param codigoPostal El código postal a consultar
   */
  static async obtenerCiudadPorCodigoPostal(codigoPostal: string) {
    return getCityByPostalCode(codigoPostal);
  }
}

export default ProductoPersonalizadoService;
