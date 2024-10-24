import { Router } from 'express';
import { RegisterController } from '../controllers/registerController';
import { LoginController } from '../controllers/loginController';

const router = Router();

// Ruta para registrar usuario
router.post('/register', RegisterController.registerUser);

router.post('/login', LoginController.loginUser);


export default router;
