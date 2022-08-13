import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class ReplayWebhookArgs {
  @Field(() => ID, { nullable: false })
  webhookId!: string;

  @Field(() => String, { nullable: false })
  target!: string;
}
