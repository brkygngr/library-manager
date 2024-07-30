import { Repository } from 'typeorm';
import { Book } from '../../../src/book/model/Book';
import { BookService } from '../../../src/book/service/BookService';

describe('BookService', () => {
  let bookRepository: jest.Mocked<Repository<Book>>;
  let bookService: BookService;

  beforeEach(() => {
    bookRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<Book>>> as jest.Mocked<Repository<Book>>;

    bookService = new BookService({ bookRepository });
  });

  describe('getBooks', () => {
    it('returns an empty array when there are no books', async () => {
      bookRepository.find.mockResolvedValue([]);

      const result = await bookService.getBooks();

      expect(result).toEqual([]);
    });

    it('returns books when there are books', async () => {
      bookRepository.find.mockResolvedValue([
        { id: 1, name: 'Test Book 1' },
        { id: 2, name: 'Test Book 2' },
      ]);

      const result = await bookService.getBooks();

      expect(result).toEqual([
        { id: 1, name: 'Test Book 1' },
        { id: 2, name: 'Test Book 2' },
      ]);
    });
  });

  describe('getBook', () => {
    it('returns null when there are no books', async () => {
      bookRepository.findOneBy.mockResolvedValue(null);

      const result = await bookService.getBook(-1);

      expect(result).toBeNull();
    });

    it('returns book id and name when the book exists', async () => {
      bookRepository.findOneBy.mockResolvedValue({ id: 1, name: 'Test Book 1' });

      const result = await bookService.getBook(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test Book 1',
        }),
      );
    });
  });

  describe('createBook', () => {
    it('returns the created book when book is saved with name', async () => {
      bookRepository.save.mockResolvedValue({
        id: 1,
        name: 'Test Book 1',
      });

      const result = await bookService.createBook({ name: 'Test Book 1' });

      expect(result).toEqual({
        id: 1,
        name: 'Test Book 1',
      });
      expect(bookRepository.save).toHaveBeenCalledWith({ name: 'Test Book 1' });
    });
  });
});
