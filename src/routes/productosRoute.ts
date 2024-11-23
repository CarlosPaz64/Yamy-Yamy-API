import { Router } from 'express';
import { ProductoController } from '../controllers/productosController';

const router = Router();


// Ruta para obtener productos ordenados por categoría
router.get('/por-categoria', ProductoController.obtenerProductosPorCategoria);
export default router;
