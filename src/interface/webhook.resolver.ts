import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AppService } from '../application/app.service';
import { pubSub } from '../infrastructure/pubsub';
import { Hostname } from './decorators/hostname.decorator';
import { WebhookModel } from './webhook.model';
import { WebhooksQueryArgs } from './webhooks.query-args';

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
