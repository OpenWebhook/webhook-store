import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { option } from 'fp-ts';
import { getHostnameOrLocalhost } from '../../helpers/get-hostname/get-hostname.helper';
import { WsContext } from '../context.type';

export const extractHostnameFromRequest = (
  _data: unknown,
  executionContext: ExecutionContext,
) => {
  const request = executionContext.switchToHttp().getRequest();
  return getHostnameOrLocalhost(option.fromNullable(request.hostname));
};
export const Hostname = {
  fromRequest: createParamDecorator(extractHostnameFromRequest),

  fromGqlHttp: createParamDecorator(
    (_data: unknown, executionContext: ExecutionContext) => {
      const ctx = GqlExecutionContext.create(executionContext);
      const context = ctx.getContext();
      if (context && context.extractedHost) {
        return getHostnameOrLocalhost(
          option.fromNullable(context.extractedHost),
        );
      }
      return getHostnameOrLocalhost(option.fromNullable(context.req.hostname));
    },
  ),

  fromGqlWs: createParamDecorator(
    (_data: unknown, executionContext: ExecutionContext) => {
      const ctx = GqlExecutionContext.create(executionContext);
      const context = ctx.getContext<WsContext>();
      return context.extractedHost;
    },
  ),
};
