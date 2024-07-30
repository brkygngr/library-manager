import express from 'express';
import { BookController } from '../book/controller/BookController';
import { Book } from '../book/model/Book';
import { BookService } from '../book/service/BookService';
import { AppDataSource } from '../config/database';

const bookService = new BookService({
  bookRepository: AppDataSource.getRepository(Book),
});

const bookController = new BookController({
  bookService,
});

const router = express.Router();

router.get('/', (req, res) => bookController.getBooks(req, res));

export default router;
