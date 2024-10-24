import { Request, Response } from 'express';
import { LoginService } from '../services/loginService';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'tu_clave_secreta';  // Debe ser la misma clave usada para encriptar los datos
const JWT_SECRET = 'jwt_secret_key';    // Clave secreta para firmar el token JWT

export class LoginController {
  static async loginUser(req: Request, res: Response): Promise<void> {
    try {
      // Obtener los datos encriptados desde el cliente
      const { encryptedData } = req.body;

      if (!encryptedData) {
        res.status(400).json({ message: 'Los datos encriptados son requeridos.' });
        return;
      }

      // Desencriptar los datos
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const { email, password } = decryptedData;

      if (!email || !password) {
        res.status(400).json({ message: 'El correo y la contraseña son obligatorios.' });
        return;
      }

      // Validar el usuario y la contraseña usando el servicio de autenticación
      const user = await LoginService.loginUser(email, password);

      // Generar el token JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '1h', // El token expira en 1 hora
      });

      // Responder con el token y el ID del usuario
      res.status(200).json({ token, userId: user.id, message: 'Inicio de sesión exitoso' });
    } catch (error) {

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
