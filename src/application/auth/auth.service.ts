import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from '../../config/auth.config';

export type AuthMetadata =
  | { protected: true; protectionRule: 'hostname webhook.store' }
  | { protected: true; protectionRule: 'github-org'; ghOrg: string }
  | { protected: false };
@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  getAuthMetadata(): AuthMetadata {
    return AuthService.getAuthMetadata(this.config);
  }

  static getAuthMetadata(
    config: Pick<ConfigType<typeof authConfig>, 'isProtected' | 'ghOrg'>,
  ): AuthMetadata {
    if (!config.isProtected) {
      return { protected: false };
    } else {
      if (config.ghOrg) {
        return {
          protected: true,
          protectionRule: 'github-org',
          ghOrg: config.ghOrg,
        };
      } else {
        return { protected: true, protectionRule: 'hostname webhook.store' };
      }
    }
  }

  static assertJwtAudienceAndHostnameMatch(
    jwt: string | undefined,
    hostname: string | undefined,
  ) {
    if (!jwt) throw 'JWT is undefined';
    if (!hostname) throw 'hostname is undefined';
    const encryptedPayload = jwt.split('.')[1];
    const decryptedStringifiedPayload = Buffer.from(
      encryptedPayload,
      'base64',
    ).toString();
    const jwtPayload = JSON.parse(decryptedStringifiedPayload);
    if (jwtPayload.aud != hostname)
      throw 'JWT audience does not match hostname';
    return true;
  }
}
