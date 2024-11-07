import { registerUser } from '../../controllers/userController';
import { Request, Response } from 'express';
import { findUserByEmail, createUser } from '../../models/userModel';
import bcrypt from 'bcrypt';
import validator from 'validator';
// Mockeamos las dependencias
jest.mock('../models/userModel');
jest.mock('bcrypt');
jest.mock('validator');
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.json = jest.fn();
  res.status = jest.fn().mockReturnThis();
  return res as Response;
};
describe('registerUser', () => {
  it('should register a new user', async () => {
    const req: Partial<Request> = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      },
    };

    const mockUser = { id: 1, ...req.body };

    const res = mockResponse();

    (findUserByEmail as jest.Mock).mockResolvedValue(null);  // El usuario no existe
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('fakeSalt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (createUser as jest.Mock).mockResolvedValue(mockUser);

    await registerUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: expect.any(String),  // El token generado
    });
  });

  it('should return error if user already exists', async () => {
    const req: Partial<Request> = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      },
    };

    const res = mockResponse();

    (findUserByEmail as jest.Mock).mockResolvedValue({ id: 1, ...req.body });

    await registerUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User already exists',
    });
  });

  it('should return an error if email is invalid', async () => {
    const req: Partial<Request> = {
      body: {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      },
    };

    const res = mockResponse();

    (validator.isEmail as jest.Mock).mockReturnValue(false);  // Correo no válido

    await registerUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Please enter a valid email',
    });
  });

  it('should return an error if password is too short', async () => {
    const req: Partial<Request> = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'short',
      },
    };

    const res = mockResponse();

    await registerUser(req as Request, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Please enter a strong password',
    });
  });
});
