import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { WebhookService } from '../application/webhook/webhook.service';
import { pubSub } from '../infrastructure/pubsub';
import { HostnameHttp, HostnameWs } from './decorators/hostname.decorator';
import { WebhookModel } from './webhook.model';
import { WebhooksQueryArgs } from './webhooks.query-args';

@Resolver(() => WebhookModel)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookModel])
  webhooks(
    @Args() webhooksQueryArgs: WebhooksQueryArgs,
    @HostnameHttp() hostname: string,
  ): Promise<WebhookModel[]> {
    return this.webhookService.getWebhooks(hostname, webhooksQueryArgs);
  }

  @Subscription(() => WebhookModel)
  webhookAdded(@HostnameWs() hostname: string) {
    return pubSub.asyncIterator(`webhookAdded_${hostname}`);
  }
}
