import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  Args,
  GqlExecutionContext,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { AppService } from '../application/app.service';
import { pubSub } from '../infrastructure/pubsub';
import { WebhookModel } from './webhook.model';
import { WebhooksQueryArgs } from './webhooks.query-args';

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
    @Args() webhooksQueryArgs: WebhooksQueryArgs,
    @Hostname() hostname: string,
  ): Promise<WebhookModel[]> {
    return this.appService.getWebhooks(hostname, webhooksQueryArgs);
  }

  @Subscription(() => WebhookModel)
  webhookAdded(@Hostname() hostname: string) {
    return pubSub.asyncIterator(`webhookAdded_${hostname}`);
  }
}
