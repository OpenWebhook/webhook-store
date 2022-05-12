import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Webhook } from '@prisma/client';

@ObjectType()
export class WebhookModel implements Partial<Webhook> {
  @Field(() => ID)
  id: number;

  @Field()
  path: string;

  @Field()
  host: string;

  @Field()
  body: string;

  @Field()
  headers: string;

  @Field()
  receivedAt: Date;
}
