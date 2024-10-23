import { Router } from 'express';
import { getCity } from '../controllers/zipCodeController'; // Importa el controlador correctamente

const router = Router();

// Define la ruta que acepta un código postal como parámetro
router.get('/codigo-postal/:codigoPostal', getCity);  // Usa directamente la función getCity

export default router;
