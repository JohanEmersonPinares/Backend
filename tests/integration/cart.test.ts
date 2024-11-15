import request from 'supertest';
import app from '../../src/app'; // Ruta correcta según la estructura de tu proyecto
import { describe, it, expect } from 'vitest';

describe('Cart API Endpoints', () => {
  let token: string;
  const testUserId = '5'; // Reemplaza con un valor válido
  const testItemId = '2'; // Reemplaza con un valor válido

  beforeAll(async () => {
    // Obtén el token de autenticación para usarlo en las pruebas
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'usergreatstack@gmail.com', password: '12345678' }); // Usa credenciales válidas

    token = response.body.token;
  });

  it('should add an item to the cart', async () => {
    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: testUserId, itemId: testItemId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Added To Cart');
  });

  it('should get the user cart', async () => {
    const response = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: testUserId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.cartData).toHaveProperty(testItemId.toString());
  });

  it('should remove an item from the cart', async () => {
    const response = await request(app)
      .post('/api/cart/remove')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: testUserId, itemId: testItemId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Removed From Cart');
  });
});
