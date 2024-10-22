import { Request, Response } from 'express';
import { ClienteService } from '../services/ClienteServices'; // Asegúrate de que el archivo clienteServices exporte correctamente ClienteService

export class ClienteController {
  // Método de login
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body; // Usamos email en lugar de username

    if (!email || !password) {
      res.status(400).json({ message: 'Email y password son requeridos' });
      return;
    }

    try {
      // Autenticar al cliente y obtener el token y los datos del cliente
      const { token, cliente } = await ClienteService.autenticarCliente(email, password);

      if (!token || !cliente) {
        res.status(401).json({ message: 'Credenciales inválidas' });
        return;
      }

      // Enviar el token y los datos del cliente en la respuesta
      res.status(200).json({ message: 'Autenticación exitosa', token, cliente });
    } catch (error) {
      res.status(500).json({ message: (error instanceof Error ? error.message : 'Error desconocido al autenticar el cliente') });
    }
  }
}
