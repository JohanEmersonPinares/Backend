import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware de autenticación
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del encabezado 'Authorization'

    if (!token) {
        res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
        return; // Salir de la función después de enviar la respuesta
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.userId = (token_decode as { id: string }).id; // Añadir userId a req.body
        next(); // Llamar a la siguiente función middleware
    } catch (error) {
        res.status(400).json({ success: false, message: (error as Error).message });
        return; // Salir de la función después de enviar la respuesta
    }
};

export default authMiddleware;
