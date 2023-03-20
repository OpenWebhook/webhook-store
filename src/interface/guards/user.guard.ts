import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { userPassportStrayegyName } from '../../application/auth/jwt.strategy';
import authConfig from '../../config/auth.config';
import { extractHostnameFromRequest } from '../decorators/hostname.decorator';

@Injectable()
export class UserGuard extends AuthGuard(userPassportStrayegyName) {
  private readonly isProtected: boolean;
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    super();
    this.isProtected = config.isProtected;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isProtected) {
      const res = (await super.canActivate(context)) as boolean;
      if (!res) return false;

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) return false;
      if (!user.accessRights) return false;
      if (!user.accessRights.canRead) return false;
      if (!user.audience) return false;

      const hostname = extractHostnameFromRequest(null, context);

      if (user.audience != hostname) return false;

      return true;
    }
    return true;
  }
}
