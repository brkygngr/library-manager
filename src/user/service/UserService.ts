import { Repository } from 'typeorm';
import { CreateUserRequest } from '../dto/CreateUserRequest';
import { User } from '../model/User';

export interface UserServiceDependencies {
  readonly userRepository: Repository<User>;
}

export class UserService {
  private readonly userRepository: Repository<User>;

  constructor(dependencies: UserServiceDependencies) {
    this.userRepository = dependencies.userRepository;
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async createUser(user: CreateUserRequest) {
    return this.userRepository.save(user);
  }
}
