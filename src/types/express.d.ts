// src/types/express/index.d.ts (Asegúrate de que la ruta sea correcta)
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      adminId?: string;  // Aquí extendemos la Request para incluir adminId
    }
  }
}
