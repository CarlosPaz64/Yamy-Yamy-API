import bcrypt from 'bcrypt';
import { getClienteByEmail } from '../models/loginModel';

export class LoginService {
  static async loginUser(email: string, password: string): Promise<boolean> {
    const cliente = await getClienteByEmail(email);

    if (!cliente) {
      throw new Error('Usuario no encontrado');
    }

    // Comparar la contraseña ingresada con la almacenada (hash) en la base de datos
    const passwordMatch = await bcrypt.compare(password, cliente.password_cliente);

    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }

    return true; // Login exitoso
  }
}
