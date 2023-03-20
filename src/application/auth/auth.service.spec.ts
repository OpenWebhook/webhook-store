import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import authConfig from '../../config/auth.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [authConfig] })],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthMetadata', () => {
    it('should return the correct auth metadata for public store', () => {
      const config = {
        isProtected: false,
        ghOrg: undefined,
      };
      const authMetadata = AuthService.getAuthMetadata(config);
      expect(authMetadata).toEqual({
        protected: false,
      });
    });

    it('should return the correct auth metadata for public store evn if there is ghOrg defined', () => {
      const config = {
        isProtected: false,
        ghOrg: 'test-org',
      };
      const authMetadata = AuthService.getAuthMetadata(config);
      expect(authMetadata).toEqual({
        protected: false,
      });
    });

    it('should return the correct auth metadata for GH org protection', () => {
      const config = {
        isProtected: true,
        ghOrg: 'test-org',
      };
      const authMetadata = AuthService.getAuthMetadata(config);
      expect(authMetadata).toEqual({
        protected: true,
        protectionRule: 'github-org',
        ghOrg: 'test-org',
      });
    });

    it('should return the correct auth metadata for GH org for default protection', () => {
      const config = {
        isProtected: true,
        ghOrg: undefined,
      };
      const authMetadata = AuthService.getAuthMetadata(config);
      expect(authMetadata).toEqual({
        protected: true,
        protectionRule: 'hostname webhook.store',
      });
    });
  });

  describe('assertJwtAudienceAndHostnameMatch', () => {
    it('should throw an error if the JWT is malformed', () => {
      const JWT = 'QDZQDSDQ';
      const hostname = 'test-hostname';
      expect(() => {
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname);
      }).toThrow();
    });

    it('should throw an error if the JWT is undefined', () => {
      const JWT = undefined;
      const hostname = 'test-hostname';
      expect(() => {
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname);
      }).toThrow();
    });

    it('should throw an error if the hostname is undefined', () => {
      const JWT = 'JWT';
      const hostname = undefined;
      expect(() => {
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname);
      }).toThrow();
    });

    it('should throw an error if the jwt audience and hostname do not match', () => {
      const JWT = 'croute.eyJhdWQiOiJ0ZXN0LWhvc3RuYW1lIn0=.croute';
      const hostname = 'another-test-hostname';
      expect(() => {
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname);
      }).toThrow();
    });

    it('should throw an error if the jwt audience and hostname do not match', () => {
      const JWT = 'croute.eyJhdWQiOiJ0ZXN0LWhvc3RuYW1lIn0=.croute';
      const hostname = 'test-hostname';
      expect(() => {
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname);
      }).not.toThrow();

      expect(
        AuthService.assertJwtAudienceAndHostnameMatch(JWT, hostname),
      ).toBeTruthy();
    });
  });
});
