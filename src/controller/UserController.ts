import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../model/User';
import { UserService } from '../service/UserService';

const userService = new UserService({
  userRepository: AppDataSource.getRepository(User),
});

export const getUsers = async (_req: Request, res: Response) => {
  const users = await userService.getUsers();

  res.json(users);
};
