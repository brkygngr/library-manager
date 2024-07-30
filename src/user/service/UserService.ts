import { Repository } from 'typeorm';
import { Book } from '../../book/model/Book';
import { CreateUserRequest } from '../dto/CreateUserRequest';
import { CreateUserResponse } from '../dto/CreateUserResponse';
import { GetUsersResponse } from '../dto/GetUsersResponse';
import { User } from '../model/User';

export interface UserServiceDependencies {
  readonly userRepository: Repository<User>;
  readonly bookRepository: Repository<Book>;
}

export class UserService {
  private readonly userRepository: Repository<User>;
  private readonly bookRepository: Repository<Book>;

  constructor(dependencies: UserServiceDependencies) {
    this.userRepository = dependencies.userRepository;
    this.bookRepository = dependencies.bookRepository;
  }

  async getUsers(): Promise<GetUsersResponse[]> {
    const users = await this.userRepository.find();

    return users.map((user) => ({ id: user.id, name: user.name }));
  }

  async getUser(userId: number) {
    return this.userRepository.findOneBy({
      id: userId,
    });
  }

  async createUser(user: CreateUserRequest): Promise<CreateUserResponse> {
    const created = await this.userRepository.save(user);

    return { id: created.id, name: created.name };
  }

  async borrowBook(userId: number, bookId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['borrowedBooks'],
    });

    if (!user) {
      throw new Error(`User#${userId} not found!`);
    }

    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['borrowedBy'],
    });

    if (!book) {
      throw new Error(`Book#${bookId} not found!`);
    }

    if (book.isBorrowed()) {
      if (book.isBorrowedByUser(userId)) {
        throw new Error(`Book#${bookId} is already borrowed by the user!`);
      } else {
        throw new Error(`Book#${bookId} is already borrowed by another user!`);
      }
    }

    user.borrowedBooks.push(book);
    book.borrowedBy = user;

    await this.bookRepository.save(book);
    await this.userRepository.save(user);

    return user;
  }

  async returnBook(userId: number, bookId: number, score: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['borrowedBooks', 'returnedBooks'],
    });

    if (!user) {
      throw new Error(`User#${userId} not found!`);
    }

    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['borrowedBy', 'returnedByUsers'],
    });

    if (!book) {
      throw new Error(`Book#${bookId} not found!`);
    }

    if (!book.isBorrowed() || !book.isBorrowedByUser(userId)) {
      throw new Error(`Book#${bookId} is not borrowed by the user!`);
    }

    book.borrowedBy = null;
    book.addScore(score);
    book.returnedByUsers.push(user);

    user.borrowedBooks = user.borrowedBooks.filter((b) => b.id !== bookId);
    user.returnedBooks.push(book);

    await this.bookRepository.save(book);
    await this.userRepository.save(user);

    return user;
  }
}
