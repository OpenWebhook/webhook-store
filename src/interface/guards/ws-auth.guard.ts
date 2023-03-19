import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql-auth.guard';
import { WsContext } from '../context.type';

@Injectable()
export class WsAuthGuard extends GqlAuthGuard {
  getRequest(executionContext: ExecutionContext) {
    const ctx = GqlExecutionContext.create(executionContext);
    const accessToken = ctx.getContext<
      WsContext & { req: { extra: { accessToken?: string } } }
    >().req.extra.accessToken;
    return { headers: { authorization: `Bearer ${accessToken}` } };
  }
}
