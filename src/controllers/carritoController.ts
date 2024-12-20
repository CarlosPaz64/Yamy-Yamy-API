import { Request, Response } from 'express';
import { carritoService } from '../services/carritoServices';
import CarritoModel, { CarritoDatosBase } from '../models/carritoModels';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tu_clave_secreta';

class CarritoController {
  // Crear o obtener un carrito para el cliente
  async createCarrito(req: Request, res: Response): Promise<void> {
    const { client_id, token, opcion_entrega, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv, ...domicilio } = req.body;

    console.log('Datos recibidos en createCarrito:', { client_id, token, opcion_entrega, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv, domicilio });

    try {
      const carritoId = await carritoService.createOrGetCarrito(client_id, token);
      console.log('Carrito ID obtenido/creado:', carritoId);

      if (opcion_entrega === 'domicilio') {
        this.validateDomicilio(domicilio);
        await carritoService.updateClientData(client_id, { ...domicilio, tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv });
      } else {
        await carritoService.updateClientData(client_id, { tipo_tarjeta, numero_tarjeta, fecha_tarjeta, cvv });
      }

      await CarritoModel.actualizarCarrito(carritoId, {
        opcion_entrega,
        tipo_tarjeta,
        numero_tarjeta,
        fecha_tarjeta,
        cvv,
      });

      res.status(201).json({ message: 'Carrito creado o encontrado exitosamente', carritoId });
    } catch (error) {
      console.error('Error en createCarrito:', error);
      res.status(500).json({ message: 'Error al crear o obtener el carrito' });
    }
  }
  // Validar que los datos de domicilio sean correctos y estén completos
  private validateDomicilio(domicilio: Partial<CarritoDatosBase>): void {
    const requiredFields: (keyof CarritoDatosBase)[] = [
      'calle',
      'numero_exterior',
      'colonia',
      'ciudad',
      'codigo_postal',
      'descripcion_ubicacion',
      'numero_telefono',
    ];
  
    const missingFields = requiredFields.filter((field) => !domicilio[field]);
  
    if (missingFields.length > 0) {
      throw new Error(`Faltan los siguientes campos de domicilio: ${missingFields.join(', ')}`);
    }
  }

  // Obtener el carrito pendiente para el cliente autenticado
  async getPendingCarrito(req: any, res: any): Promise<void> {
    try {
      console.log('req.user recibido en controlador:', req.user); // Debug
      const clientId = req.user?.id;
      console.log('Client ID recibido en getPendingCarrito:', clientId);
  
      if (!clientId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
  
      const carrito = await CarritoModel.obtenerCarritoPorCliente(clientId);
  
      if (!carrito) {
        return res.status(404).json({ message: 'No se encontró un carrito pendiente' });
      }
  
      res.status(200).json(carrito);
    } catch (error) {
      console.error('Error en getPendingCarrito:', error);
      res.status(500).json({ message: 'Error al obtener el carrito pendiente' });
    }
  }  
    // Agregar o actualizar un producto en el carrito
  async addOrUpdateProduct(req: Request, res: Response): Promise<void> {
    const { client_id, product_id, cantidad, token } = req.body;

    console.log('Datos recibidos en addOrUpdateProduct:', { client_id, product_id, cantidad, token });

    try {
      const { carrito_producto_id, carrito_id } = await carritoService.addOrUpdateProductInCarrito(client_id, product_id, cantidad, token);

      console.log('Producto añadido/actualizado:', { carrito_producto_id, carrito_id });

      res.status(200).json({
        message: 'Producto añadido o actualizado en el carrito',
        carrito_producto_id,
        carrito_id,
      });
    } catch (error) {
      console.error('Error en addOrUpdateProduct:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al agregar producto al carrito' });
    }
  }

  // Obtener todos los productos en un carrito específico
  async getProductsInCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;
  
    try {
      const productos = await carritoService.getProductsInCarrito(Number(carrito_id));
      res.status(200).json(productos);
    } catch (error) {
      console.error('Error en getProductsInCarrito:', error);
      res.status(500).json({ message: 'Error al obtener productos del carrito' });
    }
  }
  

  async finalizeCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params; // ID del carrito en la URL
    const encryptedData = req.body.encryptedData; // Datos encriptados recibidos desde el front-end
  
    try {
      if (!encryptedData) {
        throw new Error('No se recibieron datos encriptados.');
      }
  
      // Desencriptar los datos
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      const clientData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
      console.log('Carrito ID recibido en finalizeCarrito:', carrito_id);
      console.log('Datos del cliente desencriptados en finalizeCarrito:', clientData);
  
      // Validar y procesar la información desencriptada
      if (clientData.opcion_entrega === 'domicilio') {
        await carritoService.updateClientData(clientData.client_id, clientData);
        await carritoService.updateCarritoAddress(Number(carrito_id), clientData);
      } else if (clientData.opcion_entrega === 'recoger') {
        await carritoService.updateCarritoAddress(Number(carrito_id), {
          opcion_entrega: clientData.opcion_entrega,
        });
      } else {
        throw new Error('Opción de entrega no válida.');
      }
  
      await carritoService.finalizeCarrito(Number(carrito_id));
  
      res.status(200).json({
        message: 'Carrito finalizado exitosamente',
        carrito_id: Number(carrito_id),
      });
    } catch (error) {
      console.error('Error en finalizeCarrito:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Error al finalizar el carrito',
      });
    }
  }  
  
  // Eliminar o reducir la cantidad de un producto específico del carrito
  async removeProduct(req: Request, res: Response): Promise<void> {
    const { carrito_producto_id } = req.params;

    console.log('Datos recibidos en removeProduct:', { carrito_producto_id });

    try {
      await carritoService.dropProductFromCarrito(Number(carrito_producto_id));
      res.status(200).json({
        carrito_producto_id: Number(carrito_producto_id),
      });
    } catch (error) {
      console.error('Error en removeProduct:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Error al eliminar producto del carrito' });
    }
  }

  // Incrementar la cantidad de un producto en el carrito
async incrementProductQuantity(req: Request, res: Response): Promise<void> {
  const { carrito_producto_id } = req.params;
  const { cantidad } = req.body;

  try {
    // Lógica para incrementar la cantidad del producto
    await carritoService.incrementProductQuantity(Number(carrito_producto_id), Number(cantidad));
    res.status(200).json({ message: 'Cantidad incrementada exitosamente' });
  } catch (error) {
    console.error('Error incrementando la cantidad:', error);
    res.status(500).json({ message: 'Error incrementando la cantidad del producto' });
  }
}


// Reducir la cantidad de un producto específico del carrito
async reduceProductQuantity(req: Request, res: Response): Promise<void> {
  const { carrito_producto_id } = req.params;
  const { cantidad } = req.body;
  
  console.log('Datos recibidos en reduceProductQuantity:', { carrito_producto_id, cantidad });
  
  try {
    await carritoService.removeProductFromCarrito(Number(carrito_producto_id), Number(cantidad));
        res.status(200).json({
          message: 'Cantidad reducida en el carrito',
          carrito_producto_id: Number(carrito_producto_id),
        });
      } catch (error) {
        console.error('Error en reduceProductQuantity:', error);
        res.status(500).json({
          message: error instanceof Error ? error.message : 'Error al reducir cantidad del producto en el carrito',
        });
      }
    }

  // Vaciar el carrito completo de un cliente
  async clearCarrito(req: Request, res: Response): Promise<void> {
    const { carrito_id } = req.params;

    console.log('Carrito ID recibido en clearCarrito:', carrito_id);

    try {
      await carritoService.clearCarrito(Number(carrito_id));
      res.status(200).json({ message: 'Carrito vaciado exitosamente', carrito_id: Number(carrito_id) });
    } catch (error) {
      console.error('Error en clearCarrito:', error);
      res.status(500).json({ message: 'Error al vaciar el carrito' });
    }
  }

  // Obtener datos del cliente relacionados con el carrito
  async getClientCartData(req: Request, res: Response): Promise<void> {
    const { client_id } = req.params;

    console.log('Client ID recibido en getClientCartData:', client_id);

    try {
      const clientData = await CarritoModel.obtenerDatosCliente(Number(client_id));
      res.status(200).json(clientData);
    } catch (error) {
      console.error('Error en getClientCartData:', error);
      res.status(500).json({ message: 'Error al obtener datos del cliente' });
    }
  }
}

export const carritoController = new CarritoController();
