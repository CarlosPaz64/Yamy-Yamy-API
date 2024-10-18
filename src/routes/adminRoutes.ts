import { Router } from 'express';
import { AdministradorController } from '../controllers/adminController';
import { verifyAdminToken } from '../middlewares/verifyAdminToken'
import { CarruselController } from '../controllers/carrusel1Controller';


const router = Router();

// Ruta para el login del administrador
router.post('/login', AdministradorController.login);

// Rutas protegidas por el middleware para subir y eliminar imágenes (solo accesibles para administradores)
router.post('/admin/carrusel', verifyAdminToken, CarruselController.subirImagen);
router.delete('/admin/carrusel/:idImagen', verifyAdminToken, CarruselController.eliminarImagen);

export default router;
