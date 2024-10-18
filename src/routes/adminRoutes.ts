import { Router } from 'express';
import { AdministradorController } from '../controllers/adminController';

const router = Router();

// Ruta para el login del administrador
router.post('/login', AdministradorController.login);

export default router;
