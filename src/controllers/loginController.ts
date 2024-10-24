import { Request, Response } from 'express';
import { LoginService } from '../services/loginService';

export class LoginController {
  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
        return;
      }

      // Validar el usuario y la contraseña
      await LoginService.loginUser(email, password);

      res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
      // Verificar si el error es de tipo Error antes de usar sus propiedades
      if (error instanceof Error) {
        console.error('Error en el inicio de sesión:', error.message);
        res.status(401).json({ message: error.message || 'Error en el inicio de sesión' });
      } else {
        console.error('Error inesperado:', error);
        res.status(500).json({ message: 'Error inesperado en el servidor' });
      }
    }
  }
}
