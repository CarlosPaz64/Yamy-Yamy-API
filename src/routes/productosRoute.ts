import { Router } from 'express';
import { ProductoController } from '../controllers/productosController';

const router = Router();

// Ruta para obtener todos los productos
router.get('/', ProductoController.obtenerProductos);

// Ruta para crear un nuevo producto
router.post('/', ProductoController.crearProducto);

export default router;