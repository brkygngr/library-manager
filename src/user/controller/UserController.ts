import { Request, Response } from 'express';
import { CreateUserRequest } from '../dto/CreateUserRequest';
import { ErrorResponse } from '../dto/ErrorResponse';
import { UserService } from '../service/UserService';
import { getUserParamsSchema, postUserBodySchema } from '../validation/UserValidation';

export interface UserControllerDependencies {
  readonly userService: UserService;
}

export class UserController {
  private readonly userService: UserService;

  constructor(dependencies: UserControllerDependencies) {
    this.userService = dependencies.userService;
  }

  async getUsers(_req: Request, res: Response) {
    const users = await this.userService.getUsers();

    res.json(users);
  }

  async getUser(req: Request, res: Response) {
    let userId: number;

    try {
      userId = getUserParamsSchema.parse(req.params).id;
    } catch (e) {
      console.error('Error while validating get user request params!', e);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: e,
      };

      res.status(400).json(errorResponse);
      return;
    }

    const user = await this.userService.getUser(userId);

    if (!user) {
      console.warn(`User#${userId} not found!`);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: {
          message: `User#${userId} not found!`,
        },
      };

      res.status(404).json(errorResponse);
      return;
    }

    res.json(user);
  }

  async postUser(req: Request, res: Response) {
    let user: CreateUserRequest;

    try {
      user = postUserBodySchema.parse(req.body);
    } catch (e) {
      console.error('Error while validating post user request body!', e);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: e,
      };

      res.status(400).json(errorResponse);
      return;
    }

    const created = await this.userService.createUser(user);

    res.status(201).json(created);
  }
}
