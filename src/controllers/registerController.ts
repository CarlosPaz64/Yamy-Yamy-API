import { Request, Response } from 'express';  // Importar correctamente desde 'express'
import { RegisterService } from '../services/registerService';  // Asegúrate de la ruta correcta del servicio

export class RegisterController {
  static async registerUser(req: Request, res: Response): Promise<void> {  // El tipo Promise<void> es importante aquí
    try {
      const { encryptedData } = req.body;  // Obtener los datos encriptados del cuerpo

      if (!encryptedData) {
        res.status(400).json({ message: 'Los datos encriptados son requeridos.' });
        return;  // Asegúrate de finalizar la ejecución si hay un error
      }

      // Llamamos al servicio para desencriptar y registrar al usuario
      const clientId = await RegisterService.registerUser(encryptedData);

      res.status(201).json({ message: 'Usuario registrado exitosamente', clientId });
    } catch (error) {
      console.error('Error en el registro del usuario:', error);
      res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
  }
}
