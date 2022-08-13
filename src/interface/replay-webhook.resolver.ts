import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JsonRecord } from 'fp-ts/lib/Json';
import { ProxyService } from '../application/proxy-response/proxy.service';
import { WebhookService } from '../application/webhook/webhook.service';
import { Hostname } from './decorators/hostname.decorator';
import { ResponseModel } from './response.model';
import { WebhookModel } from './webhook.model';
import { ReplayWebhookArgs } from './webhooks.mutation-args';

@Resolver(() => WebhookModel)
export class ReplayWebhookResolver {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly webhookService: WebhookService,
  ) {}
  @Mutation(() => ResponseModel)
  async replayWebhook(
    @Args() { webhookId, target }: ReplayWebhookArgs,
    @Hostname.fromGqlHttp() hostname: string,
  ): Promise<ResponseModel> {
    const webhook = await this.webhookService.getWebhookById(
      webhookId,
      hostname,
    );
    if (webhook == null) {
      throw new NotFoundException(`Webhook does not exist`);
    }
    const response = await this.proxyService.sendAndStoreWebhookToTarget(
      target,
      webhook.body as JsonRecord,
      (webhook.headers || {}) as Record<string, string>,
      webhook.path,
      webhook.id,
      hostname,
    );
    if (response._tag === 'Left') {
      throw response.left;
    }
    return { id: response.right.id, webhookId };
  }
}
