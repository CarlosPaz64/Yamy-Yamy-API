import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; // Asegúrate de detener la ejecución aquí
  }

  try {
    const decoded = jwt.verify(token, 'your-jwt-secret') as { adminId: string };
    res.locals.adminId = decoded.adminId; // Usamos res.locals para almacenar el adminId
    next(); // Continua el flujo si el token es válido
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return; // Detenemos la ejecución
  }
};
