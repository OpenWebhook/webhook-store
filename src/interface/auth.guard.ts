import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { userStrayegyName } from '../application/auth/jwt.strategy';
import authConfig from '../config/auth.config';

@Injectable()
export class UserGuard extends PassportAuthGuard(userStrayegyName) {
  private readonly isProtected: boolean;
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    super();
    this.isProtected = config.isProtected;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isProtected) {
      return super.canActivate(context);
    }
    return true;
  }
}
