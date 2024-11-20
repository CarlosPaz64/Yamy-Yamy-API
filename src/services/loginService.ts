import bcrypt from 'bcrypt';
import { getClienteByEmail, getNombreApellidoById } from '../models/loginModel';

export class LoginService {
  static async loginUser(email: string, password: string): Promise<{ id: number; nombre: string; apellido: string }> {
    // Obtén el cliente por email
    const cliente = await getClienteByEmail(email);

    if (!cliente) {
      throw new Error('Usuario no encontrado');
    }

    // Comparar la contraseña ingresada con la almacenada (hash) en la base de datos
    const passwordMatch = await bcrypt.compare(password, cliente.password_cliente);

    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }

    // Obtén el nombre y apellido del cliente por su ID
    const clienteInfo = await getNombreApellidoById(cliente.client_id!);

    if (!clienteInfo) {
      throw new Error('Información del cliente no encontrada');
    }

    // Retorna el `client_id`, `nombre_cliente` y `apellido_cliente`
    return {
      id: cliente.client_id!,
      nombre: clienteInfo.nombre_cliente,
      apellido: clienteInfo.apellido_cliente,
    };
  }
}
