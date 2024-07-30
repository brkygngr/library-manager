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
      const testBook1 = new Book();
      testBook1.id = 1;
      testBook1.name = 'Test Book 1';
      const testBook2 = new Book();
      testBook2.id = 2;
      testBook2.name = 'Test Book 2';
      bookRepository.find.mockResolvedValue([testBook1, testBook2]);

      const result = await bookService.getBooks();

      expect(result.sort()).toEqual([testBook1, testBook2]);
    });
  });

  describe('getBook', () => {
    it('returns null when there are no books', async () => {
      bookRepository.findOneBy.mockResolvedValue(null);

      const result = await bookService.getBook(-1);

      expect(result).toBeNull();
    });

    it('returns book id and name when the book exists', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';

      bookRepository.findOneBy.mockResolvedValue(book);

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
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';

      bookRepository.save.mockResolvedValue(book);

      const result = await bookService.createBook({ name: 'Test Book 1' });

      expect(result).toEqual(book);
      expect(bookRepository.save).toHaveBeenCalledWith({ name: 'Test Book 1' });
    });
  });
});
