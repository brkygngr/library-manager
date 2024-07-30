import { Request, Response } from 'express';
import { BookService } from '../service/BookService';

export interface BookControllerDependencies {
  readonly bookService: BookService;
}

export class BookController {
  private readonly bookService: BookService;

  constructor(dependencies: BookControllerDependencies) {
    this.bookService = dependencies.bookService;
  }

  async getBooks(_req: Request, res: Response) {
    const books = await this.bookService.getBooks();

    res.json(books);
  }
}
