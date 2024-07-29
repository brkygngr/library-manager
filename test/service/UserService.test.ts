import { Repository } from 'typeorm';
import { User } from '../../src/user/model/User';
import { UserService } from '../../src/user/service/UserService';

describe('UserService', () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let userService: UserService;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
    } as Partial<jest.Mocked<Repository<User>>> as jest.Mocked<Repository<User>>;

    userService = new UserService({ userRepository });
  });

  describe('getUsers', () => {
    it('returns an empty array when there are no users', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });

    it('returns users when there are users', async () => {
      userRepository.find.mockResolvedValue([
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ]);

      const result = await userService.getUsers();

      expect(result).toEqual([
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ]);
    });
  });
});
