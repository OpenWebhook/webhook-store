import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { extractHostnameFromGqlRequest } from '../decorators/hostname.decorator';
import { UserGuard } from './user.guard';

@Injectable()
export class GqlAuthGuard extends UserGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return req;
  }

  extractHostnameFromContext(context: ExecutionContext) {
    return extractHostnameFromGqlRequest(null, context);
  }
}
