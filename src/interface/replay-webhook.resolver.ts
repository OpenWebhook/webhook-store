import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ResponseModel } from './response.model';
import { WebhookModel } from './webhook.model';
import { ReplayWebhookArgs } from './webhooks.mutation-args';

@Resolver(() => WebhookModel)
export class ReplayWebhookResolver {
  @Mutation(() => ResponseModel)
  replayWebhook(
    @Args() { webhookId, target }: ReplayWebhookArgs,
  ): ResponseModel {
    console.log(webhookId);
    console.log(target);
    return { id: 'rs-ceroute', webhookId };
  }
}
