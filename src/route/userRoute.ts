import express from 'express';
import { AppDataSource } from '../config/database';
import { UserController } from '../user/controller/UserController';
import { User } from '../user/model/User';
import { UserService } from '../user/service/UserService';

const userService = new UserService({
  userRepository: AppDataSource.getRepository(User),
});

const userController = new UserController({
  userService,
});

const router = express.Router();

router.get('/', (req, res) => userController.getUsers(req, res));
router.get('/:id', (req, res) => userController.getUser(req, res));
router.post('/', (req, res) => userController.postUser(req, res));

export default router;
