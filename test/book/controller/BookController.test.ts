import request from 'supertest';
import { Repository } from 'typeorm';
import app from '../../../src/app';
import { Book } from '../../../src/book/model/Book';
import { AppDataSource } from '../../../src/config/database';

describe('BookController', () => {
  let bookRepository: Repository<Book>;

  beforeAll(async () => {
    await AppDataSource.initialize();

    bookRepository = AppDataSource.getRepository(Book);
  });

  beforeEach(async () => {
    await bookRepository.clear();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('GET /books', () => {
    it('returns an empty array when there are no books', async () => {
      const response = await request(app).get('/books');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns books when there are books', async () => {
      const testBook1 = bookRepository.create({ name: 'Test Book 1' });
      const testBook2 = bookRepository.create({ name: 'Test Book 2' });

      await bookRepository.save([testBook1, testBook2]);

      const response = await request(app).get('/books');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'Test Book 1');
      expect(response.body[1]).toHaveProperty('name', 'Test Book 2');
    });
  });
});
