import request from 'supertest';
import app from '../../src/app';

// Mocking de Prisma y fs para evitar interacción con la base de datos real
jest.mock('../config/db', () => ({
  food: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  }
}));
jest.mock('fs', () => ({
  unlink: jest.fn(),
}));

describe('FoodController', () => {
  describe('GET /foods', () => {
    it('should return a list of foods', async () => {
      const mockFoods = [
        { id: 1, name: 'Pizza', price: 12.5, category: 'Fast Food' },
        { id: 2, name: 'Burger', price: 10.0, category: 'Fast Food' },
      ];
      require('../config/db').food.findMany.mockResolvedValue(mockFoods);

      const response = await request(app).get('/foods');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Pizza');
    });
  });

  describe('POST /food', () => {
    it('should add a food item', async () => {
      const mockFood = { id: 1, name: 'Pizza', price: 12.5, category: 'Fast Food', image: 'pizza.jpg' };
      const foodData = {
        name: 'Pizza',
        price: '12.5',
        category: 'Fast Food',
        description: 'Delicious pizza',
      };

      require('../config/db').food.create.mockResolvedValue(mockFood);

      const response = await request(app)
        .post('/food')
        .field('name', foodData.name)
        .field('price', foodData.price)
        .field('category', foodData.category)
        .field('description', foodData.description)
        .attach('image', 'path/to/mock-image.jpg'); // Asegúrate de usar un archivo de prueba adecuado

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Pizza');
    });

    it('should return error if file is missing', async () => {
      const response = await request(app)
        .post('/food')
        .send({
          name: 'Pizza',
          price: '12.5',
          category: 'Fast Food',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Image file is required.');
    });
  });

  describe('DELETE /food', () => {
    it('should remove a food item', async () => {
      const mockFood = { id: 1, name: 'Pizza', price: 12.5, category: 'Fast Food', image: 'pizza.jpg' };
      require('../config/db').food.findUnique.mockResolvedValue(mockFood);
      require('../config/db').food.delete.mockResolvedValue(mockFood);

      const response = await request(app)
        .delete('/food')
        .send({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Food Removed');
    });

    it('should return error if food not found', async () => {
      require('../config/db').food.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/food')
        .send({ id: '1' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Food not found.');
    });
  });
});
