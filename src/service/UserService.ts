import { Repository } from 'typeorm';
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
}
