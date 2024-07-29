import request from 'supertest';
import { AppDataSource } from '../../src/config/database';
import app from '../../src/app';
import { User } from '../../src/model/User';

describe('UserController', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('GET /users', () => {
    it('returns an empty array when there are no users', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns users when there are users', async () => {
      const userRepository = AppDataSource.getRepository(User);

      const testUser1 = userRepository.create({ name: 'Test User 1' });
      const testUser2 = userRepository.create({ name: 'Test User 2' });

      await userRepository.save([testUser1, testUser2]);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Test User 1');
      expect(response.body[1]).toHaveProperty('name', 'Test User 2');

      await userRepository.remove([testUser1, testUser2]);
    });
  });
});
