import sharp from 'sharp';
import PedidoPersonalizadoModel, { NuevoPedidoPersonalizado } from '../models/pedidoPersonalizadoModel';
import { getCityByPostalCode } from '../database/zipCodes';

class ProductoPersonalizadoService {
  /**
   * Crea un pedido personalizado
   * @param pedido Los datos del pedido a crear
   * @param files Archivos de imagen de referencia
   */
  static async crearPedidoPersonalizado(pedido: NuevoPedidoPersonalizado, files?: Express.Multer.File[]): Promise<void> {
    let imagen_referencia_1: Buffer | undefined;
    let imagen_referencia_2: Buffer | undefined;

    // Comprimir las imágenes si existen
    if (files && files[0]) {
      imagen_referencia_1 = await sharp(files[0].buffer)
        .resize(800)
        .jpeg({ quality: 60 })
        .toBuffer();
    }

    if (files && files[1]) {
      imagen_referencia_2 = await sharp(files[1].buffer)
        .resize(800)
        .jpeg({ quality: 60 })
        .toBuffer();
    }

    // Llenar los datos del pedido incluyendo las imágenes comprimidas
    const nuevoPedido: NuevoPedidoPersonalizado = {
      ...pedido,
      imagen_referencia_1,
      imagen_referencia_2,
    };

    // Crear el pedido utilizando el modelo
    await PedidoPersonalizadoModel.crearPedido(nuevoPedido);
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
