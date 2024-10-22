import jwt from 'jsonwebtoken';
import { ClienteModel, Cliente } from '../models/clienteModel'; // Importa el modelo de Cliente
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'my-secret-key'; // Llave secreta para AES
const JWT_SECRET = 'your-jwt-secret'; // Clave secreta para generar JWT

export class ClienteService {
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

  // Autenticar cliente por email y password
  static async autenticarCliente(encriptedEmail: string, encriptedPassword: string): Promise<{ token: string, cliente: Cliente }> {
    try {
      // Desencriptar el email y la password recibidos
      const email = this.desencriptarDatos(encriptedEmail);
      const password = this.desencriptarDatos(encriptedPassword);

      console.log('Email desencriptado:', email);
      console.log('Contraseña desencriptada:', password);

      // Llamar al modelo para obtener el cliente por email (sin pasar la contraseña)
      const cliente = await ClienteModel.obtenerPorEmail(email);  // Solo se pasa el email

      if (!cliente) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar la contraseña con bcrypt (comparando la contraseña desencriptada con la almacenada)
      const isPasswordCorrect = await bcrypt.compare(password, cliente.password_cliente);

      if (!isPasswordCorrect) {
        throw new Error('Credenciales inválidas');
      }

      // Generar el token JWT
      const token = jwt.sign({ clienteId: cliente.client_id, email: cliente.email }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Este será el token de la sesión: ', token);

      // Devolver el token y los datos del cliente (sin la contraseña)
      const { password_cliente, ...clienteData } = cliente;
      return { token, cliente: clienteData as Cliente };
    } catch (error) {
      throw new Error('Error al autenticar el cliente: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }
}
