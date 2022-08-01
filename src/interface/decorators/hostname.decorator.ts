import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { option } from 'fp-ts';
import { getHostnameOrLocalhost } from '../../helpers/get-hostname/get-hostname.helper';

export const Hostname = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const context = ctx.getContext<{
      extractedHost: string | null | undefined;
      req: { hostname: string | null | undefined };
    }>();
    if (context && context.extractedHost) {
      return getHostnameOrLocalhost(option.fromNullable(context.extractedHost));
    }
    return getHostnameOrLocalhost(option.fromNullable(context.req.hostname));
  },
);
