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

  describe('GET /books/:id', () => {
    it('returns a not found status when book is not found', async () => {
      const response = await request(app).get('/books/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: {
          message: 'Book#999 not found!',
        },
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when book id is negative', async () => {
      const response = await request(app).get('/books/-1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: [expect.objectContaining({ message: 'Book id must be a positive integer!' })],
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when book id is double', async () => {
      const response = await request(app).get('/books/1.23');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: [expect.objectContaining({ message: 'Book id must be a positive integer!' })],
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns a bad request status when book id is undefined', async () => {
      const response = await request(app).get('/books/undefined');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: expect.objectContaining({
          issues: expect.arrayContaining([expect.objectContaining({ message: 'Book id must be a number!' })]),
        }),
        timestamp: expect.any(String),
      });
    });

    it('returns the book when the book exists', async () => {
      const testBook1 = bookRepository.create({ name: 'Test Book 1' });

      await bookRepository.save([testBook1]);

      const response = await request(app).get('/books/' + testBook1.id);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testBook1);
    });
  });
});
