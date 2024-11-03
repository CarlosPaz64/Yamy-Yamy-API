import { Request, Response } from 'express';
import sharp from 'sharp';
import CryptoJS from 'crypto-js';
import ProductoPersonalizadoService from '../services/productoPersonalizadoService';
import { NuevoPedidoPersonalizado } from '../models/pedidoPersonalizadoModel';

const SECRET_KEY = 'tu_clave_secreta';

class PedidoPersonalizadoController {
  static async crearPedidoPersonalizado(req: Request, res: Response): Promise<void> {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        res.status(400).json({ error: 'Datos encriptados no proporcionados' });
        return;
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const {
        client_id,
        token,
        categoria,
        descripcion_orden,
        opcion_entrega,
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
      } = decryptedData;

      // Encripta los datos de la tarjeta antes de almacenarlos
      const encryptedTipoTarjeta = CryptoJS.AES.encrypt(tipo_tarjeta, SECRET_KEY).toString();
      const encryptedNumeroTarjeta = CryptoJS.AES.encrypt(numero_tarjeta, SECRET_KEY).toString();
      const encryptedFechaTarjeta = CryptoJS.AES.encrypt(fecha_tarjeta, SECRET_KEY).toString();
      const encryptedCVV = CryptoJS.AES.encrypt(cvv, SECRET_KEY).toString();

      const files = req.files as Express.Multer.File[] || [];
      let imagen_referencia_1: Buffer | undefined;
      let imagen_referencia_2: Buffer | undefined;

      if (files[0]) {
        imagen_referencia_1 = await sharp(files[0].buffer)
          .resize(800)
          .jpeg({ quality: 60 })
          .toBuffer();
      }

      if (files[1]) {
        imagen_referencia_2 = await sharp(files[1].buffer)
          .resize(800)
          .jpeg({ quality: 60 })
          .toBuffer();
      }

      // Construye el objeto con los datos del pedido encriptados
      const nuevoPedido: NuevoPedidoPersonalizado = {
        client_id: Number(client_id),
        token,
        categoria,
        descripcion_orden,
        opcion_entrega,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        codigo_postal,
        descripcion_ubicacion,
        numero_telefono,
        tipo_tarjeta: encryptedTipoTarjeta,
        numero_tarjeta: encryptedNumeroTarjeta,
        fecha_tarjeta: encryptedFechaTarjeta,
        cvv: encryptedCVV,
        imagen_referencia_1,
        imagen_referencia_2,
      };

      // Llama al servicio para crear el pedido con los datos encriptados
      await ProductoPersonalizadoService.crearPedidoPersonalizado(nuevoPedido);
      res.status(201).json({ message: 'Pedido personalizado creado exitosamente' });
    } catch (error: any) {
      console.error('Error al crear el pedido personalizado:', error);
      res.status(500).json({
        error: 'Error al crear pedido personalizado',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : null,
      });
    }
  }
}

export default PedidoPersonalizadoController;
