import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, 'your-jwt-secret') as { adminId: string };
    req.adminId = decoded.adminId; // Esto debería funcionar si el tipo está correctamente extendido
    next(); // Llamamos a next si todo está bien
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
