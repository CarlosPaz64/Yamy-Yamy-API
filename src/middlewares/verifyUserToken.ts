import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'jwt_secret_key'; // Usa la misma clave que en el LoginController

export const verifyUserToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    // Extraer el token del encabezado
    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Agregar información del usuario decodificada a la solicitud
    req.body.userId = decoded.userId;

    // Continuar con la siguiente función
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
