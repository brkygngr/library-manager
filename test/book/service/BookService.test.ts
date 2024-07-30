import { Repository } from 'typeorm';
import { Book } from '../../../src/book/model/Book';
import { BookScore } from '../../../src/book/model/BookScore';
import { BookService } from '../../../src/book/service/BookService';

describe('BookService', () => {
  let bookRepository: jest.Mocked<Repository<Book>>;
  let bookService: BookService;

  beforeEach(() => {
    bookRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
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
      bookRepository.findOne.mockResolvedValue(null);

      const result = await bookService.getBook(-1);

      expect(result).toBeNull();
    });

    it('returns book id and name when the book exists', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';

      bookRepository.findOne.mockResolvedValue(book);

      const result = await bookService.getBook(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test Book 1',
        }),
      );
    });

    it('returns book avg score when the book has scores', async () => {
      const bookScore1 = new BookScore();
      bookScore1.value = 4;
      const bookScore2 = new BookScore();
      bookScore2.value = 7;
      const bookScore3 = new BookScore();
      bookScore3.value = 7;

      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.scores = [bookScore1, bookScore2, bookScore3];

      bookRepository.findOne.mockResolvedValue(book);

      const result = await bookService.getBook(1);

      expect(result).toEqual(
        expect.objectContaining({
          score: 6,
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
