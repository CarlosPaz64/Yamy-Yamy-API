import { Router } from 'express';
import { RegisterController } from '../controllers/registerController';

const router = Router();

// Ruta para registrar usuario
router.post('/register', RegisterController.registerUser);

export default router;
