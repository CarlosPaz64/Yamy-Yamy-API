import bcrypt from 'bcrypt';
import { getClienteByEmail } from '../models/loginModel';

export class LoginService {
  static async loginUser(email: string, password: string): Promise<{ id: number }> {
    const cliente = await getClienteByEmail(email);

    if (!cliente) {
      throw new Error('Usuario no encontrado');
    }

    // Comparar la contraseña ingresada con la almacenada (hash) en la base de datos
    const passwordMatch = await bcrypt.compare(password, cliente.password_cliente);

    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }

    // Retorna el `client_id` en lugar de un booleano
    return { id: cliente.client_id! }; // Asumimos que `client_id` es siempre válido si el cliente existe
  }
}
