import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WebhookPathModel {
  @Field(() => ID)
  path!: string;
}
