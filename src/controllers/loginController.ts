import { Response } from 'express';
import { CustomSessionRequest } from '../types/express-session'; // Asegúrate de que la ruta sea correcta
import { LoginService } from '../services/loginService';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'tu_clave_secreta';
const JWT_SECRET = 'jwt_secret_key';

export class LoginController {
  static async loginUser(req: CustomSessionRequest, res: Response): Promise<void> {
    try {
      const { encryptedData } = req.body;

      if (!encryptedData) {
        res.status(400).json({ message: 'Los datos encriptados son requeridos.' });
        return;
      }

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

      const user = await LoginService.loginUser(email, password);

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '1h',
      });

      // Guardar token y userId en la sesión
      req.session.token = token;
      req.session.userId = user.id;
      console.log("Este es el token de la sesión: ",req.session.token);
      console.log("Este es el id del cliente: ",req.session.userId);

      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        userId: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        token
      });
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

  static async logoutUser(req: CustomSessionRequest, res: Response): Promise<void> {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
      } else {
        res.status(200).json({ message: 'Sesión cerrada con éxito' });
      }
    });
  }
}
