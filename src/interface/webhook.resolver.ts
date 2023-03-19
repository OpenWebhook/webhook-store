import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { WebhookService } from '../application/webhook/webhook.service';
import { pubSub } from '../infrastructure/pubsub';
import { Hostname } from './decorators/hostname.decorator';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { WebhookModel } from './webhook.model';
import { WebhooksQueryArgs } from './webhooks.query-args';

@Resolver(() => WebhookModel)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookModel])
  @UseGuards(GqlAuthGuard)
  webhooks(
    @Args() webhooksQueryArgs: WebhooksQueryArgs,
    @Hostname.fromGqlHttp() hostname: string,
  ): Promise<WebhookModel[]> {
    return this.webhookService.getWebhooks(hostname, webhooksQueryArgs)();
  }

  @Subscription(() => WebhookModel)
  @UseGuards(WsAuthGuard)
  webhookAdded(@Hostname.fromGqlWs() hostname: string) {
    return pubSub.asyncIterator(`webhookAdded_${hostname}`);
  }
}
