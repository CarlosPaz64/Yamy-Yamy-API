import express, { Router, Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import PedidoPersonalizadoController from '../controllers/pedidoPersonalizadoController';
import PedidoPersonalizadoModel from '../models/pedidoPersonalizadoModel';

const router = Router();
const upload = multer();

// Ruta para crear un nuevo pedido personalizado
router.post(
  '/pedido-personalizado',
  upload.array('imagenes', 2),
  PedidoPersonalizadoController.crearPedidoPersonalizado
);

// Ruta para obtener los datos del cliente (dirección y forma de pago)
const obtenerDatosCliente: RequestHandler<{ client_id: string }> = async (req, res): Promise<void> => {
  const { client_id } = req.params;

  try {
    console.log('Obteniendo datos del cliente con ID:', client_id);

    const clientIdNumber = Number(client_id);
    if (isNaN(clientIdNumber)) {
      console.error('Error: client_id no es un número válido:', client_id);
      res.status(400).json({ error: 'ID de cliente inválido' });
      return;
    }

    const [rows]: any = await PedidoPersonalizadoModel.obtenerDatosCliente(clientIdNumber);

    console.log('Resultados de la consulta:', rows);

    if (!rows || rows.length === 0) {
      console.warn('Cliente no encontrado con ID:', client_id);
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const clienteData = rows[0];
    console.log('Datos del cliente:', clienteData);
    res.json(clienteData);
  } catch (error) {
    console.error('Error al obtener los datos del cliente:', error);

    if (error instanceof Error) {
      res.status(500).json({ error: 'Error al obtener los datos del cliente', details: error.message });
    } else {
      res.status(500).json({ error: 'Error desconocido al obtener los datos del cliente' });
    }
  }
};

// Define la ruta para obtener los datos del cliente
router.get('/cliente/:client_id', obtenerDatosCliente);

export default router;
