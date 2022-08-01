import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { option } from 'fp-ts';
import { getHostnameOrLocalhost } from '../../helpers/get-hostname/get-hostname.helper';
import { WsContext } from '../context.type';
import { Request } from 'express';

export const Hostname = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const request = executionContext.switchToHttp().getRequest();
    return getHostnameOrLocalhost(option.fromNullable(request.hostname));
  },
);

export const HostnameGqlHttp = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const request = ctx.getContext<Request>();
    return getHostnameOrLocalhost(option.fromNullable(request.hostname));
  },
);

export const HostnameWs = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const context = ctx.getContext<WsContext>();
    return context.extractedHost;
  },
);
