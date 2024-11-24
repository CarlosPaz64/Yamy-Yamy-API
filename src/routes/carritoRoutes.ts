import { Router } from 'express';
import { carritoController } from '../controllers/carritoController';
import { verifyUserToken } from '../middlewares/verifyUserToken'; // Asegúrate de que la ruta sea correcta
import multer from 'multer';

const upload = multer();

const router = Router();

// Aplicar el middleware verifyUserToken a todas las rutas del carrito
router.use(verifyUserToken);

// Rutas del carrito

// Crear o obtener un nuevo carrito para el cliente
router.post('/create', carritoController.createCarrito);

// Agregar o actualizar un producto en el carrito
router.post('/add-product', carritoController.addOrUpdateProduct);

// Incrementar la cantidad de un producto existente
router.patch('/increment-quantity/:carrito_producto_id', carritoController.incrementProductQuantity);

// Obtener todos los productos en un carrito específico
router.get('/:carrito_id/products', carritoController.getProductsInCarrito);

// Reducir la cantidad de un producto en el carrito
router.patch('/decrement-quantity/:carrito_producto_id', carritoController.reduceProductQuantity);

// Eliminar un producto específico del carrito
router.delete('/remove-product/:carrito_producto_id', carritoController.removeProduct);

// Vaciar el carrito completo de un cliente
router.delete('/clear/:carrito_id', carritoController.clearCarrito);

// Finalizar el carrito (cambiar estado a "Completado" y ajustar stock)
router.put('/finalize/:carrito_id', upload.none(), carritoController.finalizeCarrito);

// Obtener datos del cliente relacionados con el carrito
router.get('/client/:client_id', carritoController.getClientCartData);

export default router;
