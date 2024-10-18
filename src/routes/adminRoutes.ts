import { Router } from 'express';
import { AdministradorController } from '../controllers/adminController';
import { verifyAdminToken } from '../middlewares/verifyAdminToken'
import { CarruselController } from '../controllers/carrusel1Controller';


const router = Router();

// Ruta para el login del administrador
router.post('/login', AdministradorController.login);

// Ruta par obtener todas las imágebes del carrusel
router.get('/carrusel1', CarruselController.obtenerImagenes);

// Rutas protegidas por el middleware para subir y eliminar imágenes (solo accesibles para administradores)
router.post('/carrusel1', verifyAdminToken, CarruselController.subirImagen);
router.delete('/carrusel1/:idImagen', verifyAdminToken, CarruselController.eliminarImagen);

export default router;
