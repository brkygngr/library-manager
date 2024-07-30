import { Request, Response } from 'express';
import { CreateUserRequest } from '../dto/CreateUserRequest';
import { ErrorResponse } from '../../error/dto/ErrorResponse';
import { UserService } from '../service/UserService';
import {
  getUserParamsSchema,
  PostBorrowBookParams,
  postBorrowBookParamsSchema,
  postUserBodySchema,
} from '../validation/UserValidation';

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

    await this.userService.createUser(user);

    res.status(201).send();
  }

  async postBorrowBook(req: Request, res: Response) {
    let params: PostBorrowBookParams;

    try {
      params = postBorrowBookParamsSchema.parse(req.params);
    } catch (e) {
      console.error('Error while validating post borrow book request params!', e);

      const errorResponse: ErrorResponse = {
        timestamp: Date.now().toString(),
        error: e,
      };

      res.status(400).json(errorResponse);
      return;
    }

    try {
      await this.userService.borrowBook(params.userId, params.bookId);
    } catch (e) {
      console.error(`User#${params.userId} encountered error while borrowing book#${params.bookId}!`, e);

      const errorResponse: ErrorResponse = ErrorResponse.fromError(
        e,
        `User#${params.userId} encountered error while borrowing book#${params.bookId}!`,
      );

      res.status(400).json(errorResponse);
      return;
    }

    res.status(204).send();
  }
}
