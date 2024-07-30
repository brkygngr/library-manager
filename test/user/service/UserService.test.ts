import { Repository } from 'typeorm';
import { User } from '../../../src/user/model/User';
import { UserService } from '../../../src/user/service/UserService';

describe('UserService', () => {
  let userRepository: jest.Mocked<Repository<User>>;
  let userService: UserService;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
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

  describe('getUser', () => {
    it('returns null when there are no users', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.getUser(-1);

      expect(result).toBeNull();
    });

    it('returns user id and name when the user exists', async () => {
      userRepository.findOneBy.mockResolvedValue({ id: 1, name: 'Test User 1' });

      const result = await userService.getUser(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test User 1',
        }),
      );
    });
  });

  describe('createUser', () => {
    it('returns the created user when user is saved with name', async () => {
      userRepository.save.mockResolvedValue({
        id: 1,
        name: 'Test User 1',
      });

      const result = await userService.createUser({ name: 'Test User 1' });

      expect(result).toEqual({
        id: 1,
        name: 'Test User 1',
      });
      expect(userRepository.save).toHaveBeenCalledWith({ name: 'Test User 1' });
    });
  });
});
