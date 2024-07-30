import { Repository } from 'typeorm';
import { CreateBookRequest } from '../dto/CreateBookRequest';
import { Book } from '../model/Book';

export interface BookServiceDependencies {
  readonly bookRepository: Repository<Book>;
}

export class BookService {
  private readonly bookRepository: Repository<Book>;

  constructor(dependencies: BookServiceDependencies) {
    this.bookRepository = dependencies.bookRepository;
  }

  async getBooks() {
    return this.bookRepository.find();
  }

  async getBook(bookId: number) {
    return this.bookRepository.findOneBy({
      id: bookId,
    });
  }

  async createBook(book: CreateBookRequest) {
    return this.bookRepository.save(book);
  }
}
