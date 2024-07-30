import { Repository } from 'typeorm';
import { Book } from '../../../src/book/model/Book';
import { User } from '../../../src/user/model/User';
import { UserService } from '../../../src/user/service/UserService';

describe('UserService', () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let bookRepository: jest.Mocked<Repository<Book>>;
  let userService: UserService;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<User>>> as jest.Mocked<Repository<User>>;
    bookRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<Book>>> as jest.Mocked<Repository<Book>>;

    userService = new UserService({ userRepository, bookRepository });
  });

  describe('getUsers', () => {
    it('returns an empty array when there are no users', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('returns users when there are users', async () => {
      userRepository.find.mockResolvedValue([
        { id: 1, name: 'Test User 1', borrowedBooks: [], returnedBooks: [] },
        { id: 1, name: 'Test User 2', borrowedBooks: [], returnedBooks: [] },
      ]);

      const result = await userService.getUsers();

      expect(result).toEqual([
        { id: 1, name: 'Test User 1', borrowedBooks: [], returnedBooks: [] },
        { id: 1, name: 'Test User 2', borrowedBooks: [], returnedBooks: [] },
      ]);
    });
  });

  describe('getUser', () => {
    it('returns null when there are no users', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.getUser(-1);

      expect(result).toBeNull();
    });

    it('returns user id and name when the user exists', async () => {
      userRepository.findOneBy.mockResolvedValue({ id: 1, name: 'Test User 1', borrowedBooks: [], returnedBooks: [] });

      const result = await userService.getUser(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test User 1',
        }),
      );
    });
  });

  describe('createUser', () => {
    it('returns the created user when user is saved with name', async () => {
      userRepository.save.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      });

      const result = await userService.createUser({ name: 'Test User 1' });

      expect(result).toEqual({
        id: 1,
        name: 'Test User 1',
      });
      expect(userRepository.save).toHaveBeenCalledWith({ name: 'Test User 1' });
    });
  });

  describe('borrowBook', () => {
    it('throws an error when the user is null', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('User#1 not found!');
    });

    it('throws an error when the book is null', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      });
      bookRepository.findOne.mockResolvedValue(null);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('Book#1 not found!');
    });

    it('throws an error when the book is already borrowed by another user', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = { id: 2, name: 'Test User 2', borrowedBooks: [], returnedBooks: [] };
      book.returnedByUsers = [];

      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      });
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('Book#1 is already borrowed by another user!');
    });

    it('throws an error when the book is already borrowed by the user', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = { id: 1, name: 'Test User 1', borrowedBooks: [], returnedBooks: [] };
      book.returnedByUsers = [];

      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [book],
        returnedBooks: [],
      });
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('Book#1 is already borrowed by the user!');
    });

    it('borrows a book', async () => {
      const user = {
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      };
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = null;
      book.returnedByUsers = [];

      userRepository.findOne.mockResolvedValue(user);
      bookRepository.findOne.mockResolvedValue(book);

      const result = await userService.borrowBook(1, 1);

      expect(result.id).toEqual(user.id);
      expect(result.name).toEqual(user.name);
      expect(result.borrowedBooks).toContain(book);
      expect(book.borrowedBy).toBe(user);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(bookRepository.save).toHaveBeenCalledWith(book);
    });
  });

  describe('returnBook', () => {
    it('throws an error when the user is null', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.returnBook(1, 1, 0)).rejects.toThrow('User#1 not found!');
    });

    it('throws an error when the book is null', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      });
      bookRepository.findOne.mockResolvedValue(null);

      await expect(userService.returnBook(1, 1, 0)).rejects.toThrow('Book#1 not found!');
    });

    it('throws an error when the book is not borrowed by the user', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = { id: 2, name: 'Test User 2', borrowedBooks: [], returnedBooks: [] };
      book.returnedByUsers = [];

      userRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [],
      });
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.returnBook(1, 1, 0)).rejects.toThrow(`Book#1 is not borrowed by the user!`);
    });

    it('returns the book', async () => {
      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = { id: 1, name: 'Test User 1', borrowedBooks: [], returnedBooks: [] };
      book.returnedByUsers = [];

      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';
      user.borrowedBooks = [book];
      user.returnedBooks = [];

      userRepository.findOne.mockResolvedValue(user);
      bookRepository.findOne.mockResolvedValue(book);

      const result = await userService.returnBook(1, 1, 0);

      expect(result).toEqual({
        id: 1,
        name: 'Test User 1',
        borrowedBooks: [],
        returnedBooks: [book],
      });
    });
  });
});
