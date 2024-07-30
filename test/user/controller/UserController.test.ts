import request from 'supertest';
import { Repository } from 'typeorm';
import app from '../../../src/app';
import { Book } from '../../../src/book/model/Book';
import { AppDataSource } from '../../../src/config/database';
import { User } from '../../../src/user/model/User';

describe('UserController', () => {
  let userRepository: Repository<User>;
  let bookRepository: Repository<Book>;

  beforeAll(async () => {
    await AppDataSource.initialize();

    userRepository = AppDataSource.getRepository(User);
    bookRepository = AppDataSource.getRepository(Book);
  });

  beforeEach(async () => {
    await userRepository.query(`TRUNCATE TABLE "user" CASCADE;`);
    await bookRepository.query(`TRUNCATE TABLE "book" CASCADE;`);
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
        error: expect.objectContaining({
          issues: expect.arrayContaining([expect.objectContaining({ message: 'User name is required!' })]),
        }),
      });
    });

    it('returns bad request when user name is an object', async () => {
      const response = await request(app).post('/users').send({ name: {} });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: expect.objectContaining({
          issues: expect.arrayContaining([expect.objectContaining({ message: 'User name must be a string!' })]),
        }),
      });
    });

    it('returns created when user name is john doe', async () => {
      const response = await request(app).post('/users').send({ name: 'john doe' }).expect(201);

      expect(response.status).toBe(201);
    });
  });

  describe('POST /users/:userId/borrow/:bookId', () => {
    it('returns bad request when user does not exist', async () => {
      const response = await request(app).post('/users/999/borrow/1').send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: {
          message: 'User#999 not found!',
        },
      });
    });

    it('returns bad request when book does not exist', async () => {
      const testUser1 = await userRepository.save({ name: 'Test User 1' });

      const response = await request(app).post(`/users/${testUser1.id}/borrow/999`).send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: {
          message: 'Book#999 not found!',
        },
      });
    });

    it('returns bad request when the book is already borrowed by another user', async () => {
      const testUser1 = await userRepository.save({ name: 'Test User 1', borrowedBooks: [] });
      const testUser2 = await userRepository.save({ name: 'Test User 1', borrowedBooks: [] });
      const testBook1 = await bookRepository.save({ name: 'Test Book 1' });
      testUser2.borrowedBooks.push(testBook1);
      testBook1.borrowedBy = testUser2;
      await userRepository.save(testUser2);
      await bookRepository.save(testBook1);

      const response = await request(app).post(`/users/${testUser1.id}/borrow/${testBook1.id}`).send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: {
          message: `Book#${testBook1.id} is already borrowed by another user!`,
        },
      });
    });

    it('returns bad request when the book is already borrowed by the user', async () => {
      const testUser1 = await userRepository.save({ name: 'Test User 1', borrowedBooks: [] });
      const testBook1 = await bookRepository.save({ name: 'Test Book 1' });
      testUser1.borrowedBooks.push(testBook1);
      testBook1.borrowedBy = testUser1;
      await userRepository.save(testUser1);
      await bookRepository.save(testBook1);

      const response = await request(app).post(`/users/${testUser1.id}/borrow/${testBook1.id}`).send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        timestamp: expect.any(String),
        error: {
          message: `Book#${testBook1.id} is already borrowed by the user!`,
        },
      });
    });

    it('returns no content when the book is successfully borrowed', async () => {
      const testUser1 = await userRepository.save({ name: 'Test User 1', borrowedBooks: [] });
      const testBook1 = await bookRepository.save({ name: 'Test Book 1' });

      const response = await request(app).post(`/users/${testUser1.id}/borrow/${testBook1.id}`).send();

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
