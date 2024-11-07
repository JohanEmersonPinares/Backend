import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

// Mock de Stripe para no hacer llamadas reales a la API de Stripe
jest.mock('stripe');
const stripeMock = Stripe as jest.Mocked<typeof Stripe>;
stripeMock.prototype.checkout.sessions.create = jest.fn().mockResolvedValue({
  url: 'http://example.com'
});

describe('Order Controller Tests', () => {
  // Test para 'placeOrder'
  describe('POST /orders', () => {
    it('should place an order successfully', async () => {
      const mockOrderData = {
        userId: 1,
        items: [{ name: 'Pizza', price: 10, quantity: 2 }],
        amount: 20,
        address: '123 Main St'
      };

      const response = await request(app)
        .post('/orders')
        .send(mockOrderData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session_url).toBe('http://example.com');
    });

    it('should return error if required fields are missing', async () => {
      const mockOrderData = {
        userId: 1,
        items: [{ name: 'Pizza', price: 10, quantity: 2 }],
        amount: 20
        // Missing address
      };

      const response = await request(app)
        .post('/orders')
        .send(mockOrderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error');
    });
  });

  // Test para 'listOrders'
  describe('GET /orders', () => {
    it('should list all orders', async () => {
      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Test para 'userOrders'
  describe('GET /orders/user', () => {
    it('should list orders for a specific user', async () => {
      const mockUserId = 1;

      const response = await request(app)
        .get(`/orders/user`)
        .send({ userId: mockUserId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Test para 'updateStatus'
  describe('POST /orders/updateStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrderData = {
        orderId: 1,
        status: 'Shipped'
      };

      const response = await request(app)
        .post('/orders/updateStatus')
        .send(mockOrderData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Status Updated');
    });
  });

  // Test para 'verifyOrder'
  describe('POST /orders/verify', () => {
    it('should verify successful payment and update order', async () => {
      const mockVerifyData = {
        orderId: 1,
        success: 'true'
      };

      const response = await request(app)
        .post('/orders/verify')
        .send(mockVerifyData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Paid');
    });

    it('should delete the order if payment failed', async () => {
      const mockVerifyData = {
        orderId: 1,
        success: 'false'
      };

      const response = await request(app)
        .post('/orders/verify')
        .send(mockVerifyData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Not Paid');
    });
  });

  // Test para 'placeOrderCod'
  describe('POST /orders/placeOrderCod', () => {
    it('should place order with Cash on Delivery successfully', async () => {
      const mockOrderData = {
        userId: 1,
        items: [{ name: 'Pizza', price: 10, quantity: 2 }],
        amount: 20,
        address: '123 Main St'
      };

      const response = await request(app)
        .post('/orders/placeOrderCod')
        .send(mockOrderData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order Placed');
    });
  });
});
