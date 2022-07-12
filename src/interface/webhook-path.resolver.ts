import { Query, Resolver } from '@nestjs/graphql';
import { WebhookPathModel } from './webhook-path.model';
import { WebhookModel } from './webhook.model';

@Resolver(() => WebhookModel)
export class WebhookPathResolver {
  @Query(() => [WebhookPathModel])
  async webhookPaths(): Promise<WebhookPathModel[]> {
    return [];
  }
}
