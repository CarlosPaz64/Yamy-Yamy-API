import jwt from 'jsonwebtoken';

const JWT_SECRET = 'jwt_secret_key';

export const verifyUserToken = (req: any, res: any, next: any): void => {
  try {
    let token;

    // Verificar si el token está en la sesión
    if (req.session && req.session.token) {
      token = req.session.token;
    }

    // Si no hay token en la sesión, verificar en los headers
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // Si no se encontró el token, devolver error
    if (!token) {
      console.error('Token no encontrado en sesión ni en headers');
      return res.status(401).json({ message: 'Token no proporcionado o inválido' });
    }

    // Decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Colocar el `userId` en `req.user`
    req.user = { id: decoded.userId };

    console.log('Token decodificado con userId:', decoded.userId); // Debug
    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    console.error('Error al verificar el token:', (error as any).message || error);
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
