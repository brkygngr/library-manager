import { Repository } from 'typeorm';
import { Book } from '../model/Book';

export interface BookServiceDependencies {
  readonly bookRepository: Repository<Book>;
}

export class BookService {
  private readonly bookRepository: Repository<Book>;

  constructor(dependencies: BookServiceDependencies) {
    this.bookRepository = dependencies.bookRepository;
  }

  async getBooks(): Promise<Book[]> {
    return this.bookRepository.find();
  }
}
