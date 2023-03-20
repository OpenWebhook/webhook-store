import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import authConfig from '../../config/auth.config';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { userPassportStrayegyName } from '../../application/auth/jwt.strategy';
import { extractHostnameFromGqlRequest } from '../decorators/hostname.decorator';

@Injectable()
export class GqlAuthGuard extends PassportAuthGuard(userPassportStrayegyName) {
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
      const user = request.user;

      if (!user) return false;
      if (!user.accessRights) return false;
      if (!user.accessRights.canRead) return false;
      if (!user.audience) return false;

      const hostname = extractHostnameFromGqlRequest(null, context);

      if (user.audience != hostname) return false;

      return true;
    }
    return true;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }
}
