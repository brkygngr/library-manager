import express from 'express';
import { Book } from '../book/model/Book';
import { AppDataSource } from '../config/database';
import { UserController } from '../user/controller/UserController';
import { User } from '../user/model/User';
import { UserService } from '../user/service/UserService';
import { BookScore } from '../book/model/BookScore';

const userService = new UserService({
  userRepository: AppDataSource.getRepository(User),
  bookRepository: AppDataSource.getRepository(Book),
  bookScoreRepository: AppDataSource.getRepository(BookScore),
});

const userController = new UserController({
  userService,
});

const router = express.Router();

router.get('/', (req, res) => userController.getUsers(req, res));
router.get('/:id', (req, res) => userController.getUser(req, res));
router.post('/', (req, res) => userController.postUser(req, res));
router.post('/:userId/borrow/:bookId', (req, res) => userController.postBorrowBook(req, res));
router.post('/:userId/return/:bookId', (req, res) => userController.postReturnBook(req, res));

export default router;
