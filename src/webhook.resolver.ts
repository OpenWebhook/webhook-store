import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { AppService } from './app.service';
import { PaginationArgs } from './pagination';
import { pubSub } from './pubsub';
import { WebhookModel } from './webhook.model';

@Resolver(() => WebhookModel)
export class WebhookResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [WebhookModel])
  webhooks(@Args() paginationArgs: PaginationArgs): Promise<WebhookModel[]> {
    return this.appService.getWebhooks(paginationArgs);
  }

  @Subscription(() => WebhookModel)
  webhookAdded() {
    return pubSub.asyncIterator('webhookAdded');
  }
}
