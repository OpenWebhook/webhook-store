import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlAuthGuard } from './gql-auth.guard';
import { WsContext } from '../context.type';

@Injectable()
export class WsAuthGuard extends GqlAuthGuard {
  getRequest(executionContext: ExecutionContext) {
    const ctx = GqlExecutionContext.create(executionContext);
    const req = ctx.getContext<
      WsContext & { req: { extra: { request: any } } }
    >().req.extra.request;
    return req;
  }
}
