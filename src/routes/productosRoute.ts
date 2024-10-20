import { Router } from 'express';
import { ProductoController } from '../controllers/productosController';
import multer from 'multer';

// Configurar Multer para manejar la subida de archivos en memoria (buffer)
const storage = multer.memoryStorage(); // Almacenamos la imagen en la memoria como Buffer
const upload = multer({ storage });

const router = Router();

// Ruta para crear un nuevo producto usando Multer para manejar la imagen
router.post('/', upload.single('url_imagen'), ProductoController.crearProducto);

// Ruta para obtener productos ordenados por categoría
router.get('/por-categoria', ProductoController.obtenerProductosPorCategoria);
export default router;
