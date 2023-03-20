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

      const request = this.getRequest(context);
      const hostname = this.extractHostnameFromContext(context);

      return UserGuard.internalCanActivate(request, hostname);
    }
    return true;
  }

  static internalCanActivate(
    request: {
      user?: { accessRights?: { canRead?: boolean }; audience?: string };
    },
    hostname: string,
  ): boolean {
    const user = request.user;
    if (!user) return false;
    if (!user.accessRights) return false;
    if (!user.accessRights.canRead) return false;
    if (!user.audience) return false;
    if (user.audience != hostname) return false;

    return true;
  }

  extractHostnameFromContext(context: ExecutionContext) {
    return extractHostnameFromRequest(null, context);
  }

  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    return req;
  }
}
