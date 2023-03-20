import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import authConfig from '../../config/auth.config';

export const adminPassportStrategyName = 'admin-basic';

@Injectable()
export class AdminStrategy extends PassportStrategy(
  BasicStrategy,
  adminPassportStrategyName,
) {
  private readonly adminPassword: string | undefined;
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    super();
    this.adminPassword = config.adminPassword;
  }

  validate(username: string, password: string): { user: 'admin' } {
    if (!this.adminPassword) {
      throw new ForbiddenException('Admin password is not defined in config');
    }
    if (username === 'admin' && password === this.adminPassword) {
      return { user: 'admin' };
    }
    throw new ForbiddenException('Invalid admin credentials');
  }
}
