import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { userPassportStrayegyName } from '../../application/auth/jwt.strategy';
import authConfig from '../../config/auth.config';
import { WsContext } from '../context.type';

@Injectable()
export class WsAuthGuard extends AuthGuard(userPassportStrayegyName) {
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
      // audience check is done in the GQL Ws provider
      return super.canActivate(context);
    }
    return true;
  }

  getRequest(executionContext: ExecutionContext) {
    const ctx = GqlExecutionContext.create(executionContext);
    const accessToken = ctx.getContext<
      WsContext & { req: { extra: { accessToken?: string } } }
    >().req.extra.accessToken;
    return { headers: { authorization: `Bearer ${accessToken}` } };
  }
}
