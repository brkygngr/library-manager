import { Request, Response } from 'express';
import { ErrorResponse } from '../../error/dto/ErrorResponse';
import { BookService } from '../service/BookService';
import { getBookParamsSchema } from '../validation/BookValidation';

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

  async getBook(req: Request, res: Response) {
    let bookId: number;

    try {
      bookId = getBookParamsSchema.parse(req.params).id;
    } catch (e) {
      console.error('Error while validating get book request params!', e);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: e,
      };

      res.status(400).json(errorResponse);
      return;
    }

    const book = await this.bookService.getBook(bookId);

    if (!book) {
      console.warn(`Book#${bookId} not found!`);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: {
          message: `Book#${bookId} not found!`,
        },
      };

      res.status(404).json(errorResponse);
      return;
    }

    res.json(book);
  }
}
