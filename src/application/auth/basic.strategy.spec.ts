import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminStrategy } from './basic.strategy';

jest.mock('../../config/auth.config');
import authConfig from '../../config/auth.config';

describe('Admin Basic Strategy', () => {
  describe('No admin password defined in config', () => {
    let adminStrategy: AdminStrategy;

    beforeEach(async () => {
      (authConfig as unknown as jest.Mock).mockReturnValue({
        adminPassword: undefined,
      });
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ load: [authConfig] })],
        providers: [AdminStrategy],
      }).compile();

      adminStrategy = module.get<AdminStrategy>(AdminStrategy);
    });

    it('should throw an error if admin password is not defined in config', () => {
      expect(() => adminStrategy.validate('admin', 'password')).toThrowError(
        'Admin password is not defined in config',
      );
    });
  });

  describe('Admin password defined', () => {
    let adminStrategy: AdminStrategy;

    beforeEach(async () => {
      (authConfig as unknown as jest.Mock).mockReturnValue({
        adminPassword: 'adminPassword',
      });
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ load: [authConfig] })],
        providers: [AdminStrategy],
      }).compile();

      adminStrategy = module.get<AdminStrategy>(AdminStrategy);
    });

    it('should throw an error if admin password does not match', () => {
      expect(() =>
        adminStrategy.validate('admin', 'notAdminPasswor'),
      ).toThrowError('Invalid admin credentials');
    });

    it('should return the user if the password match', () => {
      expect(() =>
        adminStrategy.validate('admin', 'adminPassword'),
      ).not.toThrow();
      expect(adminStrategy.validate('admin', 'adminPassword')).toStrictEqual({
        user: 'admin',
      });
    });
  });
});
