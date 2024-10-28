// src/models/CarritoModel.ts
import { db } from '../database/database';

interface Carrito {
  carrito_id?: number;
  client_id: number;
  token: string;
}

class CarritoModel {
  // Crear un nuevo carrito para un cliente
  async createCarrito(client_id: number, token: string): Promise<number> {
    const query = `
      INSERT INTO carrito (client_id, token)
      VALUES (?, ?)
    `;
    const [result] = await db.execute(query, [client_id, token]);
    return (result as any).insertId; // Retorna el ID del carrito creado
  }

  // Obtener el carrito por client_id
  async getCarritoByClientId(client_id: number): Promise<Carrito | null> {
    const query = `
      SELECT * FROM carrito
      WHERE client_id = ?
    `;
    const [rows] = await db.execute(query, [client_id]) as any[]; // Cast a `any[]` para acceder a los elementos
    return rows.length > 0 ? (rows[0] as Carrito) : null;
  }
}

export const carritoModel = new CarritoModel();
