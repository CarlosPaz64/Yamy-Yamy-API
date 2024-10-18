import { Request, Response } from 'express';
import { AdministradorService } from '../services/adminServices';

export class AdministradorController {
  // Método de login
  static async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username y password son requeridos' });
      return;
    }

    try {
      // Autenticar al administrador y obtener el token y los datos del administrador
      const { token, admin } = await AdministradorService.autenticarAdministrador(username, password);

      if (!token || !admin) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Enviar el token y los datos del administrador en la respuesta
      res.status(200).json({ message: 'Autenticación exitosa', token, admin });
    } catch (error) {
      res.status(500).json({ message: (error instanceof Error ? error.message : 'Error desconocido al autenticar el administrador') });
    }
  }
}
