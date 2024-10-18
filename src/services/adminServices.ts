import jwt from 'jsonwebtoken';
import { AdministradorModel, Administrador } from '../models/adminModel';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'my-secret-key'; // Llave secreta para AES
const JWT_SECRET = 'your-jwt-secret'; // Clave secreta para generar JWT

export class AdministradorService {
  // Desencriptar los datos
  static desencriptarDatos(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, { 
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Error al desencriptar los datos. Datos desencriptados vacíos.');
      }

      return decryptedData;
    } catch (error) {
      console.error('Error al desencriptar los datos:', error);
      throw error;
    }
  }

  // Autenticar administrador por username y password
  static async autenticarAdministrador(encriptedUsername: string, encriptedPassword: string): Promise<{ token: string, admin: Administrador }> {
    try {
      // Desencriptar el username y el password recibidos
      const username = this.desencriptarDatos(encriptedUsername);
      const password = this.desencriptarDatos(encriptedPassword);

      console.log('Usuario desencriptado:', username);
      console.log('Contraseña desencriptada:', password);

      // Llamar al modelo para obtener el administrador por username
      const admin = await AdministradorModel.obtenerPorUsername(username);

      if (!admin) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar la contraseña con bcrypt
      const isPasswordCorrect = await bcrypt.compare(password, admin.password_admin);

      if (!isPasswordCorrect) {
        throw new Error('Credenciales inválidas');
      }

      // Generar el token JWT
      const token = jwt.sign({ adminId: admin.admin_id, username: admin.username }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Este será el token de la sesión: ', token);

      // Devolver el token y los datos del admin (sin la contraseña)
      const { password_admin, ...adminData } = admin;
      return { token, admin: adminData as Administrador };
    } catch (error) {
      throw new Error('Error al autenticar el administrador: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}
