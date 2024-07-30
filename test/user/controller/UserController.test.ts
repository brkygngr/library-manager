import request from 'supertest';
import { Repository } from 'typeorm';
import { User } from '../../../src/user/model/User';
import { AppDataSource } from '../../../src/config/database';
import app from '../../../src/app';

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

  describe('GET /users/:id', () => {
    it('returns a not found status when user is not found', async () => {
      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: 'User#999 not found!',
        },
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when user id is negative', async () => {
      const response = await request(app).get('/users/-1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: [expect.objectContaining({ message: 'User id must be a positive integer!' })],
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when user id is double', async () => {
      const response = await request(app).get('/users/1.23');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: [expect.objectContaining({ message: 'User id must be a positive integer!' })],
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when user id is undefined', async () => {
      const response = await request(app).get('/users/undefined');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: expect.arrayContaining([expect.objectContaining({ message: 'User id must be a number!' })]),
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns the user when the user exists', async () => {
      const testUser1 = userRepository.create({ name: 'Test User 1' });

      await userRepository.save([testUser1]);

      const response = await request(app).get('/users/' + testUser1.id);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testUser1);
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
