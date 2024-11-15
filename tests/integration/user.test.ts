import { loginUser } from '../../controllers/userController';
import { Request, Response } from 'express';
import { findUserByEmail } from '../../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mockeamos las dependencias
jest.mock('../models/userModel');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

// Creamos un mock para las respuestas
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.json = jest.fn();
  res.status = jest.fn().mockReturnThis();
  return res as Response;
};

describe('loginUser', () => {
  it('should return a token when credentials are correct', async () => {
    // Datos simulados
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),  // Encriptar la contraseña
    };

    const req: Partial<Request> = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };

    // Simulamos que el usuario existe en la base de datos
    (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    // Simulamos que la comparación de contraseñas es correcta
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    // Simulamos la creación del token
    (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

    const res = mockResponse();

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'fake-jwt-token',
      userId: 1,
    });
  });

  it('should return an error if user does not exist', async () => {
    const req: Partial<Request> = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password123',
      },
    };

    const res = mockResponse();

    (findUserByEmail as jest.Mock).mockResolvedValue(null);  // Simulamos que no existe el usuario

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User doesn't exist",
    });
  });

  it('should return an error if password is incorrect', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    };

    const req: Partial<Request> = {
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    };

    const res = mockResponse();

    (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);  // Contraseña incorrecta

    await loginUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid credentials',
    });
  });
});
