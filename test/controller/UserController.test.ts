import request from 'supertest';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { User } from '../../src/user/model/User';
import { Repository } from 'typeorm';

describe('UserController', () => {
  let userRepository: Repository<User>;

  beforeAll(async () => {
    await AppDataSource.initialize();

    userRepository = AppDataSource.getRepository(User);
  });

  beforeEach(async () => {
    await userRepository.clear();
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
      const testUser1 = userRepository.create({ name: 'Test User 1' });
      const testUser2 = userRepository.create({ name: 'Test User 2' });

      await userRepository.save([testUser1, testUser2]);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Test User 1');
      expect(response.body[1]).toHaveProperty('name', 'Test User 2');
    });
  });

  describe('POST /users', () => {
    it('returns bad request when request body is an empty object', async () => {
      const response = await request(app).post('/users').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: expect.any(Object),
      });
    });

    it('returns bad request when user name is an object', async () => {
      const response = await request(app).post('/users').send({ name: {} });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: expect.any(Object),
      });
    });

    it('returns ok when user name is john doe', async () => {
      const response = await request(app).post('/users').send({ name: 'john doe' }).expect(201);

      expect(response.body).toEqual({
        id: expect.any(Number),
        name: 'john doe',
      });
    });
  });
});
