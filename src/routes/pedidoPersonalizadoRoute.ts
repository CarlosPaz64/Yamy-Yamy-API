import { Router } from 'express';
import multer from 'multer';
import PedidoPersonalizadoController from '../controllers/pedidoPersonalizadoController';

const router = Router();
const upload = multer(); // Configuración básica de Multer para recibir archivos en memoria

// Ruta para crear un nuevo pedido personalizado
router.post(
  '/pedido-personalizado',
  upload.array('imagenes', 2), // Acepta hasta 2 archivos con el campo de formulario 'imagenes'
  PedidoPersonalizadoController.crearPedidoPersonalizado
);

export default router;
