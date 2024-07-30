import { Repository } from 'typeorm';
import { CreateBookRequest } from '../dto/CreateBookRequest';
import { GetBookResponse } from '../dto/GetBookResponse';
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

  async getBook(bookId: number): Promise<GetBookResponse | null> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['scores'],
    });

    if (!book) {
      return null;
    }

    if (!book.scores || book.scores.length === 0) {
      return {
        id: book.id,
        name: book.name,
        score: -1,
      };
    }

    const totalScore = book.scores.reduce((sum, score) => sum + score.value, 0);

    return {
      id: book.id,
      name: book.name,
      score: totalScore / book.scores.length,
    };
  }

  async createBook(book: CreateBookRequest) {
    return this.bookRepository.save(book);
  }
}
