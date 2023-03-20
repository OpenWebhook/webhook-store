import { UserGuard } from './user.guard';

describe('UserGuard', () => {
  describe('canActivate', () => {
    it('should return true if the user is defined and the audience match the hostname', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: { canRead: true }, audience: 'localhost' } },
          'localhost',
        ),
      ).toBe(true);
    });

    it('should return false if the user audience does not match the hostname', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: { canRead: true }, audience: 'localhost' } },
          'localhost2',
        ),
      ).toBe(false);
    });

    it('should return false if the user is undefined', () => {
      expect(
        UserGuard.internalCanActivate({ user: undefined }, 'localhost2'),
      ).toBe(false);
    });

    it('should return false if the user accessRight is undefined', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: undefined } },
          'localhost2',
        ),
      ).toBe(false);
    });

    it('should return false if the user accessRight read access is undefined', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: { canRead: undefined } } },
          'localhost2',
        ),
      ).toBe(false);
    });

    it('should return false if the user accessRight read access is false', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: { canRead: false } } },
          'localhost2',
        ),
      ).toBe(false);
    });

    it('should return false if the user audience is undefined', () => {
      expect(
        UserGuard.internalCanActivate(
          { user: { accessRights: { canRead: true }, audience: undefined } },
          'localhost2',
        ),
      ).toBe(false);
    });
  });
});
