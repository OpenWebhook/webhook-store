import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { AppService } from './app.service';
import { pubSub } from './pubsub';
import { WebhookModel } from './webhook.model';

@Resolver(() => WebhookModel)
export class WebhookResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [WebhookModel])
  webhooks(): Promise<WebhookModel[]> {
    return this.appService.getWebhooks();
  }

  @Subscription(() => WebhookModel)
  webhookAdded() {
    return pubSub.asyncIterator('webhookAdded');
  }
}
