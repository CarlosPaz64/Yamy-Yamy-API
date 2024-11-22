import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'jwt_secret_key';

export const verifyUserToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token no proporcionado o inválido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    req.body.userId = decoded.userId; // Agregar el userId al cuerpo de la solicitud
    next(); // Continuar con el siguiente middleware o controlador
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
