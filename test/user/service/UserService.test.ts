import { Repository } from 'typeorm';
import { Book } from '../../../src/book/model/Book';
import { BookScore } from '../../../src/book/model/BookScore';
import { User } from '../../../src/user/model/User';
import { UserService } from '../../../src/user/service/UserService';

describe('UserService', () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let bookRepository: jest.Mocked<Repository<Book>>;
  let bookScoreRepository: jest.Mocked<Repository<BookScore>>;
  let userService: UserService;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<User>>> as jest.Mocked<Repository<User>>;
    bookRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<Book>>> as jest.Mocked<Repository<Book>>;
    bookScoreRepository = {
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<BookScore>>> as jest.Mocked<Repository<BookScore>>;

    userService = new UserService({ userRepository, bookRepository, bookScoreRepository });
  });

  describe('getUsers', () => {
    it('returns an empty array when there are no users', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('returns users when there are users', async () => {
      const user1 = new User();
      user1.id = 1;
      user1.name = 'Test User 1';
      const user2 = new User();
      user2.id = 2;
      user2.name = 'Test User 2';

      userRepository.find.mockResolvedValue([user1, user2]);

      const result = await userService.getUsers();

      expect(result.sort()).toEqual([
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ]);
    });
  });

  describe('getUser', () => {
    it('returns null when there are no users', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.getUser(-1);

      expect(result).toBeNull();
    });

    it('returns user id and name when the user exists', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';
      user.borrowedBooks = [];
      user.returnedBooks = [];

      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.getUser(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test User 1',
          books: {
            past: [],
            present: [],
          },
        }),
      );
    });

    it('returns user past books when user has returned books', async () => {
      const user = new User();
      const book = new Book();
      const bookScore = new BookScore();

      book.id = 1;
      book.name = 'Test Book 1';
      book.returnedByUsers = [user];

      user.id = 1;
      user.name = 'Test User 1';
      user.borrowedBooks = [];
      user.returnedBooks = [book];

      bookScore.id = 1;
      bookScore.book = book;
      bookScore.user = user;
      bookScore.value = 6.6;

      user.scores = [bookScore];
      book.scores = [bookScore];

      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.getUser(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test User 1',
          books: {
            past: [{ name: book.name, userScore: 6.6 }],
            present: [],
          },
        }),
      );
    });

    it('returns user present books when user has borrowed books', async () => {
      const user = new User();
      const book = new Book();

      book.id = 1;
      book.name = 'Test Book 1';
      book.returnedByUsers = [user];

      user.id = 1;
      user.name = 'Test User 1';
      user.borrowedBooks = [book];

      userRepository.findOne.mockResolvedValue(user);

      const result = await userService.getUser(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test User 1',
          books: {
            past: [],
            present: [{ name: book.name }],
          },
        }),
      );
    });
  });

  describe('createUser', () => {
    it('returns the created user when user is saved with name', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';

      userRepository.save.mockResolvedValue(user);

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
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';

      userRepository.findOne.mockResolvedValue(user);
      bookRepository.findOne.mockResolvedValue(null);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('Book#1 not found!');
    });

    it('throws an error when the book is already borrowed by another user', async () => {
      const user1 = new User();
      user1.id = 1;
      user1.name = 'Test User 1';

      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = user1;

      const user2 = new User();
      user2.id = 2;
      user2.name = 'Test User 2';

      userRepository.findOne.mockResolvedValue(user2);
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.borrowBook(2, 1)).rejects.toThrow('Book#1 is already borrowed by another user!');
    });

    it('throws an error when the book is already borrowed by the user', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';

      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = user;

      userRepository.findOne.mockResolvedValue(user);
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.borrowBook(1, 1)).rejects.toThrow('Book#1 is already borrowed by the user!');
    });

    it('borrows a book', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';

      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = null;

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
      const user = new User();
      user.id = 1;
      user.name = 'Test User 1';

      userRepository.findOne.mockResolvedValue(user);
      bookRepository.findOne.mockResolvedValue(null);

      await expect(userService.returnBook(1, 1, 0)).rejects.toThrow('Book#1 not found!');
    });

    it('throws an error when the book is not borrowed by the user', async () => {
      const user1 = new User();
      user1.id = 1;
      user1.name = 'Test User 1';

      const book = new Book();
      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = user1;

      const user2 = new User();
      user2.id = 2;
      user2.name = 'Test User 2';

      userRepository.findOne.mockResolvedValue(user2);
      bookRepository.findOne.mockResolvedValue(book);

      await expect(userService.returnBook(2, 1, 0)).rejects.toThrow(`Book#1 is not borrowed by the user!`);
    });

    it('returns the book', async () => {
      const user = new User();
      const book = new Book();

      book.id = 1;
      book.name = 'Test Book 1';
      book.borrowedBy = user;
      book.returnedByUsers = [];

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
