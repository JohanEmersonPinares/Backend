import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController';
import authMiddleware from '../middleware/auth';

const cartRouter = express.Router();

// Rutas para manejar el carrito de compras
cartRouter.post('/get', authMiddleware, getCart);
cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove', authMiddleware, removeFromCart);

export default cartRouter;
