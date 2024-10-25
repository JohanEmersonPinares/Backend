import userModel from '../models/userModel';
import { Request, Response } from 'express';

// Define la interfaz para los datos del carrito
interface CartData {
    [itemId: string]: number; // Clave: ID del ítem, Valor: cantidad
}

// Define la interfaz para el modelo de usuario
interface User {
    _id: string;
    cartData: CartData;
}

// add to user cart
const addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = await userModel.findOne<User>({ _id: req.body.userId });
        if (!userData) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        let cartData = userData.cartData;

        // Verifica y actualiza el carrito
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// remove food from user cart
const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = await userModel.findById<User>(req.body.userId);
        if (!userData) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        let cartData = userData.cartData;

        // Verifica y actualiza el carrito
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

// get user cart
const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = await userModel.findById<User>(req.body.userId);
        if (!userData) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        let cartData = userData.cartData;
        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error" });
    }
};

export { addToCart, removeFromCart, getCart };
