import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  Args,
  GqlExecutionContext,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AppService } from './app.service';
import { PaginationArgs } from './pagination';
import { pubSub } from './pubsub';
import { WebhookModel } from './webhook.model';

const Hostname = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const context = ctx.getContext();
    if (context && context.extractedHost) {
      return context.extractedHost;
    }
    return context.req.hostname;
  },
);

@Resolver(() => WebhookModel)
export class WebhookResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [WebhookModel])
  webhooks(
    @Args() paginationArgs: PaginationArgs,
    @Hostname() hostname,
  ): Promise<WebhookModel[]> {
    return this.appService.getWebhooks(hostname, paginationArgs);
  }

  @Subscription(() => WebhookModel)
  webhookAdded(@Hostname() hostname) {
    console.log('hostname dans le webhook', hostname);
    return pubSub.asyncIterator('webhookAdded');
  }
}
