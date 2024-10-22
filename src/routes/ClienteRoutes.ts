import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController'; // Cambia 'AdministradorController' a 'ClienteController'
import { verifyAdminToken } from '../middlewares/verifyAdminToken';
import { CarruselController } from '../controllers/carrusel1Controller';

const router = Router();

// Ruta para el login del cliente
router.post('/login', ClienteController.login); // Usa ClienteController en lugar de AdministradorController

// Ruta para obtener todas las imágenes del carrusel
router.get('/carrusel1', CarruselController.obtenerImagenes);

// Rutas protegidas por el middleware para subir y eliminar imágenes (solo accesibles para administradores)
router.post('/carrusel1', verifyAdminToken, CarruselController.subirImagen);
router.delete('/carrusel1/:idImagen', verifyAdminToken, CarruselController.eliminarImagen);

export default router;
