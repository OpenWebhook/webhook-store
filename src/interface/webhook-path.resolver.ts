import { Query, Resolver } from '@nestjs/graphql';
import { WebhookService } from '../application/webhook/webhook.service';
import { Hostname } from './decorators/hostname.decorator';
import { WebhookPathModel } from './webhook-path.model';
import { WebhookModel } from './webhook.model';

@Resolver(() => WebhookModel)
export class WebhookPathResolver {
  constructor(private readonly appService: WebhookService) {}

  @Query(() => [WebhookPathModel])
  async webhookPaths(
    @Hostname.fromGqlHttp() hostname: string,
  ): Promise<WebhookPathModel[]> {
    const webhookPaths = await this.appService.getWebhooksPath(hostname);
    return webhookPaths;
  }
}
