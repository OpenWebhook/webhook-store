import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Webhook } from '@prisma/client';

@ObjectType()
export class WebhookModel implements Partial<Webhook> {
  @Field(() => ID)
  id: number;
}
