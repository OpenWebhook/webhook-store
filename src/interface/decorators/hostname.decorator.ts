import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getHostnameOrLocalhost } from '../../helpers/get-hostname/get-hostname.helper';

export const Hostname = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const context = ctx.getContext();
    if (context && context.extractedHost) {
      return getHostnameOrLocalhost(context.extractedHost);
    }
    return getHostnameOrLocalhost(context.req.hostname);
  },
);
