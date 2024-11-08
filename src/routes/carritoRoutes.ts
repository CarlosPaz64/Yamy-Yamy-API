// src/routes/carritoRoutes.ts
import { Router } from 'express';
import { carritoController } from '../controllers/carritoController';

const router = Router();

// Rutas del carrito

// Crear o obtener un nuevo carrito para el cliente
router.post('/create', carritoController.createCarrito);

// Agregar o actualizar un producto en el carrito
router.post('/add-product', carritoController.addOrUpdateProduct);

// Obtener todos los productos en un carrito específico
router.get('/:carrito_id/products', carritoController.getProductsInCarrito);

// Reducir la cantidad de un producto en el carrito
router.patch('/decrement-quantity/:carrito_producto_id', carritoController.removeProduct); // Cambiado para coincidir con la función correcta

// Eliminar un producto específico del carrito
router.delete('/remove-product/:carrito_producto_id', carritoController.removeProduct);

// Vaciar el carrito completo de un cliente
router.delete('/clear/:carrito_id', carritoController.clearCarrito);

export default router;
