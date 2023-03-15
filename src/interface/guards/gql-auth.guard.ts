import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import authConfig from '../../config/auth.config';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { userPassportStrayegyName } from '../../application/auth/jwt.strategy';

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

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.isProtected) {
      return super.canActivate(context);
    }
    return true;
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }
}
