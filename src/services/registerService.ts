import { db } from '../database/database';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import { registerCliente } from '../models/registerModel';
import { Cliente } from '../models/registerModel';

const SECRET_KEY = 'tu_clave_secreta'; // Define tu clave secreta

export class RegisterService {

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

  static async registerUser(encryptedData: string): Promise<number> {
    const connection = await db.getConnection(); // Obtén la conexión a la base de datos

    try {
      // Inicia una transacción
      await connection.beginTransaction();

      // Desencriptamos los datos que llegan del frontend
      const decryptedData = this.desencriptarDatos(encryptedData);

      // Parseamos los datos desencriptados como JSON
      const { nombre_cliente, apellido_cliente, email, password_cliente, numero_telefono, calle, numero_exterior, numero_interior, colonia, ciudad, codigo_postal, descripcion } = JSON.parse(decryptedData);

      // Hashear la contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(password_cliente, 10); // 10 es el número de salt rounds

      // Creamos el objeto Cliente con los datos recibidos
      const newCliente: Cliente = {
        nombre_cliente,
        apellido_cliente,
        email,
        password_cliente: hashedPassword,
        numero_telefono,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        ciudad,
        codigo_postal, 
        descripcion
      };

      // Llamamos a la función del modelo para registrar al cliente
      const clientId = await registerCliente(newCliente);

      if (clientId === null) {
        throw new Error('Error al registrar el cliente.');
      }

      // Confirma la transacción (commit)
      await connection.commit();

      return clientId;
    } catch (error) {
      console.error('Error al registrar al usuario:', error);
      // Si ocurre un error, realiza rollback para revertir los cambios
      await connection.rollback();
      throw error;
    } finally {
      // Libera la conexión de vuelta al pool
      connection.release();
    }
  }
}
